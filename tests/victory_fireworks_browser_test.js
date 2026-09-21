import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.SURVEY_TEST_URL || "http://127.0.0.1:8765";
const ARTIFACT_DIR = resolve("artifacts");
const MAX_SHOW_MS = 6000;
const CLEANUP_LIMIT_MS = 200;
const BROWSER_ERRORS = [];
const EVIDENCE = [];

// Debug hooks only inspect state. Every win must come from real pointer or touch input.
async function gameState(page) {
  return page.evaluate(() => {
    const game = window.__surveyTest.getGame();
    return {
      status: game.status,
      width: game.width,
      height: game.height,
      mines: game.mines,
      revealedCount: game.revealedCount,
      cells: game.cells.map((cell) => ({ ...cell })),
    };
  });
}

async function fireworkState(page) {
  return page.evaluate(() => {
    const fireworks = window.__surveyTest.getScene().fireworks;
    const voices = window.__surveyTest.getAudio().fireworkVoiceCount;
    return {
      status: window.__surveyTest.getGame().status,
      active: fireworks.active,
      activeCount: fireworks.activeCount,
      launchCount: fireworks.launchCount,
      burstCount: fireworks.burstCount,
      voices: voices,
      resultHidden: document.getElementById("result-panel").hidden,
    };
  });
}

function watchErrors(page, label) {
  page.on("pageerror", (error) =>
    BROWSER_ERRORS.push(`${label}: ${error.message}`),
  );
  page.on("console", (message) => {
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
  await page.waitForFunction(() => {
    const test = window.__surveyTest;
    const fireworks = test?.getScene()?.fireworks;
    return (
      test?.getScene()?.renderer &&
      fireworks &&
      Number.isFinite(fireworks.activeCount) &&
      Number.isFinite(fireworks.launchCount) &&
      Number.isFinite(fireworks.burstCount)
    );
  });
  const state = await fireworkState(page);
  assert.ok(
    Number.isFinite(state.voices),
    "The audio debug interface must expose a numeric fireworkVoiceCount",
  );
  assert.equal(state.status, "ready");
  assert.equal(state.active, false);
  assert.equal(state.activeCount, 0);
  assert.equal(state.voices, 0);
  await page.locator("#scene-stage canvas").waitFor({ state: "visible" });
}

async function activateCell(page, id, touch = false) {
  const point = await page.evaluate(
    (cellId) => window.__surveyTest.getScene().projectCell(cellId),
    id,
  );
  assert.ok(
    Number.isFinite(point.x) && Number.isFinite(point.y),
    `Cell ${id} must have finite projected coordinates`,
  );
  if (touch) await page.touchscreen.tap(point.x, point.y);
  else await page.mouse.click(point.x, point.y);
}

async function solveThroughUI(page, { touch = false } = {}) {
  let game = await gameState(page);
  assert.equal(
    game.status,
    "ready",
    "Each integrated victory must start from a fresh board",
  );
  const center =
    Math.floor(game.height / 2) * game.width + Math.floor(game.width / 2);
  await activateCell(page, center, touch);
  await page.waitForFunction(
    () => window.__surveyTest.getGame().status === "playing",
  );
  game = await gameState(page);
  assert.equal(
    (await fireworkState(page)).active,
    false,
    "Fireworks must not run during an unfinished round",
  );
  let actions = 1;
  let lastId = center;
  while (game.status === "playing" && actions <= game.cells.length) {
    const next = game.cells.find(
      (cell) => !cell.mine && !cell.revealed && !cell.flagged,
    );
    assert.ok(next, "A playing board must have an unrevealed safe tile");
    await activateCell(page, next.id, touch);
    actions += 1;
    lastId = next.id;
    game = await gameState(page);
  }
  assert.equal(
    game.status,
    "won",
    "Real safe-cell input must complete the round",
  );
  assert.equal(game.revealedCount, game.width * game.height - game.mines);
  await page.locator("#result-panel").waitFor({ state: "visible" });
  return { actions, lastId };
}

// Observe the integrated show in render frames without calling start(), update(), or clear().
async function armVictoryProbe(page) {
  await page.evaluate(() => {
    const probe = {
      samples: [],
      startedAt: null,
      finishedAt: null,
      done: false,
      error: null,
    };
    window.__victoryFireworksProbe = probe;
    const deadline = performance.now() + 20000;
    const sample = () => {
      const now = performance.now();
      const test = window.__surveyTest;
      const fireworks = test.getScene()?.fireworks;
      if (!fireworks) {
        probe.error = "The fireworks renderer became unavailable";
        return;
      }
      if (test.getGame().status === "won") {
        if (probe.startedAt === null) probe.startedAt = now;
        const voices = test.getAudio().fireworkVoiceCount;
        probe.samples.push({
          wallMs: now - probe.startedAt,
          active: fireworks.active,
          activeCount: fireworks.activeCount,
          launchCount: fireworks.launchCount,
          burstCount: fireworks.burstCount,
          voices: voices,
          resultHidden: document.getElementById("result-panel").hidden,
        });
        if (
          fireworks.burstCount > 0 &&
          !fireworks.active &&
          fireworks.activeCount === 0
        ) {
          probe.finishedAt = now;
          probe.done = true;
          return;
        }
        if (now - probe.startedAt > 8000) {
          probe.error = "Victory fireworks did not finish within eight seconds";
          return;
        }
      }
      if (now > deadline) {
        probe.error =
          "No completed victory was observed within the probe deadline";
        return;
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
}

async function waitForBurst(page) {
  await page.waitForFunction(() => {
    const fireworks = window.__surveyTest.getScene().fireworks;
    return (
      fireworks.active && fireworks.burstCount > 0 && fireworks.activeCount > 0
    );
  });
}

async function capture(page, filename) {
  await page.screenshot({
    path: resolve(ARTIFACT_DIR, filename),
    fullPage: true,
  });
}

async function restartFromResult(page) {
  assert.equal(await page.locator("#result-restart").isEnabled(), true);
  await page.locator("#result-restart").click();
  await page.waitForFunction(
    () => window.__surveyTest.getGame().status === "ready",
  );
  const state = await fireworkState(page);
  assert.equal(
    state.active,
    false,
    "Result-panel restart must immediately stop the show",
  );
  assert.equal(
    state.activeCount,
    0,
    "Result-panel restart must immediately clear visible fireworks",
  );
  assert.equal(
    state.voices,
    0,
    "Result-panel restart must immediately stop firework audio",
  );
  assert.equal(state.resultHidden, true);
}

// Check the full old-show window frame by frame to catch delayed launches or audio callbacks after cleanup.
async function assertQuietFor(page, expectedStatus, durationMs = MAX_SHOW_MS) {
  const result = await page.evaluate(
    ({ status, duration }) =>
      new Promise((resolve) => {
        const startedAt = performance.now();
        const initial = window.__surveyTest.getScene().fireworks;
        const counts = {
          launches: initial.launchCount,
          bursts: initial.burstCount,
        };
        let samples = 0;
        const sample = () => {
          const test = window.__surveyTest;
          const fireworks = test.getScene().fireworks;
          const tracked = test.getAudio().fireworkVoiceCount;
          const voices = tracked;
          samples += 1;
          const elapsed = performance.now() - startedAt;
          if (
            test.getGame().status !== status ||
            fireworks.active ||
            fireworks.activeCount !== 0 ||
            voices !== 0 ||
            fireworks.launchCount !== counts.launches ||
            fireworks.burstCount !== counts.bursts
          ) {
            resolve({
              error:
                "Fireworks, audio, or stale callbacks became active after cleanup",
              samples,
              elapsed,
            });
            return;
          }
          if (elapsed >= duration) {
            resolve({ error: null, samples, elapsed });
            return;
          }
          requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      }),
    { status: expectedStatus, duration: durationMs },
  );
  assert.equal(result.error, null);
  assert.ok(
    result.samples > 2,
    "Cleanup must remain stable across real animation frames",
  );
  return result;
}

await mkdir(ARTIFACT_DIR, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  const context = await browser.newContext({
    viewport: { width: 1360, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  watchErrors(page, "victory-desktop");
  await openGame(page);
  await armVictoryProbe(page);
  const firstWin = await solveThroughUI(page);
  await waitForBurst(page);
  await capture(page, "victory_fireworks_desktop.png");
  await page.waitForFunction(
    () =>
      window.__victoryFireworksProbe.done ||
      window.__victoryFireworksProbe.error,
  );
  const probe = await page.evaluate(() => window.__victoryFireworksProbe);
  assert.equal(probe.error, null);
  assert.ok(
    probe.samples.some(
      (sample) =>
        sample.active && sample.launchCount > 0 && sample.activeCount > 0,
    ),
    "A real victory must launch visible rockets",
  );
  assert.ok(
    probe.samples.some(
      (sample) =>
        sample.active && sample.burstCount > 0 && sample.activeCount > 0,
    ),
    "The launched rockets must produce visible bursts",
  );
  assert.ok(
    probe.samples.some((sample) => sample.voices > 0),
    "The integrated show must produce firework audio when sound is enabled",
  );
  assert.ok(
    probe.samples.every((sample) => !sample.resultHidden),
    "Winning results must remain available throughout the show",
  );
  const wallMs = probe.finishedAt - probe.startedAt;
  assert.ok(
    wallMs <= MAX_SHOW_MS,
    `The victory show must finish within ${MAX_SHOW_MS} ms, observed ${wallMs}`,
  );
  const final = probe.samples.at(-1);
  assert.ok(final.launchCount > 0 && final.burstCount > 0);
  assert.ok(
    final.burstCount <= final.launchCount,
    "Each rocket can burst at most once",
  );
  await page.waitForFunction(() => {
    const voices = window.__surveyTest.getAudio().fireworkVoiceCount;
    return voices === 0;
  });
  const completed = await fireworkState(page);
  await activateCell(page, firstWin.lastId);
  const noReplay = await assertQuietFor(page, "won", 500);
  assert.equal(
    (await fireworkState(page)).launchCount,
    completed.launchCount,
    "Post-win board clicks must not start a second show",
  );
  EVIDENCE.push({
    check: "desktop_complete",
    actions: firstWin.actions,
    wallMs: Math.round(wallMs),
    launches: final.launchCount,
    bursts: final.burstCount,
    sampledFrames: probe.samples.length,
    noReplayFrames: noReplay.samples,
  });
  console.log(
    `PASS real desktop victory launches and bursts once, then clears in ${Math.round(wallMs)} ms`,
  );

  await restartFromResult(page);
  await solveThroughUI(page);
  await waitForBurst(page);
  await restartFromResult(page);
  const restartWindow = await assertQuietFor(page, "ready");
  EVIDENCE.push({
    check: "mid_show_restart",
    quietFrames: restartWindow.samples,
    quietMs: Math.round(restartWindow.elapsed),
  });
  console.log(
    "PASS the result button interrupts an active show and suppresses old visual and audio callbacks",
  );

  await solveThroughUI(page);
  await waitForBurst(page);
  const reducedAt = Date.now();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(() => {
    const test = window.__surveyTest;
    const fireworks = test.getScene().fireworks;
    const voices = test.getAudio().fireworkVoiceCount;
    return !fireworks.active && fireworks.activeCount === 0 && voices === 0;
  });
  const reducedCleanupMs = Date.now() - reducedAt;
  assert.ok(
    reducedCleanupMs <= CLEANUP_LIMIT_MS,
    `Enabling reduced motion must clear the current show within ${CLEANUP_LIMIT_MS} ms, observed ${reducedCleanupMs}`,
  );
  assert.equal(await page.locator("#result-panel").isVisible(), true);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const reducedWindow = await assertQuietFor(page, "won");
  EVIDENCE.push({
    check: "reduced_motion_during_show",
    cleanupMs: reducedCleanupMs,
    quietFrames: reducedWindow.samples,
  });
  console.log(
    "PASS enabling reduced motion clears an active show and disabling it does not replay the same victory",
  );

  await restartFromResult(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await solveThroughUI(page);
  const reducedState = await fireworkState(page);
  assert.equal(reducedState.active, false);
  assert.equal(reducedState.activeCount, 0);
  assert.equal(
    reducedState.launchCount,
    0,
    "A reduced-motion victory must not launch rockets",
  );
  assert.equal(
    reducedState.burstCount,
    0,
    "A reduced-motion victory must not produce bursts",
  );
  assert.equal(reducedState.voices, 0);
  const quietReduced = await assertQuietFor(page, "won");
  await page.locator("#help-btn").click();
  await page.locator("#help-dialog").waitFor({ state: "visible" });
  await page.keyboard.press("Escape");
  await page.locator("#help-dialog").waitFor({ state: "hidden" });
  assert.equal(await page.locator("#result-panel").isVisible(), true);
  await restartFromResult(page);
  EVIDENCE.push({
    check: "reduced_motion_before_victory",
    quietFrames: quietReduced.samples,
  });
  console.log(
    "PASS reduced-motion victories remain interactive without launching fireworks or firework audio",
  );
  await context.close();

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    reducedMotion: "no-preference",
  });
  const mobile = await mobileContext.newPage();
  watchErrors(mobile, "victory-mobile-390");
  await openGame(mobile);
  const mobileWin = await solveThroughUI(mobile, { touch: true });
  await waitForBurst(mobile);
  const mobileState = await fireworkState(mobile);
  assert.equal(mobileState.status, "won");
  assert.ok(
    mobileState.launchCount > 0 &&
      mobileState.burstCount > 0 &&
      mobileState.activeCount > 0,
  );
  const mobileSizes = await mobile.evaluate(() => ({
    width: innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  assert.ok(
    mobileSizes.document <= mobileSizes.width + 1 &&
      mobileSizes.body <= mobileSizes.width + 1,
    "A mobile victory and its result panel must not overflow horizontally",
  );
  await capture(mobile, "victory_fireworks_mobile.png");
  await restartFromResult(mobile);
  EVIDENCE.push({
    check: "mobile_touch_victory",
    width: 390,
    actions: mobileWin.actions,
    launches: mobileState.launchCount,
    bursts: mobileState.burstCount,
  });
  console.log(
    "PASS real 390px touch victory displays fireworks and retains an operable result button",
  );
  await mobileContext.close();

  assert.deepEqual(
    BROWSER_ERRORS,
    [],
    "Browser console, uncaught exceptions, and WebGL must remain error-free",
  );
  await writeFile(
    resolve(ARTIFACT_DIR, "victory_fireworks_metrics.json"),
    `${JSON.stringify(EVIDENCE, null, 2)}\n`,
  );
  console.log(
    "PASS no browser console errors, uncaught exceptions, or WebGL errors",
  );
  console.log(`Victory evidence: ${JSON.stringify(EVIDENCE)}`);
} catch (error) {
  if (BROWSER_ERRORS.length) console.error(BROWSER_ERRORS.join("\n"));
  throw error;
} finally {
  await browser.close();
}
