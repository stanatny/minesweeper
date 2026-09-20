import assert from "node:assert/strict";
import { access, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.SURVEY_TEST_URL || "http://127.0.0.1:8765";
const ARTIFACT_DIR = resolve("artifacts");
const BROWSER_ERRORS = [];
const CHECKS = [];

// 测试只读取本地调试接口；所有改变棋局的操作均经过真实鼠标、触屏或键盘。
async function gameState(page) {
  return page.evaluate(() => {
    const game = window.__surveyTest.getGame();
    return {
      width: game.width,
      height: game.height,
      mines: game.mines,
      status: game.status,
      revealedCount: game.revealedCount,
      flagCount: game.flagCount,
      cells: game.cells.map((cell) => ({ ...cell })),
    };
  });
}

async function projectCell(page, id) {
  const point = await page.evaluate(
    (cellId) => window.__surveyTest.getScene().projectCell(cellId),
    id,
  );
  assert.ok(
    Number.isFinite(point.x) && Number.isFinite(point.y),
    `Cell ${id} must project to finite coordinates`,
  );
  return point;
}

async function clickCell(page, id, options = {}) {
  const point = await projectCell(page, id);
  await page.mouse.click(point.x, point.y, options);
}

async function tapCell(page, id) {
  const point = await projectCell(page, id);
  await page.touchscreen.tap(point.x, point.y);
}

async function waitStatus(page, status) {
  await page.waitForFunction(
    (expected) => window.__surveyTest.getGame().status === expected,
    status,
  );
}

async function capture(page, filename) {
  await page.mouse.move(3, 3);
  await page.waitForTimeout(900);
  await page.screenshot({
    path: resolve(ARTIFACT_DIR, filename),
    fullPage: true,
  });
}

function watchErrors(page, label) {
  page.on("pageerror", (error) =>
    BROWSER_ERRORS.push(`${label}: ${error.message}`),
  );
  page.on("console", (message) => {
    const text = message.text();
    if (
      message.type() === "error" ||
      /(?:WebGL.*(?:error|context lost)|GL_INVALID|shader.*failed)/i.test(text)
    ) {
      BROWSER_ERRORS.push(`${label}: ${text}`);
    }
  });
}

function passed(name) {
  CHECKS.push(name);
  console.log(`PASS ${name}`);
}

async function openGame(page) {
  await page.goto(`${BASE_URL}/?test=1`, { waitUntil: "networkidle" });
  await page.waitForFunction(
    () =>
      window.__surveyTest?.getScene()?.renderer &&
      window.__surveyTest?.getGame()?.cells.length,
  );
  await page.locator("#scene-stage canvas").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}

async function restart(page) {
  const state = await gameState(page);
  await page.locator("#new-game").click();
  if (state.status === "playing") {
    await page.locator("#confirm-dialog").waitFor({ state: "visible" });
    await page.locator("#confirm-accept").click();
  }
  await waitStatus(page, "ready");
}

async function ensurePlaying(page) {
  if ((await gameState(page)).status !== "playing") {
    await restart(page);
    await clickCell(page, 40);
  }
  await waitStatus(page, "playing");
}

async function findChord(page) {
  return page.evaluate(() => {
    const game = window.__surveyTest.getGame();
    const cell = game.cells.find(
      (candidate) =>
        candidate.revealed &&
        candidate.adjacent > 0 &&
        game
          .neighbors(candidate.id)
          .some(
            (id) =>
              !game.cells[id].revealed &&
              !game.cells[id].mine &&
              !game.cells[id].flagged,
          ),
    );
    return cell
      ? {
          id: cell.id,
          neighbors: game
            .neighbors(cell.id)
            .map((id) => ({ ...game.cells[id] })),
        }
      : null;
  });
}

await mkdir(ARTIFACT_DIR, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  const context = await browser.newContext({
    viewport: { width: 1360, height: 900 },
    deviceScaleFactor: 1,
  });
  const hasBaseline = await access(
    resolve(ARTIFACT_DIR, "baseline/index.html"),
  ).then(
    () => true,
    () => false,
  );
  if (hasBaseline) {
    const baseline = await context.newPage();
    await baseline.goto(`${BASE_URL}/artifacts/baseline/index.html`, {
      waitUntil: "networkidle",
    });
    await baseline.screenshot({
      path: resolve(ARTIFACT_DIR, "before.png"),
      fullPage: true,
    });
    await baseline.close();
  } else {
    console.log("SKIP baseline screenshot: no archived baseline is available");
  }

  const page = await context.newPage();
  watchErrors(page, "desktop");
  page.setDefaultTimeout(12000);
  await openGame(page);
  assert.equal((await gameState(page)).status, "ready");
  await clickCell(page, 40, { button: "right" });
  assert.equal(
    (await gameState(page)).flagCount,
    0,
    "Flags must be ignored before the first reveal",
  );
  await capture(page, "after_ready.png");
  passed("initial 3D scene and first-click flag guard");

  await clickCell(page, 40);
  await waitStatus(page, "playing");
  let state = await gameState(page);
  assert.ok(state.cells[40].revealed && !state.cells[40].mine);
  assert.equal(state.cells[40].adjacent, 0);
  assert.ok(
    state.revealedCount > 1,
    "The first zero cell should flood-reveal its neighbors",
  );
  assert.equal(state.cells.filter((cell) => cell.mine).length, 10);
  await capture(page, "after_playing.png");
  passed("real pointer reveal, first-click safety, and flood reveal");

  let flagId = state.cells.find((cell) => cell.mine && !cell.flagged).id;
  await clickCell(page, flagId, { button: "right" });
  state = await gameState(page);
  assert.equal(state.cells[flagId].flagged, true);
  assert.equal(state.flagCount, 1);
  await capture(page, "after_flagged.png");
  await clickCell(page, flagId, { button: "right" });
  assert.equal((await gameState(page)).cells[flagId].flagged, false);
  passed("right-click flag and unflag");

  await page.locator("#flag-mode").click();
  await clickCell(page, flagId);
  assert.equal(
    (await gameState(page)).cells[flagId].flagged,
    true,
    "Flag mode must turn primary click into marking",
  );
  await clickCell(page, flagId);
  assert.equal((await gameState(page)).cells[flagId].flagged, false);
  await page.locator("#reveal-mode").click();
  passed("primary-click mode switching");

  const beforeDrag = await gameState(page);
  const dragPoint = await projectCell(page, 40);
  await page.mouse.move(dragPoint.x, dragPoint.y);
  await page.mouse.down();
  await page.mouse.move(dragPoint.x + 110, dragPoint.y + 35, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(500);
  assert.deepEqual(
    await gameState(page),
    beforeDrag,
    "Orbit dragging must not reveal or flag cells",
  );
  await page.locator("#reset-camera").click();
  await page.waitForTimeout(400);
  passed("orbit drag preserves the game state");

  let chord = await findChord(page);
  // 极端随机棋局可能缺少可连开的边界，通过实际翻开安全格形成边界。
  for (let attempts = 0; !chord && attempts < 30; attempts += 1) {
    state = await gameState(page);
    const next = state.cells.find(
      (cell) => !cell.mine && !cell.revealed && !cell.flagged,
    );
    if (!next || state.status !== "playing") break;
    await clickCell(page, next.id);
    chord = await findChord(page);
  }
  assert.ok(
    chord,
    "The board must offer a numbered boundary for chord testing",
  );
  for (const neighbor of chord.neighbors.filter(
    (cell) => cell.mine && !cell.flagged,
  )) {
    await clickCell(page, neighbor.id, { button: "right" });
  }
  const revealTargets = chord.neighbors
    .filter((cell) => !cell.mine && !cell.revealed && !cell.flagged)
    .map((cell) => cell.id);
  const chordPoint = await projectCell(page, chord.id);
  await page.mouse.dblclick(chordPoint.x, chordPoint.y, { delay: 80 });
  state = await gameState(page);
  assert.ok(
    revealTargets.every((id) => state.cells[id].revealed),
    "Double-click must reveal safe neighbors of a correctly flagged number",
  );
  assert.notEqual(state.status, "lost");
  passed("real double-click chord with correct flags");

  await ensurePlaying(page);
  const beforeRestart = await gameState(page);
  await page.locator("#new-game").click();
  await page.locator("#confirm-dialog").waitFor({ state: "visible" });
  await page.locator("#confirm-cancel").click();
  assert.deepEqual(
    await gameState(page),
    beforeRestart,
    "Canceling restart must preserve the round",
  );
  await restart(page);
  assert.equal((await gameState(page)).revealedCount, 0);
  passed("restart confirmation accepts and cancels correctly");

  await clickCell(page, 40);
  await waitStatus(page, "playing");
  const beforeDifficulty = await gameState(page);
  if (!(await page.locator("#preset-select").isVisible()))
    await page.locator("#settings-btn").click();
  await page.locator("#preset-select").selectOption("intermediate");
  await page.locator("#confirm-dialog").waitFor({ state: "visible" });
  await page.locator("#confirm-cancel").click();
  assert.deepEqual(
    await gameState(page),
    beforeDifficulty,
    "Canceling difficulty changes must preserve the round",
  );
  assert.equal(await page.locator("#preset-select").inputValue(), "beginner");
  await page.locator("#preset-select").selectOption("intermediate");
  await page.locator("#confirm-dialog").waitFor({ state: "visible" });
  await page.locator("#confirm-accept").click();
  await waitStatus(page, "ready");
  state = await gameState(page);
  assert.equal(state.width, 16);
  assert.equal(state.height, 16);
  assert.equal(state.mines, 40);
  await page.locator("#preset-select").selectOption("beginner");
  assert.equal((await gameState(page)).width, 9);
  if (await page.locator("#settings-panel").isVisible())
    await page.locator("#settings-btn").click();
  passed("difficulty confirmation and preset dimensions");

  await page.locator('#board-accessibility [data-cell-id="40"]').focus();
  await page.keyboard.press("Enter");
  await waitStatus(page, "playing");
  assert.equal((await gameState(page)).cells[40].revealed, true);
  state = await gameState(page);
  flagId = state.cells.find((cell) => cell.mine && !cell.flagged).id;
  await page.locator(`#board-accessibility [data-cell-id="${flagId}"]`).focus();
  await page.keyboard.press("f");
  assert.equal((await gameState(page)).cells[flagId].flagged, true);
  await page.keyboard.press("f");
  assert.equal((await gameState(page)).cells[flagId].flagged, false);
  passed("keyboard Enter reveal and F marking");

  await page.locator("#help-btn").click();
  await page.locator("#help-dialog").waitFor({ state: "visible" });
  await page.locator("#help-dialog [data-close-dialog]").first().click();
  await page.locator("#help-dialog").waitFor({ state: "hidden" });
  await page.locator("#help-btn").click();
  await page.keyboard.press("Escape");
  await page.locator("#help-dialog").waitFor({ state: "hidden" });
  passed("help dialog close button and Escape");

  await clickCell(page, flagId);
  await waitStatus(page, "lost");
  state = await gameState(page);
  assert.equal(state.cells[flagId].exploded, true);
  assert.ok(
    state.cells.filter((cell) => cell.mine).every((cell) => cell.revealed),
  );
  await capture(page, "after_lost.png");
  passed("actual mine click, terminal loss, and exposed mines");

  await restart(page);
  await clickCell(page, 40);
  for (let attempts = 0; attempts < 81; attempts += 1) {
    state = await gameState(page);
    if (state.status === "won") break;
    assert.equal(state.status, "playing");
    const next = state.cells.find((cell) => !cell.mine && !cell.revealed);
    assert.ok(next, "An unfinished round must have a hidden safe cell");
    if (next.flagged) await clickCell(page, next.id, { button: "right" });
    await clickCell(page, next.id);
  }
  await waitStatus(page, "won");
  state = await gameState(page);
  assert.equal(state.revealedCount, state.width * state.height - state.mines);
  assert.equal(state.flagCount, state.mines);
  await capture(page, "after_won.png");
  passed("complete victory through actual safe-cell clicks");

  for (const width of [375, 390]) {
    const mobileContext = await browser.newContext({
      viewport: { width, height: 844 },
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
    });
    const mobile = await mobileContext.newPage();
    watchErrors(mobile, `mobile-${width}`);
    await openGame(mobile);
    const sizes = await mobile.evaluate(() => ({
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    assert.ok(
      sizes.document <= sizes.viewport + 1 && sizes.body <= sizes.viewport + 1,
      `Mobile ${width}px must not overflow horizontally: ${JSON.stringify(sizes)}`,
    );
    await tapCell(mobile, 40);
    await waitStatus(mobile, "playing");
    const mobileState = await gameState(mobile);
    assert.equal(mobileState.cells[40].revealed, true);
    const mobileFlag = mobileState.cells.find(
      (cell) => !cell.revealed && cell.mine,
    ).id;
    await mobile.locator("#flag-mode").tap();
    await tapCell(mobile, mobileFlag);
    assert.equal((await gameState(mobile)).cells[mobileFlag].flagged, true);
    if (width === 390) await capture(mobile, "mobile.png");
    await mobileContext.close();
    passed(`${width}px mobile layout and touch reveal/flag controls`);
  }

  assert.deepEqual(
    BROWSER_ERRORS,
    [],
    "Browser console and WebGL errors must be absent",
  );
  passed("no browser console errors, uncaught exceptions, or WebGL errors");
  await context.close();
  console.log(`Browser checks passed: ${CHECKS.length}`);
  console.log(`Screenshots saved to ${ARTIFACT_DIR}`);
} catch (error) {
  if (BROWSER_ERRORS.length) console.error(BROWSER_ERRORS.join("\n"));
  console.error(`Browser checks completed before failure: ${CHECKS.length}`);
  throw error;
} finally {
  await browser.close();
}
