import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.SURVEY_TEST_URL || "http://127.0.0.1:8765";
const ARTIFACT_DIR = resolve("artifacts");
const BROWSER_ERRORS = [];
const CHECKS = [];
const EXPECTED_CONTEXT_LOSS = new WeakSet();

// 棋局操作经过真实输入；仅在降级测试中主动触发图形上下文丢失。
async function snapshot(page) {
  return page.evaluate(() => {
    const test = window.__surveyTest;
    const game = test.getGame();
    const scene = test.getScene();
    const audio = test.getAudio();
    const sequence = scene.detonation;
    return {
      game: {
        status: game.status,
        mines: game.mines,
        revealedCount: game.revealedCount,
        cells: game.cells.map((cell) => ({ ...cell })),
      },
      cursor: {
        focusId: scene.focusId,
        hoverId: scene.hoverId,
        visible: scene.cursor.visible,
      },
      sequence: {
        active: sequence.active,
        completed: sequence.completed,
        time: sequence.time,
        duration: sequence.duration,
        entries: sequence.entries.map((entry) => ({ ...entry })),
        fired: sequence.entries.filter((entry) => entry.fired).length,
        revealed: sequence.entries.filter((entry) => entry.revealed).length,
        visibleMines: scene.presentation.cells.filter(
          (cell) => cell.revealed && cell.mine,
        ).length,
      },
      audio: {
        enabled: audio.enabled,
        musicEnabled: audio.musicEnabled,
        contextState: audio.context?.state ?? null,
        unlocked: audio.unlocked,
        schedulerActive: audio.scheduler !== null,
        musicVoices: [...audio.voices].filter(
          (voice) => voice.group === "music",
        ).length,
        explosionVoices: [...audio.voices].filter(
          (voice) => voice.group === "sfx" && voice.explosion,
        ).length,
        mood: audio.mood,
      },
      resultHidden: document.getElementById("result-panel").hidden,
    };
  });
}

function passed(name) {
  CHECKS.push(name);
  console.log(`PASS ${name}`);
}

function watchErrors(page, label) {
  page.on("pageerror", (error) => {
    BROWSER_ERRORS.push(`${label}: ${error.message}`);
  });
  page.on("console", (message) => {
    // 只豁免本测试主动触发的两条标准上下文丢失提示，其他错误仍须失败。
    if (
      EXPECTED_CONTEXT_LOSS.has(page) &&
      /^(?:THREE\.WebGLRenderer: Context Lost\.|3D rendering unavailable; accessible grid enabled\. WebGL context lost)$/.test(
        message.text(),
      )
    )
      return;
    if (
      message.type() === "error" ||
      /(?:WebGL.*(?:error|context lost)|GL_INVALID|shader.*failed)/i.test(
        message.text(),
      )
    ) {
      BROWSER_ERRORS.push(`${label}: ${message.text()}`);
    }
  });
}

async function openGame(page) {
  page.setDefaultTimeout(15000);
  await page.goto(`${BASE_URL}/?test=1`, { waitUntil: "networkidle" });
  await page.waitForFunction(
    () =>
      window.__surveyTest?.getAudio &&
      window.__surveyTest.getScene()?.renderer &&
      window.__surveyTest.getScene()?.presentation?.cells.length,
  );
  await page.locator("#scene-stage canvas").waitFor({ state: "visible" });
}

async function projectCell(page, id) {
  const point = await page.evaluate(
    (cellId) => window.__surveyTest.getScene().projectCell(cellId),
    id,
  );
  assert.ok(
    Number.isFinite(point.x) && Number.isFinite(point.y),
    `Cell ${id} must have finite projected coordinates`,
  );
  return point;
}

async function clickCell(page, id) {
  const point = await projectCell(page, id);
  await page.mouse.click(point.x, point.y);
}

async function waitStatus(page, expected) {
  await page.waitForFunction(
    (status) => window.__surveyTest.getGame().status === status,
    expected,
  );
}

async function expectNoCursor(page, message) {
  await page.waitForFunction(() => {
    const scene = window.__surveyTest.getScene();
    return (
      scene.focusId === -1 && scene.hoverId === -1 && !scene.cursor.visible
    );
  });
  assert.deepEqual(
    (await snapshot(page)).cursor,
    { focusId: -1, hoverId: -1, visible: false },
    message,
  );
}

async function waitAudioRunning(page) {
  await page.waitForFunction(() => {
    const audio = window.__surveyTest.getAudio();
    return audio.context?.state === "running" && audio.unlocked;
  });
}

async function restart(page) {
  await page.locator("#new-game").click();
  if (await page.locator("#confirm-dialog").isVisible()) {
    await page.locator("#confirm-accept").click();
  }
  await waitStatus(page, "ready");
}

async function startLoss(page) {
  await clickCell(page, 40);
  await waitStatus(page, "playing");
  const game = (await snapshot(page)).game;
  const target = game.cells.find(
    (cell) => cell.mine && !cell.flagged && !cell.revealed,
  );
  assert.ok(target, "A playing round must contain a covered mine");
  await clickCell(page, target.id);
  await waitStatus(page, "lost");
  return target.id;
}

await mkdir(ARTIFACT_DIR, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  const context = await browser.newContext({
    viewport: { width: 1360, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  watchErrors(page, "polish-desktop");
  await openGame(page);
  let state = await snapshot(page);
  assert.equal(
    state.audio.contextState,
    null,
    "Audio must wait for a user gesture",
  );
  assert.equal(state.audio.enabled, true);
  assert.equal(state.audio.musicEnabled, true);
  assert.equal(
    await page.locator("#sound-toggle").getAttribute("aria-pressed"),
    "true",
  );
  assert.equal(
    await page.locator("#music-toggle").getAttribute("aria-pressed"),
    "true",
  );

  await clickCell(page, 40);
  await waitStatus(page, "playing");
  await page.mouse.move(3, 3);
  await expectNoCursor(
    page,
    "Pointer departure must clear both hover and keyboard selection",
  );
  await waitAudioRunning(page);
  await page.waitForFunction(() => {
    const audio = window.__surveyTest.getAudio();
    return (
      audio.scheduler !== null &&
      [...audio.voices].some((voice) => voice.group === "music")
    );
  });
  await page.screenshot({
    path: resolve(ARTIFACT_DIR, "polish_cursor_cleared.png"),
    fullPage: true,
  });
  passed(
    "first pointer reveal clears its cursor after departure and unlocks music",
  );

  // 聚焦容器只定位键盘入口，选择变更必须由真实方向键驱动。
  await page.locator("#scene-stage").focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(() => {
    const scene = window.__surveyTest.getScene();
    return scene.focusId === 41 && scene.hoverId === -1 && scene.cursor.visible;
  });
  assert.equal(
    await page
      .locator('#board-accessibility [data-cell-id="41"]')
      .evaluate((element) => element === document.activeElement),
    true,
    "Arrow navigation must synchronize keyboard focus with the 3D cursor",
  );
  await page.keyboard.press("ArrowLeft");
  assert.equal((await snapshot(page)).cursor.focusId, 40);
  await page.locator("#help-btn").click();
  await page.keyboard.press("Escape");
  await expectNoCursor(
    page,
    "Leaving the board for a toolbar action must clear the keyboard cursor",
  );
  passed("keyboard navigation shows the cursor and focus departure clears it");

  await page.locator("#sound-toggle").click();
  state = await snapshot(page);
  assert.equal(state.audio.enabled, false);
  assert.equal(state.audio.musicEnabled, true);
  assert.equal(state.audio.schedulerActive, true);
  assert.ok(
    state.audio.musicVoices > 0,
    "Muting sound effects must preserve music voices",
  );
  assert.equal(
    await page.locator("#sound-toggle").getAttribute("aria-pressed"),
    "false",
  );
  assert.equal(
    await page.locator("#music-toggle").getAttribute("aria-pressed"),
    "true",
  );
  await page.locator("#music-toggle").click();
  state = await snapshot(page);
  assert.equal(state.audio.enabled, false);
  assert.equal(state.audio.musicEnabled, false);
  assert.equal(state.audio.schedulerActive, false);
  assert.equal(state.audio.musicVoices, 0);
  await page.locator("#sound-toggle").click();
  state = await snapshot(page);
  assert.equal(state.audio.enabled, true);
  assert.equal(state.audio.musicEnabled, false);
  assert.equal(state.audio.schedulerActive, false);
  await page.locator("#music-toggle").click();
  await page.waitForFunction(() => {
    const audio = window.__surveyTest.getAudio();
    return audio.enabled && audio.musicEnabled && audio.scheduler !== null;
  });
  assert.equal(
    await page.locator("#sound-toggle").getAttribute("aria-label"),
    "关闭音效",
  );
  assert.equal(
    await page.locator("#music-toggle").getAttribute("aria-label"),
    "关闭背景音乐",
  );
  passed(
    "music and sound effects toggle independently without silent preference changes",
  );

  await restart(page);
  const firstMine = await startLoss(page);
  state = await snapshot(page);
  const total = state.game.mines;
  assert.equal(state.sequence.entries.length, total);
  assert.equal(
    state.sequence.entries[0].id,
    firstMine,
    "The clicked mine must detonate first",
  );
  assert.equal(state.sequence.active, true);
  assert.equal(state.sequence.completed, false);
  assert.ok(
    state.sequence.fired < total,
    "A loss must not detonate every mine immediately",
  );
  assert.ok(
    state.sequence.visibleMines < total,
    "A loss must not display every mine immediately",
  );
  assert.equal(
    state.resultHidden,
    true,
    "The result must wait for the chain to complete",
  );
  await page.screenshot({
    path: resolve(ARTIFACT_DIR, "polish_chain_early.png"),
    fullPage: true,
  });

  const samples = [state.sequence];
  let sawExplosionAudio = state.audio.explosionVoices > 0;
  const deadline = Date.now() + 45000;
  // 采样真实动画时钟，允许低帧率跳过少量状态，但不能一帧跳到全部完成。
  while (!state.sequence.completed && Date.now() < deadline) {
    await page.waitForTimeout(110);
    state = await snapshot(page);
    const previous = samples.at(-1);
    assert.ok(
      state.sequence.time >= previous.time,
      "Detonation time must not move backwards",
    );
    assert.ok(
      state.sequence.fired >= previous.fired,
      "Fired mine count must increase monotonically",
    );
    assert.ok(
      state.sequence.fired <= state.sequence.revealed,
      "A mine must become visible before exploding",
    );
    if (state.sequence.active)
      assert.equal(
        state.resultHidden,
        true,
        "The result must stay hidden while detonating",
      );
    sawExplosionAudio ||= state.audio.explosionVoices > 0;
    samples.push(state.sequence);
  }
  assert.equal(
    state.sequence.completed,
    true,
    "The chain must finish within its real-browser timeout",
  );
  assert.equal(state.sequence.active, false);
  assert.equal(state.sequence.fired, total);
  assert.equal(state.sequence.visibleMines, total);
  assert.ok(
    new Set(samples.map((sample) => sample.fired)).size >= 4,
    "At least four distinct detonation stages must be observable",
  );
  assert.ok(
    sawExplosionAudio,
    "Visual detonation must produce explosion audio while effects are enabled",
  );
  await page.locator("#result-panel").waitFor({ state: "visible" });
  assert.equal((await snapshot(page)).resultHidden, false);
  await page.screenshot({
    path: resolve(ARTIFACT_DIR, "polish_chain_complete.png"),
    fullPage: true,
  });
  passed("mines reveal and explode over time, with audio and a delayed result");

  await restart(page);
  await startLoss(page);
  await page.waitForFunction(() => {
    const sequence = window.__surveyTest.getScene().detonation;
    const fired = sequence.entries.filter((entry) => entry.fired).length;
    return sequence.active && fired > 0 && fired < sequence.entries.length;
  });
  const interrupted = (await snapshot(page)).sequence;
  await restart(page);
  state = await snapshot(page);
  assert.equal(state.sequence.active, false);
  assert.equal(state.sequence.completed, false);
  assert.equal(state.sequence.entries.length, 0);
  assert.equal(state.sequence.visibleMines, 0);
  assert.equal(state.resultHidden, true);
  assert.equal(
    state.audio.explosionVoices,
    0,
    "Restart must stop remaining explosion voices",
  );
  assert.equal(state.audio.enabled, true);
  assert.equal(state.audio.musicEnabled, true);
  await page.waitForTimeout(
    Math.ceil((interrupted.duration - interrupted.time) * 1000) + 700,
  );
  state = await snapshot(page);
  assert.equal(state.game.status, "ready");
  assert.equal(state.sequence.entries.length, 0);
  assert.equal(state.sequence.active, false);
  assert.equal(
    state.resultHidden,
    true,
    "A stale chain callback must not reveal a result after restarting",
  );
  passed(
    "mid-chain restart clears detonations, explosion voices, and stale completion callbacks",
  );

  await startLoss(page);
  await page.waitForFunction(() => {
    const sequence = window.__surveyTest.getScene().detonation;
    return sequence.active && sequence.entries.some((entry) => entry.fired);
  });
  const beforeContextLoss = await snapshot(page);
  assert.equal(beforeContextLoss.resultHidden, true);
  EXPECTED_CONTEXT_LOSS.add(page);
  await page.evaluate(() => {
    window.__surveyTest.getScene().renderer.forceContextLoss();
  });
  await page.locator("#fallback-board").waitFor({ state: "visible" });
  await page.locator("#result-panel").waitFor({ state: "visible" });
  const fallbackState = await page.evaluate(() => {
    const game = window.__surveyTest.getGame();
    return {
      game: {
        status: game.status,
        mines: game.mines,
        revealedCount: game.revealedCount,
        cells: game.cells.map((cell) => ({ ...cell })),
      },
      scene: window.__surveyTest.getScene(),
      statusLabel: document.getElementById("status-label").textContent,
      boardParent: document.getElementById("board-accessibility").parentElement
        .id,
    };
  });
  assert.deepEqual(
    fallbackState.game,
    beforeContextLoss.game,
    "Context loss must preserve the completed engine state and mine distribution",
  );
  assert.equal(fallbackState.scene, null);
  assert.equal(fallbackState.boardParent, "fallback-board");
  assert.ok(
    !fallbackState.statusLabel.includes("连锁引爆中"),
    "Fallback must replace the interrupted chain label with the terminal game status",
  );
  assert.equal(
    await page.locator("#fallback-board [role=gridcell]").count(),
    beforeContextLoss.game.cells.length,
  );
  await page.screenshot({
    path: resolve(ARTIFACT_DIR, "polish_context_loss_fallback.png"),
    fullPage: true,
  });
  // 降级不只显示棋局；重新开始后必须能通过真实按钮继续探索。
  await restart(page);
  await page.locator('#fallback-board [data-cell-id="40"]').click();
  await waitStatus(page, "playing");
  assert.equal(
    await page.evaluate(() => window.__surveyTest.getGame().cells[40].revealed),
    true,
    "The fallback grid must remain playable after restarting",
  );
  assert.equal(await page.locator("#result-panel").isVisible(), false);
  passed(
    "context loss during detonation preserves the board, finalizes HUD, and keeps fallback playable",
  );
  await context.close();

  for (const width of [375, 390]) {
    const mobileContext = await browser.newContext({
      viewport: { width, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });
    const mobile = await mobileContext.newPage();
    watchErrors(mobile, `polish-mobile-${width}`);
    await openGame(mobile);
    const point = await projectCell(mobile, 40);
    await mobile.touchscreen.tap(point.x, point.y);
    await waitStatus(mobile, "playing");
    await expectNoCursor(
      mobile,
      "A completed touch tap must not leave a hover or focus cursor",
    );
    await waitAudioRunning(mobile);
    const mobileState = await snapshot(mobile);
    assert.equal(mobileState.game.cells[40].revealed, true);
    const dimensions = await mobile.evaluate(() => ({
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      buttons: [...document.querySelectorAll(".header-actions button")].map(
        (button) => ({
          id: button.id,
          width: button.getBoundingClientRect().width,
          height: button.getBoundingClientRect().height,
        }),
      ),
    }));
    assert.ok(
      dimensions.document <= dimensions.viewport + 1 &&
        dimensions.body <= dimensions.viewport + 1,
      `Mobile ${width}px must not overflow horizontally`,
    );
    assert.equal(dimensions.buttons.length, 4);
    assert.ok(
      dimensions.buttons.every(
        (button) => button.width >= 36 && button.height >= 36,
      ),
      "All four header controls must retain a usable touch target",
    );
    if (width === 390)
      await mobile.screenshot({
        path: resolve(ARTIFACT_DIR, "polish_mobile_cursor.png"),
        fullPage: true,
      });
    await mobileContext.close();
    passed(
      `${width}px touch clears its cursor, unlocks audio, and fits four header controls`,
    );
  }

  assert.deepEqual(
    BROWSER_ERRORS,
    [],
    "Browser console, exceptions, and WebGL must remain error-free",
  );
  passed("no browser exceptions, console errors, or WebGL errors");
  console.log(`Polish regression checks passed: ${CHECKS.length}`);
  console.log(`Screenshots saved to ${ARTIFACT_DIR}`);
} catch (error) {
  if (BROWSER_ERRORS.length) console.error(BROWSER_ERRORS.join("\n"));
  console.error(`Polish checks completed before failure: ${CHECKS.length}`);
  throw error;
} finally {
  await browser.close();
}
