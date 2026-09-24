import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { assertDefaultSurface } from "./board_mode_helpers.js";

const BASE_URL = process.env.SURVEY_TEST_URL || "http://127.0.0.1:8765";
const ARTIFACT_DIR = resolve("artifacts");
const CHECKS = [];
const ERRORS = [];
const EXPECTED_CONTEXT_LOSS = new WeakSet();
const CHINESE = /[\u3400-\u9fff]/;

function passed(name, evidence = {}) {
  CHECKS.push({ name, ...evidence });
  console.log(`PASS ${name}`);
}

function watchErrors(page, label) {
  page.on("pageerror", (error) => ERRORS.push(`${label}: ${error.message}`));
  page.on("console", (message) => {
    if (
      EXPECTED_CONTEXT_LOSS.has(page) &&
      /^(?:THREE\.WebGLRenderer: Context Lost\.|3D rendering unavailable; accessible grid enabled\. WebGL context lost)$/.test(
        message.text(),
      )
    )
      return;
    if (
      message.type() === "error" ||
      /WebGL.*(?:error|context lost)|GL_INVALID|shader.*failed/i.test(
        message.text(),
      )
    )
      ERRORS.push(`${label}: ${message.text()}`);
  });
}

async function frames(page, count = 3) {
  await page.evaluate(
    (total) =>
      new Promise((resolve) => {
        const step = () =>
          --total <= 0 ? resolve() : requestAnimationFrame(step);
        requestAnimationFrame(step);
      }),
    count,
  );
}

async function openGame(page) {
  page.setDefaultTimeout(15000);
  await page.goto(`${BASE_URL}/?test=1`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__surveyTest?.getScene()?.renderer);
  await page.locator("#language-select").waitFor({ state: "visible" });
}

async function changeLanguage(page, locale) {
  await page.locator("#language-select").selectOption(locale);
  await page.waitForFunction(
    (expected) => document.documentElement.lang === expected,
    locale,
  );
  assert.equal(await page.locator("#language-select").inputValue(), locale);
  assert.equal(
    await page.evaluate(() => localStorage.getItem("void-survey.locale")),
    locale,
  );
}

async function expectLanguage(page, locale) {
  const chinese = locale === "zh-CN";
  assert.equal(await page.locator("html").getAttribute("lang"), locale);
  for (const selector of [
    "#status-label",
    "#status-description",
    "#cell-readout",
    "#surface-current",
  ]) {
    const text = (await page.locator(selector).textContent()).trim();
    assert.ok(text.length > 0, `${selector} must not lose its current text`);
    assert.equal(
      CHINESE.test(text),
      chinese,
      `${selector} must match ${locale}`,
    );
  }
  for (const selector of [
    "#help-btn",
    "#sound-toggle",
    "#music-toggle",
    "#board-accessibility",
  ]) {
    const label = await page.locator(selector).getAttribute("aria-label");
    assert.ok(label, `${selector} must retain an accessible label`);
    assert.equal(
      CHINESE.test(label),
      chinese,
      `${selector} ARIA must match ${locale}`,
    );
  }
  assert.match(
    await page.locator("#reveal-mode").textContent(),
    chinese ? /探索/ : /Explore/,
  );
  assert.match(
    await page.locator("#flag-mode").textContent(),
    chinese ? /标记/ : /Mark/,
  );
  assert.match(
    await page.locator('label[for="surface-irregularity"]').textContent(),
    chinese ? /凹陷深度/ : /Recess depth/,
  );
  assert.match(
    await page.locator('#board-mode option[value="surface"]').textContent(),
    chinese ? /凹陷立方体/ : /Carved cube/,
  );
}

async function gameState(page) {
  return page.evaluate(() => {
    const game = window.__surveyTest.getGame();
    return {
      status: game.status,
      mines: game.mines,
      revealedCount: game.revealedCount,
      flagCount: game.flagCount,
      cells: game.cells.map((cell) => ({ ...cell })),
    };
  });
}

async function activateCell(page, id, options = {}) {
  await page.locator("#scene-stage canvas").scrollIntoViewIfNeeded();
  // 只用公开相机接口转向目标格，探索和标记始终发送真实鼠标事件。
  const point = await page.evaluate((cellId) => {
    const scene = window.__surveyTest.getScene();
    if (window.__surveyTest.getGame().topology) scene.focus(cellId);
    return scene.projectCell(cellId);
  }, id);
  assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y));
  assert.notEqual(point.visible, false, `Tile ${id} must be visible`);
  await page.mouse.click(point.x, point.y, options);
}

async function revealFirst(page) {
  const id = await page.evaluate(() => {
    const game = window.__surveyTest.getGame();
    const n = game.topology?.resolution;
    return n
      ? Math.floor(n / 2) * n + Math.floor(n / 2)
      : Math.floor(game.height / 2) * game.width + Math.floor(game.width / 2);
  });
  await activateCell(page, id);
  await page.waitForFunction(
    () => window.__surveyTest.getGame().status === "playing",
  );
  return id;
}

async function showSettings(page) {
  if (!(await page.locator("#board-mode").isVisible()))
    await page.locator("#settings-btn").click();
}

async function setDraft(page) {
  await showSettings(page);
  if (
    !(await page
      .locator("#surface-generator")
      .evaluate((element) => element.open))
  )
    await page.locator("#surface-generator > summary").click();
  await page.locator("#surface-shape").selectOption("terrace");
  for (const [selector, key, arrows] of [
    ["#surface-area", "Home", 4],
    ["#surface-density", "Home", 4],
    ["#surface-irregularity", "End", -2],
  ]) {
    await page.locator(selector).focus();
    await page.keyboard.press(key);
    for (let i = 0; i < Math.abs(arrows); i++)
      await page.keyboard.press(arrows > 0 ? "ArrowRight" : "ArrowLeft");
  }
}

async function timerSeconds(page) {
  return page.locator("#timer").evaluate((element) => {
    const [minutes, seconds] = element.textContent.split(":").map(Number);
    return minutes * 60 + seconds;
  });
}

async function retainedState(page, retain = false) {
  return page.evaluate((save) => {
    const test = window.__surveyTest,
      game = test.getGame(),
      scene = test.getScene(),
      audio = test.getAudio();
    // 保存真实引用仅用于比较，不修改引擎、场景、相机或音频对象。
    if (save)
      window.__i18nRetained = { game, topology: game.topology, scene, audio };
    const saved = window.__i18nRetained;
    return {
      sameGame: saved.game === game,
      sameTopology: saved.topology === game.topology,
      sameScene: saved.scene === scene,
      sameAudio: saved.audio === audio,
      status: game.status,
      cells: game.cells.map((cell) => ({ ...cell })),
      revealedCount: game.revealedCount,
      flagCount: game.flagCount,
      camera: scene
        ? {
            position: scene.camera.position.toArray(),
            quaternion: scene.camera.quaternion.toArray(),
            up: scene.camera.up.toArray(),
            target: scene.controls.target.toArray(),
            zoom: scene.camera.zoom,
          }
        : null,
      inputMode: document.body.dataset.inputMode,
      boardMode: document.body.dataset.boardMode,
      draft: [
        "surface-shape",
        "surface-area",
        "surface-density",
        "surface-irregularity",
      ].map((id) => document.getElementById(id).value),
      draftOpen: document.getElementById("surface-generator").open,
      audio: { enabled: audio.enabled, musicEnabled: audio.musicEnabled },
    };
  }, retain);
}

async function inspectDialogs(page, locale) {
  await changeLanguage(page, locale);
  const chinese = locale === "zh-CN";
  await page.locator("#help-btn").click();
  await page.locator("#help-dialog").waitFor({ state: "visible" });
  assert.equal(
    CHINESE.test(await page.locator("#help-title").textContent()),
    chinese,
  );
  assert.equal(
    CHINESE.test(
      await page.locator("#help-dialog .dialog-intro").textContent(),
    ),
    chinese,
  );
  assert.equal(
    CHINESE.test(
      await page
        .locator("#help-dialog [data-close-dialog]")
        .first()
        .getAttribute("aria-label"),
    ),
    chinese,
  );
  await page.keyboard.press("Escape");
  await page.locator("#new-game").click();
  await page.locator("#confirm-dialog").waitFor({ state: "visible" });
  for (const id of [
    "confirm-title",
    "confirm-description",
    "confirm-accept",
    "confirm-cancel",
  ])
    assert.equal(
      CHINESE.test(await page.locator(`#${id}`).textContent()),
      chinese,
      `${id} must match ${locale}`,
    );
  await page.locator("#confirm-cancel").click();
}

await mkdir(ARTIFACT_DIR, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  // 浏览器偏好中文仍应默认英文，只有显式选择才能持久化界面语言。
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    locale: "zh-CN",
  });
  const page = await context.newPage();
  watchErrors(page, "i18n-desktop");
  await openGame(page);
  await assertDefaultSurface(page);
  assert.deepEqual(
    await page
      .locator("#language-select option")
      .evaluateAll((options) => options.map((option) => option.value)),
    ["en", "zh-CN"],
  );
  await expectLanguage(page, "en");
  await changeLanguage(page, "zh-CN");
  await expectLanguage(page, "zh-CN");
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__surveyTest?.getScene()?.renderer);
  await expectLanguage(page, "zh-CN");
  await changeLanguage(page, "en");
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__surveyTest?.getScene()?.renderer);
  await expectLanguage(page, "en");
  passed(
    "English is the real default and explicit Chinese or English choices survive reload",
  );

  await revealFirst(page);
  let game = await gameState(page);
  const flaggedId = game.cells.find((cell) => cell.mine && !cell.revealed).id;
  await activateCell(page, flaggedId, { button: "right" });
  assert.equal((await gameState(page)).cells[flaggedId].flagged, true);
  await setDraft(page);
  await page.locator("#flag-mode").click();
  await page.locator("#sound-toggle").click();
  await page.locator("#reset-camera").click();
  await frames(page, 8);
  await page.waitForFunction(
    () => document.getElementById("timer").textContent !== "00:00",
  );
  const beforeTimer = await timerSeconds(page);
  const beforeLanguage = await retainedState(page, true);
  assert.deepEqual(beforeLanguage.draft, ["terrace", "8", "12", "90"]);
  assert.deepEqual(beforeLanguage.audio, {
    enabled: false,
    musicEnabled: true,
  });
  for (const locale of ["zh-CN", "en", "zh-CN"]) {
    await changeLanguage(page, locale);
    await expectLanguage(page, locale);
    assert.deepEqual(
      await retainedState(page),
      beforeLanguage,
      "Changing language must preserve the same live game, camera, marks, drafts, input mode, and audio preferences",
    );
  }
  assert.ok(
    (await timerSeconds(page)) >= beforeTimer,
    "Changing language must not reset the timer",
  );
  await page.waitForFunction((previous) => {
    const [minutes, seconds] = document
      .getElementById("timer")
      .textContent.split(":")
      .map(Number);
    return minutes * 60 + seconds > previous;
  }, beforeTimer);
  const flaggedLabel = await page
    .locator(`#board-accessibility [data-cell-id="${flaggedId}"]`)
    .getAttribute("aria-label");
  assert.match(flaggedLabel, /标记/);
  for (const locale of ["en", "zh-CN"]) {
    await changeLanguage(page, locale);
    await page.locator("#scene-stage canvas").scrollIntoViewIfNeeded();
    const markedPoint = await page.evaluate((id) => {
      const scene = window.__surveyTest.getScene();
      scene.focus(id);
      return scene.projectCell(id);
    }, flaggedId);
    await page.mouse.move(markedPoint.x, markedPoint.y);
    await frames(page);
    assert.match(
      await page.locator("#cell-readout").textContent(),
      locale === "zh-CN" ? /标记/ : /Marked/,
    );
  }
  await page.screenshot({
    path: resolve(ARTIFACT_DIR, "i18n_desktop_zh.png"),
    fullPage: true,
  });
  passed(
    "Live locale changes retain the round, topology, camera, timer, flags, generator draft, mode, and sound choices",
  );

  const beforeDialogs = await gameState(page);
  for (const locale of ["zh-CN", "en"]) await inspectDialogs(page, locale);
  assert.deepEqual(
    await gameState(page),
    beforeDialogs,
    "Localized help and canceled reset dialogs must preserve the round",
  );
  await showSettings(page);
  await page.locator("#board-mode").selectOption("plane");
  await page.locator("#confirm-accept").click();
  await page.waitForFunction(
    () =>
      !window.__surveyTest.getGame().topology &&
      window.__surveyTest.getGame().status === "ready",
  );
  await page.locator("#preset-select").selectOption("custom");
  await page.locator("#custom-width").fill("4");
  const beforeInvalid = await gameState(page);
  await page.locator("#apply-btn").click();
  const englishError = (
    await page.locator("#config-error").textContent()
  ).trim();
  assert.ok(englishError.length > 0 && !CHINESE.test(englishError));
  await changeLanguage(page, "zh-CN");
  assert.match(await page.locator("#config-error").textContent(), CHINESE);
  assert.deepEqual(
    await gameState(page),
    beforeInvalid,
    "Invalid drafts and their translation must not replace the board",
  );
  await changeLanguage(page, "en");
  assert.equal(
    (await page.locator("#config-error").textContent()).trim(),
    englishError,
  );
  passed(
    "Help, reset confirmation, cell ARIA, and an existing validation error switch languages without destructive side effects",
  );

  await page.locator("#preset-select").selectOption("expert");
  await page.waitForFunction(
    () => window.__surveyTest.getGame().cells.length === 480,
  );
  await page.locator("#reveal-mode").click();
  await revealFirst(page);
  game = await gameState(page);
  const mineId = game.cells.find((cell) => cell.mine && !cell.flagged).id;
  // 逐帧只读采样，防止语言重绘在爆炸时间线未完结时提前泄露结果面板。
  await page.evaluate(() => {
    window.__i18nLossProbe = { stop: false, samples: 0, premature: false };
    const sample = () => {
      const probe = window.__i18nLossProbe;
      const scene = window.__surveyTest.getScene();
      if (scene?.detonation.active) {
        probe.samples++;
        probe.premature ||= !document.getElementById("result-panel").hidden;
      }
      if (!probe.stop) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await activateCell(page, mineId);
  await page.waitForFunction(
    () => window.__surveyTest.getGame().status === "lost",
  );
  const lostState = await gameState(page);
  assert.equal(
    await page.evaluate(() => window.__surveyTest.getScene().detonation.active),
    true,
  );
  await changeLanguage(page, "zh-CN");
  const duringChain = await page.evaluate(() => ({
    active: window.__surveyTest.getScene().detonation.active,
    hidden: document.getElementById("result-panel").hidden,
  }));
  assert.deepEqual(duringChain, { active: true, hidden: true });
  assert.match(await page.locator("#status-label").textContent(), CHINESE);
  await page.waitForFunction(
    () =>
      !window.__surveyTest.getScene().detonation.active &&
      !document.getElementById("result-panel").hidden,
  );
  const lossProbe = await page.evaluate(() => {
    window.__i18nLossProbe.stop = true;
    return window.__i18nLossProbe;
  });
  assert.ok(lossProbe.samples > 0);
  assert.equal(lossProbe.premature, false);
  assert.deepEqual(await gameState(page), lostState);
  for (const locale of ["zh-CN", "en"]) {
    await changeLanguage(page, locale);
    for (const selector of [
      "#result-title",
      "#result-description",
      "#result-restart",
    ])
      assert.equal(
        CHINESE.test(await page.locator(selector).textContent()),
        locale === "zh-CN",
      );
  }
  passed(
    "Changing language during a loss preserves the explosion chain and translates results only after completion",
    lossProbe,
  );

  await page.locator("#result-restart").click();
  await showSettings(page);
  await page.locator("#board-mode").selectOption("surface");
  await page.waitForFunction(
    () => window.__surveyTest.getGame().topology?.kind === "surface",
  );
  await revealFirst(page);
  const beforeFallback = await gameState(page);
  await retainedState(page, true);
  EXPECTED_CONTEXT_LOSS.add(page);
  await page.evaluate(() =>
    window.__surveyTest.getScene().renderer.forceContextLoss(),
  );
  await page.locator("#fallback-board").waitFor({ state: "visible" });
  await page.waitForFunction(() => !window.__surveyTest.getScene());
  assert.deepEqual(await gameState(page), beforeFallback);
  for (const locale of ["zh-CN", "en", "zh-CN"]) {
    await changeLanguage(page, locale);
    const retained = await retainedState(page);
    assert.equal(retained.sameGame, true);
    assert.equal(retained.sameTopology, true);
    assert.equal(retained.sameAudio, true);
    assert.equal(retained.camera, null);
    assert.deepEqual(await gameState(page), beforeFallback);
    assert.equal(
      CHINESE.test(await page.locator("#scene-status").textContent()),
      locale === "zh-CN",
    );
    assert.equal(
      CHINESE.test(
        await page.locator("#board-accessibility").getAttribute("aria-label"),
      ),
      locale === "zh-CN",
    );
    assert.equal(
      CHINESE.test(
        await page
          .locator("#fallback-board .surface-face-label")
          .first()
          .textContent(),
      ),
      locale === "zh-CN",
    );
  }
  const safeId = beforeFallback.cells.find(
    (cell) => !cell.mine && !cell.revealed,
  ).id;
  const safeButton = page.locator(`#fallback-board [data-cell-id="${safeId}"]`);
  assert.match(await safeButton.getAttribute("aria-label"), CHINESE);
  await safeButton.click();
  assert.equal((await gameState(page)).cells[safeId].revealed, true);
  await page.screenshot({
    path: resolve(ARTIFACT_DIR, "i18n_fallback_zh.png"),
    fullPage: true,
  });
  passed(
    "Localized WebGL fallback retains the original game and remains playable with translated grid and cell labels",
  );
  await context.close();

  for (const width of [375, 390]) {
    const mobileContext = await browser.newContext({
      viewport: { width, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      locale: "zh-CN",
    });
    const mobile = await mobileContext.newPage();
    watchErrors(mobile, `i18n-mobile-${width}`);
    await openGame(mobile);
    await expectLanguage(mobile, "en");
    for (const locale of ["zh-CN", "en", "zh-CN"]) {
      await changeLanguage(mobile, locale);
      await expectLanguage(mobile, locale);
      const layout = await mobile.evaluate(() => {
        const select = document.getElementById("language-select"),
          box = select.getBoundingClientRect();
        const hit = document.elementFromPoint(
          box.x + box.width / 2,
          box.y + box.height / 2,
        );
        return {
          viewport: innerWidth,
          document: document.documentElement.scrollWidth,
          body: document.body.scrollWidth,
          left: box.left,
          right: box.right,
          top: box.top,
          bottom: box.bottom,
          width: box.width,
          height: box.height,
          reachable: hit === select || select.contains(hit),
        };
      });
      assert.ok(
        layout.document <= layout.viewport + 1 &&
          layout.body <= layout.viewport + 1,
        `${width}px ${locale} must not create horizontal overflow`,
      );
      assert.ok(
        layout.left >= 0 &&
          layout.right <= width &&
          layout.top >= 0 &&
          layout.bottom <= 844,
      );
      assert.ok(
        layout.width >= 44 && layout.height >= 32 && layout.reachable,
        "The language selector must remain visible and reachable on a small touch screen",
      );
    }
    await mobile.screenshot({
      path: resolve(ARTIFACT_DIR, `i18n_mobile_${width}_zh.png`),
      fullPage: true,
    });
    await mobileContext.close();
    passed(
      `${width}px touch layout keeps the language entry reachable and both languages within the viewport`,
    );
  }
  assert.deepEqual(
    ERRORS,
    [],
    "Unexpected browser, shader, and WebGL errors must fail the i18n suite",
  );
  await writeFile(
    resolve(ARTIFACT_DIR, "i18n_browser_metrics.json"),
    `${JSON.stringify(CHECKS, null, 2)}\n`,
  );
  console.log(`Internationalization browser checks passed: ${CHECKS.length}`);
} catch (error) {
  if (ERRORS.length) console.error(ERRORS.join("\n"));
  throw error;
} finally {
  await browser.close();
}
