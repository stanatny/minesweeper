import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { orbitToDirection } from "./orbit_helpers.js";

const BASE_URL = process.env.SURVEY_TEST_URL || "http://127.0.0.1:50832";
const ARTIFACT_DIR = resolve("artifacts");
const CHECKS = [];
const ERRORS = [];
const EXPECTED_CONTEXT_LOSS = new WeakSet();
const CLOCK_INSTALLED = new WeakSet();

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

async function state(page) {
  return page.evaluate(() => {
    const game = window.__surveyTest.getGame();
    return {
      status: game.status,
      revealedCount: game.revealedCount,
      flagCount: game.flagCount,
      cells: game.cells.map((cell) => ({ ...cell })),
    };
  });
}

async function hintState(page) {
  return page.evaluate(() => {
    const scene = window.__surveyTest.getScene();
    return scene
      ? {
          ids: [...scene.chordHintIds].sort((a, b) => a - b),
          remaining: scene.chordHintRemaining,
        }
      : {
          ids: [
            ...document.querySelectorAll(
              '#fallback-board [data-chord-hint="true"]',
            ),
          ]
            .map((element) => Number(element.dataset.cellId))
            .sort((a, b) => a - b),
          remaining: null,
        };
  });
}

async function openGame(page, mode) {
  page.setDefaultTimeout(15000);
  await page.goto(`${BASE_URL}/?test=1`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__surveyTest?.getScene()?.renderer);
  if ((await page.locator("#board-mode").inputValue()) !== mode) {
    if (!(await page.locator("#board-mode").isVisible())) {
      const toggle = (await page.locator("#mobile-settings-toggle").isVisible())
        ? "#mobile-settings-toggle"
        : "#settings-btn";
      await activateControl(page, toggle);
    }
    await page.locator("#board-mode").selectOption(mode);
    await page.waitForFunction(
      (expected) => document.body.dataset.boardMode === expected,
      mode,
    );
  }
  if (
    page.viewportSize().width < 600 &&
    (await page.locator("#settings-panel").isVisible())
  )
    await activateControl(page, "#mobile-settings-toggle");
  await page.locator("#scene-stage canvas").scrollIntoViewIfNeeded();
  await frames(page);
  await page.evaluate(() => {
    window.__touchChordNativeEvents = 0;
    document.addEventListener("pointerup", (event) => {
      if (event.isTrusted && event.pointerType === "touch")
        window.__touchChordNativeEvents++;
    });
  });
}

async function activateControl(page, selector) {
  if (page.viewportSize().width < 600) await page.locator(selector).tap();
  else await page.locator(selector).click();
}

// 暂停仅约束原生手势的间隔和长按计时，棋局和场景始终由真实事件驱动。
async function gestureWindow(page, work) {
  if (!CLOCK_INSTALLED.has(page)) {
    await page.clock.install({ time: Date.now() });
    CLOCK_INSTALLED.add(page);
  }
  const now = await page.evaluate(() => Date.now());
  await page.clock.pauseAt(now + 1000);
  try {
    await page.clock.fastForward(800);
    return await work();
  } finally {
    await page.clock.resume();
  }
}

async function touch(cdp, type, points = []) {
  await cdp.send("Input.dispatchTouchEvent", {
    type,
    touchPoints: points.map((point, index) => ({
      ...point,
      id: point.id ?? index + 1,
    })),
  });
}

async function tap(page, cdp, point) {
  await touch(cdp, "touchStart", [{ x: point.x, y: point.y }]);
  await page.clock.runFor(24);
  await touch(cdp, "touchEnd");
}

async function doubleTap(page, cdp, point) {
  await tap(page, cdp, point);
  await page.clock.runFor(90);
  await tap(page, cdp, point);
  await page.clock.runFor(32);
}

async function projectedPoint(page, id) {
  return page.evaluate((cellId) => {
    const scene = window.__surveyTest.getScene();
    const point = scene.projectCell(cellId),
      canvas = scene.renderer.domElement;
    const visible =
      Number.isFinite(point.x) &&
      Number.isFinite(point.y) &&
      point.visible !== false &&
      point.x >= 0 &&
      point.x < innerWidth &&
      point.y >= 0 &&
      point.y < innerHeight &&
      document.elementFromPoint(point.x, point.y) === canvas &&
      scene.pick({ clientX: point.x, clientY: point.y }) === cellId;
    return { id: cellId, x: point.x, y: point.y, visible };
  }, id);
}

async function pointFor(page, id) {
  const hasScene = await page.evaluate(() =>
    Boolean(window.__surveyTest.getScene()),
  );
  if (!hasScene) {
    const button = page.locator(`#fallback-board [data-cell-id="${id}"]`);
    await button.scrollIntoViewIfNeeded();
    const box = await button.boundingBox();
    assert.ok(box, `Fallback tile ${id} must have a visible box`);
    return { id, x: box.x + box.width / 2, y: box.y + box.height / 2 };
  }
  await page.locator("#scene-stage canvas").scrollIntoViewIfNeeded();
  await page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const scene = window.__surveyTest.getScene();
        const position = scene.camera.position.clone(),
          quaternion = scene.camera.quaternion.clone();
        const started = performance.now();
        let stable = 0;
        const sample = () => {
          stable =
            position.distanceToSquared(scene.camera.position) < 1e-12 &&
            1 - Math.abs(quaternion.dot(scene.camera.quaternion)) < 1e-15
              ? stable + 1
              : 0;
          position.copy(scene.camera.position);
          quaternion.copy(scene.camera.quaternion);
          if (stable >= 3) return resolve();
          if (performance.now() - started > 12000)
            return reject(
              new Error(
                "Camera inertia did not settle before native touch input",
              ),
            );
          requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      }),
  );
  let point = await projectedPoint(page, id);
  if (!point.visible) {
    const normal = await page.evaluate(
      (cellId) => window.__surveyTest.getGame().topology?.cells[cellId].normal,
      id,
    );
    assert.ok(normal, `Planar tile ${id} must remain in the fitted view`);
    // 背面或凹面通过真实拖拽转向，不调用 scene.focus 或修改相机。
    await orbitToDirection(page, normal, { minDot: 0.99999 });
    point = await projectedPoint(page, id);
  }
  assert.equal(
    point.visible,
    true,
    `Tile ${id} must be visible and raycastable`,
  );
  return point;
}

async function tapCell(page, cdp, id) {
  const point = await pointFor(page, id);
  await gestureWindow(page, () => tap(page, cdp, point));
}

async function firstReveal(page, cdp) {
  await page.locator("#scene-stage canvas").scrollIntoViewIfNeeded();
  const id = await page.evaluate(() => {
    const test = window.__surveyTest,
      scene = test.getScene();
    const canvas = scene.renderer.domElement,
      box = canvas.getBoundingClientRect();
    const candidates = test
      .getGame()
      .cells.map((cell) => ({ id: cell.id, ...scene.projectCell(cell.id) }))
      .filter(
        (point) =>
          point.visible !== false &&
          document.elementFromPoint(point.x, point.y) === canvas &&
          scene.pick({ clientX: point.x, clientY: point.y }) === point.id,
      );
    candidates.sort(
      (a, b) =>
        Math.hypot(a.x - box.x - box.width / 2, a.y - box.y - box.height / 2) -
        Math.hypot(b.x - box.x - box.width / 2, b.y - box.y - box.height / 2),
    );
    return candidates[0]?.id;
  });
  assert.ok(
    Number.isInteger(id),
    "The ready board must offer a visible first tile",
  );
  await tapCell(page, cdp, id);
  assert.equal((await state(page)).status, "playing");
}

async function chordFixture(page, cdp, minimum = 1) {
  const candidates = await page.evaluate((min) => {
    const test = window.__surveyTest,
      game = test.getGame(),
      scene = test.getScene();
    return game.cells
      .filter((cell) => !cell.mine && cell.adjacent >= min && !cell.flagged)
      .map((cell) => ({
        id: cell.id,
        adjacent: cell.adjacent,
        revealed: cell.revealed,
        visible: scene ? scene.projectCell(cell.id).visible !== false : true,
        neighbors: game.neighbors(cell.id).map((id) => ({ ...game.cells[id] })),
      }))
      .filter(
        (cell) =>
          cell.neighbors.some(
            (neighbor) => neighbor.mine && !neighbor.flagged,
          ) &&
          cell.neighbors.some(
            (neighbor) =>
              !neighbor.mine && !neighbor.revealed && !neighbor.flagged,
          ),
      )
      .sort(
        (a, b) =>
          Number(b.revealed) - Number(a.revealed) ||
          Number(b.visible) - Number(a.visible) ||
          a.adjacent - b.adjacent,
      );
  }, minimum);
  assert.ok(
    candidates.length > 0,
    "The real first reveal must provide a useful numbered boundary",
  );
  const selected = candidates[0];
  if (!selected.revealed) await tapCell(page, cdp, selected.id);
  assert.equal((await state(page)).cells[selected.id].revealed, true);
  return page.evaluate((id) => {
    const game = window.__surveyTest.getGame();
    return {
      id,
      adjacent: game.cells[id].adjacent,
      neighbors: game
        .neighbors(id)
        .map((neighbor) => ({ ...game.cells[neighbor] })),
    };
  }, selected.id);
}

async function flagCells(page, cdp, ids) {
  await activateControl(page, "#flag-mode");
  for (const id of ids) {
    if ((await state(page)).cells[id].flagged) continue;
    await tapCell(page, cdp, id);
    assert.equal((await state(page)).cells[id].flagged, true);
  }
  await activateControl(page, "#reveal-mode");
}

async function verifyHint(page, cdp, fixture, filename) {
  const point = await pointFor(page, fixture.id);
  const before = await state(page);
  const expected = fixture.neighbors
    .filter(
      (cell) =>
        !before.cells[cell.id].revealed && !before.cells[cell.id].flagged,
    )
    .map((cell) => cell.id)
    .sort((a, b) => a - b);
  assert.ok(expected.length > 0);
  await gestureWindow(page, async () => {
    await doubleTap(page, cdp, point);
    assert.deepEqual(
      await state(page),
      before,
      "Insufficient flags must leave the entire board unchanged",
    );
    const hint = await hintState(page);
    assert.deepEqual(
      hint.ids,
      expected,
      "Only covered, unflagged graph neighbors may flash",
    );
    if (hint.remaining !== null)
      assert.ok(hint.remaining > 0 && hint.remaining <= 0.7);
    await page.screenshot({
      path: resolve(ARTIFACT_DIR, filename),
      fullPage: true,
    });
    await page.clock.fastForward(850);
    await page.clock.runFor(34);
    assert.deepEqual(
      (await hintState(page)).ids,
      [],
      "The neighbor hint must clear after its short lifetime",
    );
    assert.deepEqual(await state(page), before);
  });
  return expected;
}

async function correctChord(page, cdp, fixture, desktop = false) {
  await flagCells(
    page,
    cdp,
    fixture.neighbors.filter((cell) => cell.mine).map((cell) => cell.id),
  );
  const before = await state(page),
    point = await pointFor(page, fixture.id);
  const expected = fixture.neighbors
    .filter(
      (cell) =>
        !cell.mine &&
        !before.cells[cell.id].revealed &&
        !before.cells[cell.id].flagged,
    )
    .map((cell) => cell.id);
  assert.ok(expected.length > 0);
  if (desktop) await page.mouse.dblclick(point.x, point.y, { delay: 75 });
  else await gestureWindow(page, () => doubleTap(page, cdp, point));
  const after = await state(page);
  assert.ok(
    expected.every((id) => after.cells[id].revealed),
    "A valid chord must reveal every remaining safe neighbor",
  );
  assert.notEqual(after.status, "lost");
  assert.equal(after.flagCount, before.flagCount);
  assert.deepEqual((await hintState(page)).ids, []);
  return expected;
}

async function rejectAccidentalChords(page, cdp, fixture) {
  await flagCells(
    page,
    cdp,
    fixture.neighbors.filter((cell) => cell.mine).map((cell) => cell.id),
  );
  const evidence = [];
  for (const kind of [
    "different-cell",
    "cancel",
    "multitouch",
    "drag",
    "long-press",
  ]) {
    const point = await pointFor(page, fixture.id),
      before = await state(page);
    await gestureWindow(page, async () => {
      await tap(page, cdp, point);
      await page.clock.runFor(60);
      if (kind === "different-cell") {
        const other = await page.evaluate((exclude) => {
          const test = window.__surveyTest,
            scene = test.getScene(),
            canvas = scene.renderer.domElement;
          for (const cell of test.getGame().cells) {
            if (!cell.revealed || cell.id === exclude) continue;
            const p = scene.projectCell(cell.id);
            if (
              document.elementFromPoint(p.x, p.y) === canvas &&
              scene.pick({ clientX: p.x, clientY: p.y }) === cell.id
            )
              return p;
          }
          return null;
        }, fixture.id);
        assert.ok(
          other,
          "A second visible revealed tile is required for the different-cell gesture",
        );
        await tap(page, cdp, other);
      } else {
        await touch(cdp, "touchStart", [{ x: point.x, y: point.y }]);
        if (kind === "cancel") await touch(cdp, "touchCancel");
        else if (kind === "multitouch") {
          await touch(cdp, "touchStart", [
            { x: point.x, y: point.y, id: 1 },
            { x: point.x + 25, y: point.y + 20, id: 2 },
          ]);
          await touch(cdp, "touchEnd");
        } else if (kind === "drag") {
          await touch(cdp, "touchMove", [{ x: point.x + 30, y: point.y + 12 }]);
          await touch(cdp, "touchEnd");
        } else {
          await page.clock.runFor(560);
          await touch(cdp, "touchEnd");
        }
        await page.clock.runFor(40);
        const next = await projectedPoint(page, fixture.id);
        assert.equal(
          next.visible,
          true,
          "A short gesture must retain the test number in view",
        );
        await tap(page, cdp, next);
      }
      await page.clock.runFor(32);
      assert.deepEqual(
        await state(page),
        before,
        `${kind} must not become a chord or a tile action`,
      );
      assert.deepEqual(
        (await hintState(page)).ids,
        [],
        `${kind} must not trigger a chord hint`,
      );
    });
    evidence.push(kind);
  }
  return evidence;
}

async function restart(page) {
  const before = await state(page);
  await activateControl(page, "#new-game");
  if (before.status === "playing")
    await activateControl(page, "#confirm-accept");
  await page.waitForFunction(
    () => window.__surveyTest.getGame().status === "ready",
  );
  await frames(page);
}

await mkdir(ARTIFACT_DIR, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1000 },
    hasTouch: true,
  });
  for (const mode of ["surface", "plane"]) {
    const page = await context.newPage();
    watchErrors(page, `touch-chord-${mode}`);
    const cdp = await context.newCDPSession(page);
    await openGame(page, mode);
    await firstReveal(page, cdp);
    let fixture = await chordFixture(page, cdp, 2);
    const mines = fixture.neighbors
      .filter((cell) => cell.mine)
      .map((cell) => cell.id);
    await flagCells(page, cdp, mines.slice(0, 1));
    const hinted = await verifyHint(
      page,
      cdp,
      fixture,
      `touch_chord_${mode}_hint.png`,
    );
    if (mode === "plane") {
      const rejected = await rejectAccidentalChords(page, cdp, fixture);
      passed(
        "Different cells, cancellation, multitouch, dragging, and long presses never become accidental chords",
        { rejected },
      );
    }
    const revealed = await correctChord(page, cdp, fixture);
    passed(
      `${mode}: real double tap flashes only eligible neighbors when short of flags and reveals them when correctly marked`,
      { number: fixture.id, hinted, revealed },
    );

    if (mode === "plane") {
      fixture = await chordFixture(page, cdp);
      const desktopRevealed = await correctChord(page, cdp, fixture, true);
      passed("Desktop double-click still chords a correctly marked number", {
        number: fixture.id,
        revealed: desktopRevealed,
      });
      await restart(page);
      await firstReveal(page, cdp);
      fixture = await chordFixture(page, cdp);
      const safe = fixture.neighbors.find(
        (cell) => !cell.mine && !cell.revealed,
      );
      const correct = fixture.neighbors
        .filter((cell) => cell.mine)
        .slice(0, fixture.adjacent - 1);
      await flagCells(page, cdp, [safe.id, ...correct.map((cell) => cell.id)]);
      const point = await pointFor(page, fixture.id);
      await gestureWindow(page, () => doubleTap(page, cdp, point));
      assert.equal(
        (await state(page)).status,
        "lost",
        "Matching the number with an incorrect flag must still trigger a mine",
      );
      passed(
        "A real touch chord with matching but incorrect flags triggers a loss",
      );
    }
    assert.ok(
      (await page.evaluate(() => window.__touchChordNativeEvents)) > 0,
      "The gesture suite must dispatch trusted native touch input",
    );
    await cdp.detach();
    await page.close();
  }
  const fallback = await context.newPage();
  watchErrors(fallback, "touch-chord-fallback");
  const fallbackCdp = await context.newCDPSession(fallback);
  await openGame(fallback, "surface");
  await firstReveal(fallback, fallbackCdp);
  const fixture = await chordFixture(fallback, fallbackCdp, 2);
  const beforeFallback = await state(fallback);
  EXPECTED_CONTEXT_LOSS.add(fallback);
  await fallback.evaluate(() =>
    window.__surveyTest.getScene().renderer.forceContextLoss(),
  );
  await fallback.waitForFunction(() => !window.__surveyTest.getScene());
  await fallback.locator("#fallback-board").waitFor({ state: "visible" });
  assert.deepEqual(await state(fallback), beforeFallback);
  await flagCells(
    fallback,
    fallbackCdp,
    fixture.neighbors
      .filter((cell) => cell.mine)
      .slice(0, 1)
      .map((cell) => cell.id),
  );
  const hinted = await verifyHint(
    fallback,
    fallbackCdp,
    fixture,
    "touch_chord_fallback_hint.png",
  );
  const revealed = await correctChord(fallback, fallbackCdp, fixture);
  passed(
    "Fallback touch uses the same neighbor hint and valid-chord rules while preserving the original round",
    { hinted, revealed },
  );
  await fallbackCdp.detach();
  await context.close();

  // 真正的小屏手机上下文，额外覆盖视觉视口缩放和折叠设置后的原生触屏命中。
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  for (const mode of ["surface", "plane"]) {
    const mobile = await mobileContext.newPage();
    watchErrors(mobile, `touch-chord-mobile-375-${mode}`);
    const cdp = await mobileContext.newCDPSession(mobile);
    await openGame(mobile, mode);
    assert.equal(await mobile.locator("#settings-panel").isVisible(), false);
    const viewport = await mobile.evaluate(() => ({
      width: innerWidth,
      height: innerHeight,
      scale: visualViewport.scale,
      touchPoints: navigator.maxTouchPoints,
      document: document.documentElement.scrollWidth,
    }));
    assert.equal(viewport.width, 375);
    assert.equal(viewport.height, 667);
    assert.equal(viewport.scale, 1);
    assert.ok(viewport.touchPoints > 0 && viewport.document <= viewport.width);
    await firstReveal(mobile, cdp);
    let fixture = await chordFixture(mobile, cdp, 2);
    await flagCells(
      mobile,
      cdp,
      fixture.neighbors
        .filter((cell) => cell.mine)
        .slice(0, 1)
        .map((cell) => cell.id),
    );
    const hinted = await verifyHint(
      mobile,
      cdp,
      fixture,
      `touch_chord_mobile_375_${mode}_hint.png`,
    );
    const revealed = await correctChord(mobile, cdp, fixture);
    await restart(mobile);
    await firstReveal(mobile, cdp);
    fixture = await chordFixture(mobile, cdp);
    const safe = fixture.neighbors.find((cell) => !cell.mine && !cell.revealed);
    const correct = fixture.neighbors
      .filter((cell) => cell.mine)
      .slice(0, fixture.adjacent - 1);
    await flagCells(mobile, cdp, [safe.id, ...correct.map((cell) => cell.id)]);
    const point = await pointFor(mobile, fixture.id);
    await gestureWindow(mobile, () => doubleTap(mobile, cdp, point));
    assert.equal(
      (await state(mobile)).status,
      "lost",
      `${mode} mobile double tap must trigger a mine when matching flags are incorrect`,
    );
    const nativeEvents = await mobile.evaluate(
      () => window.__touchChordNativeEvents,
    );
    assert.ok(
      nativeEvents >= 10,
      "The phone checks must use trusted native touch input for play and marking",
    );
    passed(
      `375×667 mobile ${mode}: native double taps retain hints, valid chords, and wrong-flag losses`,
      { viewport, nativeEvents, hinted, revealed },
    );
    await cdp.detach();
    await mobile.close();
  }
  await mobileContext.close();
  assert.deepEqual(
    ERRORS,
    [],
    "Unexpected browser or WebGL errors must fail the touch-chord suite",
  );
  await writeFile(
    resolve(ARTIFACT_DIR, "touch_chord_browser_metrics.json"),
    `${JSON.stringify(CHECKS, null, 2)}\n`,
  );
  console.log(`Touch chord browser checks passed: ${CHECKS.length}`);
} catch (error) {
  if (ERRORS.length) console.error(ERRORS.join("\n"));
  throw error;
} finally {
  await browser.close();
}
