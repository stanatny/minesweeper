import assert from "node:assert/strict";
import { chromium } from "playwright";
import { selectPlanarBoard } from "./board_mode_helpers.js";

const BASE_URL = process.env.SURVEY_TEST_URL || "http://127.0.0.1:8765";
const BROWSER_ERRORS = [];
const CLEANUP_LIMIT_MS = 200;

// Test hooks only inspect the real board and rendering resources; reveal, loss, and restart use real UI input.
async function clickCell(page, id) {
  const point = await page.evaluate(
    (cellId) => window.__surveyTest.getScene().projectCell(cellId),
    id,
  );
  assert.ok(
    Number.isFinite(point.x) && Number.isFinite(point.y),
    `Cell ${id} must project to finite coordinates`,
  );
  await page.mouse.click(point.x, point.y);
}

function watchErrors(page, label) {
  page.on("pageerror", (error) => {
    BROWSER_ERRORS.push(`${label}: ${error.message}`);
  });
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

async function openExpertGame(page) {
  page.setDefaultTimeout(15000);
  await page.goto(`${BASE_URL}/?test=1`, { waitUntil: "networkidle" });
  await selectPlanarBoard(page, { keepSettingsOpen: true });
  await page.waitForFunction(() => {
    const scene = window.__surveyTest?.getScene();
    return (
      scene?.renderer &&
      Number.isFinite(scene.effects?.flames?.activeCount) &&
      scene.effects.trails?.isLineSegments
    );
  });
  if (!(await page.locator("#preset-select").isVisible())) {
    await page.locator("#settings-btn").click();
  }
  await page.locator("#preset-select").selectOption("expert");
  await page.waitForFunction(() => {
    const game = window.__surveyTest.getGame();
    return game.status === "ready" && game.mines === 99;
  });
  if (await page.locator("#settings-panel").isVisible()) {
    await page.locator("#settings-btn").click();
  }
  await page.locator("#scene-stage canvas").waitFor({ state: "visible" });
  await page.waitForTimeout(350);
}

async function startRound(page) {
  const firstId = await page.evaluate(() => {
    const game = window.__surveyTest.getGame();
    return (
      Math.floor(game.height / 2) * game.width + Math.floor(game.width / 2)
    );
  });
  await clickCell(page, firstId);
  await page.waitForFunction(
    () => window.__surveyTest.getGame().status === "playing",
  );
  const mineId = await page.evaluate(() => {
    const game = window.__surveyTest.getGame();
    const centerX = (game.width - 1) / 2;
    const centerY = (game.height - 1) / 2;
    return game.cells
      .filter((cell) => cell.mine && !cell.revealed && !cell.flagged)
      .sort(
        (a, b) =>
          Math.hypot(a.x - centerX, a.y - centerY) -
          Math.hypot(b.x - centerX, b.y - centerY),
      )[0]?.id;
  });
  assert.ok(Number.isInteger(mineId), "The round must contain a hidden mine");
  return mineId;
}

async function effectState(page) {
  return page.evaluate(() => {
    const scene = window.__surveyTest.getScene();
    return {
      status: window.__surveyTest.getGame().status,
      activeFlames: scene.effects.flames.activeCount,
      trailsVisible: scene.effects.trails.visible,
      sequenceActive: scene.detonation.active,
      sequenceCompleted: scene.detonation.completed,
      entries: scene.detonation.entries.length,
    };
  });
}

// Sample effects and cleanup in render frames so Node polling cannot miss short flame jets or hide delayed cleanup.
async function armProbe(page, stopAfter = "complete") {
  await page.evaluate((target) => {
    const previous = window.__flameEffectsProbe;
    if (previous?.frame) cancelAnimationFrame(previous.frame);
    const probe = {
      samples: [],
      startedAt: null,
      completedAt: null,
      resetAt: null,
      cleanAt: null,
      done: false,
      error: null,
      frame: null,
    };
    window.__flameEffectsProbe = probe;
    const deadline = performance.now() + 12000;
    const sample = () => {
      const now = performance.now();
      const scene = window.__surveyTest.getScene();
      const game = window.__surveyTest.getGame();
      if (!scene?.effects?.flames || !scene.effects.trails) {
        probe.error = "The flame or trail renderer became unavailable";
        return;
      }
      const sequence = scene.detonation;
      if (sequence.entries.length && probe.startedAt === null) {
        probe.startedAt = now;
      }
      if (probe.startedAt !== null) {
        const activeFlames = scene.effects.flames.activeCount;
        const trailsVisible = scene.effects.trails.visible;
        const trailVertices = Math.min(
          scene.effects.trails.geometry.drawRange.count,
          scene.effects.trails.geometry.getAttribute("position")?.count || 0,
        );
        if (sequence.completed && probe.completedAt === null) {
          probe.completedAt = now;
        }
        if (
          game.status === "ready" &&
          sequence.entries.length === 0 &&
          probe.resetAt === null
        ) {
          probe.resetAt = now;
        }
        const endpoint = target === "reset" ? probe.resetAt : probe.completedAt;
        if (
          endpoint !== null &&
          activeFlames === 0 &&
          !trailsVisible &&
          probe.cleanAt === null
        ) {
          probe.cleanAt = now;
        }
        probe.samples.push({
          wallMs: now - probe.startedAt,
          status: game.status,
          activeFlames,
          trailsVisible,
          trailVertices,
          fired: sequence.entries.filter((entry) => entry.fired).length,
          total: sequence.entries.length,
          sequenceActive: sequence.active,
          sequenceCompleted: sequence.completed,
        });
        // Keep observing briefly to catch stale callbacks that might reignite flames after completion or restart.
        if (endpoint !== null && now - endpoint >= 220) {
          probe.done = true;
          return;
        }
      }
      if (now >= deadline) {
        probe.error = `The ${target} probe did not finish within 12 seconds`;
        return;
      }
      probe.frame = requestAnimationFrame(sample);
    };
    probe.frame = requestAnimationFrame(sample);
  }, stopAfter);
}

async function readFinishedProbe(page) {
  await page.waitForFunction(
    () => window.__flameEffectsProbe.done || window.__flameEffectsProbe.error,
  );
  const probe = await page.evaluate(() => window.__flameEffectsProbe);
  assert.equal(probe.error, null);
  assert.ok(
    probe.samples.length > 2,
    "Effects must be observed across real frames",
  );
  return probe;
}

function assertCleared(probe, endpointName) {
  const endpoint = probe[endpointName];
  assert.notEqual(endpoint, null, `${endpointName} must be observed`);
  assert.notEqual(probe.cleanAt, null, "Flames and trails must both clear");
  assert.ok(
    probe.cleanAt - endpoint <= CLEANUP_LIMIT_MS,
    `Effects must clear within ${CLEANUP_LIMIT_MS} ms, observed ${probe.cleanAt - endpoint} ms`,
  );
  const cleanupWallMs = probe.cleanAt - probe.startedAt;
  for (const sample of probe.samples.filter(
    (entry) => entry.wallMs >= cleanupWallMs,
  )) {
    assert.equal(sample.activeFlames, 0, "Cleared flames must stay inactive");
    assert.equal(
      sample.trailsVisible,
      false,
      "Cleared trails must stay hidden",
    );
  }
}

const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  const context = await browser.newContext({
    viewport: { width: 1360, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  watchErrors(page, "normal-motion");
  await openExpertGame(page);
  let mineId = await startRound(page);
  await armProbe(page);
  await clickCell(page, mineId);
  const complete = await readFinishedProbe(page);
  assert.ok(
    complete.samples.some((sample) => sample.activeFlames > 0),
    "A real explosion must activate flame jets",
  );
  assert.ok(
    complete.samples.some(
      (sample) => sample.trailsVisible && sample.trailVertices > 0,
    ),
    "A real explosion must display nonempty debris trails",
  );
  const final = complete.samples.at(-1);
  assert.equal(final.status, "lost");
  assert.equal(final.total, 99);
  assert.equal(final.fired, 99);
  assert.equal(final.sequenceCompleted, true);
  assertCleared(complete, "completedAt");
  console.log(
    "PASS real expert explosions activate flame jets and trails, then clear within 200 ms of completion",
  );
  console.log(
    `Flame evidence: ${JSON.stringify({
      mines: final.total,
      fired: final.fired,
      maxFlames: Math.max(
        ...complete.samples.map((sample) => sample.activeFlames),
      ),
      maxTrailVertices: Math.max(
        ...complete.samples.map((sample) => sample.trailVertices),
      ),
      cleanupMs: Math.round(complete.cleanAt - complete.completedAt),
    })}`,
  );

  await page.locator("#new-game").click();
  await page.waitForFunction(
    () => window.__surveyTest.getGame().status === "ready",
  );
  mineId = await startRound(page);
  await armProbe(page, "reset");
  await clickCell(page, mineId);
  await page.waitForFunction(() => {
    const scene = window.__surveyTest.getScene();
    return (
      scene.detonation.active &&
      scene.effects.flames.activeCount > 0 &&
      scene.effects.trails.visible
    );
  });
  await page.locator("#new-game").click();
  const reset = await readFinishedProbe(page);
  assert.ok(
    reset.samples.some(
      (sample) => sample.sequenceActive && sample.activeFlames > 0,
    ),
    "Restart must interrupt an active flame sequence",
  );
  assertCleared(reset, "resetAt");
  const resetState = await effectState(page);
  assert.deepEqual(resetState, {
    status: "ready",
    activeFlames: 0,
    trailsVisible: false,
    sequenceActive: false,
    sequenceCompleted: false,
    entries: 0,
  });
  console.log(
    "PASS restarting during visible flames clears the sequence, flame pool, and trails",
  );
  await context.close();

  const reducedContext = await browser.newContext({
    viewport: { width: 1360, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const reducedPage = await reducedContext.newPage();
  watchErrors(reducedPage, "reduced-motion");
  await openExpertGame(reducedPage);
  assert.equal(
    await reducedPage.evaluate(
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    true,
  );
  mineId = await startRound(reducedPage);
  await armProbe(reducedPage);
  await clickCell(reducedPage, mineId);
  const reduced = await readFinishedProbe(reducedPage);
  let previousFired = 0;
  for (const sample of reduced.samples) {
    assert.equal(
      sample.activeFlames,
      0,
      "Reduced motion must suppress flame jets",
    );
    assert.equal(
      sample.trailsVisible,
      false,
      "Reduced motion must suppress trails",
    );
    assert.ok(
      sample.fired >= previousFired,
      "Reduced-motion detonation must progress monotonically",
    );
    previousFired = sample.fired;
  }
  assert.ok(
    reduced.samples.some(
      (sample) => sample.fired > 0 && sample.fired < sample.total,
    ),
    "Reduced motion must retain sequential mine settlement",
  );
  assert.equal(reduced.samples.at(-1).fired, 99);
  assert.equal(reduced.samples.at(-1).status, "lost");
  assert.equal(reduced.samples.at(-1).sequenceCompleted, true);
  assertCleared(reduced, "completedAt");
  console.log(
    "PASS reduced motion settles all 99 mines sequentially without flame jets or trails",
  );
  await reducedContext.close();

  assert.deepEqual(
    BROWSER_ERRORS,
    [],
    "Browser console and WebGL must remain error-free",
  );
  console.log(
    "PASS no browser console errors, uncaught exceptions, or WebGL errors",
  );
} catch (error) {
  if (BROWSER_ERRORS.length) console.error(BROWSER_ERRORS.join("\n"));
  throw error;
} finally {
  await browser.close();
}
