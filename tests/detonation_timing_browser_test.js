import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.SURVEY_TEST_URL || "http://127.0.0.1:8765";
const ARTIFACT_DIR = resolve("artifacts");
const BROWSER_ERRORS = [];
const MAX_WALL_MS = 5500;

// Test hooks only inspect hidden board data and animation state; difficulty selection, reveals, and losses use real UI input.
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

await mkdir(ARTIFACT_DIR, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });

try {
  const context = await browser.newContext({
    viewport: { width: 1360, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on("pageerror", (error) => BROWSER_ERRORS.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" ||
      /(?:WebGL.*(?:error|context lost)|GL_INVALID|shader.*failed)/i.test(
        message.text(),
      )
    ) {
      BROWSER_ERRORS.push(message.text());
    }
  });
  await page.goto(`${BASE_URL}/?test=1`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.__surveyTest?.getScene()?.renderer);
  if (!(await page.locator("#preset-select").isVisible())) {
    await page.locator("#settings-btn").click();
  }
  await page.locator("#preset-select").selectOption("expert");
  await page.waitForFunction(() => {
    const game = window.__surveyTest.getGame();
    return game.width === 30 && game.height === 16 && game.mines === 99;
  });
  await page.locator("#scene-stage canvas").waitFor({ state: "visible" });
  // Allow the expert board to compile materials and settle its camera without changing the animation clock.
  await page.waitForTimeout(450);
  await clickCell(page, 255);
  await page.waitForFunction(
    () => window.__surveyTest.getGame().status === "playing",
  );
  const mineId = await page.evaluate(() => {
    const game = window.__surveyTest.getGame();
    return game.cells
      .filter((cell) => cell.mine && !cell.revealed && !cell.flagged)
      .sort(
        (a, b) => Math.hypot(a.x - 15, a.y - 8) - Math.hypot(b.x - 15, b.y - 8),
      )[0]?.id;
  });
  assert.ok(Number.isInteger(mineId), "Expert mode must contain a hidden mine");

  // Sample wall time in render frames so Node polling and screenshots cannot skew blast-density measurements.
  await page.evaluate(() => {
    const probe = {
      samples: [],
      startedAt: null,
      completedAt: null,
      complete: false,
      error: null,
    };
    window.__detonationTimingProbe = probe;
    const deadline = performance.now() + 12000;
    const sample = () => {
      const now = performance.now();
      const scene = window.__surveyTest.getScene();
      if (!scene) {
        probe.error = "The 3D scene became unavailable during timing";
        return;
      }
      const sequence = scene.detonation;
      if (sequence.entries.length) {
        if (probe.startedAt === null) probe.startedAt = now;
        probe.samples.push({
          wallMs: now - probe.startedAt,
          time: sequence.time,
          fired: sequence.entries.filter((entry) => entry.fired).length,
          total: sequence.entries.length,
          active: sequence.active,
          completed: sequence.completed,
          resultHidden: document.getElementById("result-panel").hidden,
        });
        if (sequence.completed) {
          probe.completedAt = now;
          probe.complete = true;
          return;
        }
      }
      if (now >= deadline) {
        probe.error =
          "The detonation sequence did not finish within 12 seconds";
        return;
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });

  await clickCell(page, mineId);
  await page.waitForFunction(
    () =>
      window.__detonationTimingProbe.complete ||
      window.__detonationTimingProbe.error,
  );
  const probe = await page.evaluate(() => window.__detonationTimingProbe);
  assert.equal(probe.error, null);
  assert.ok(
    probe.samples.length > 10,
    "Timing must include multiple real animation frames",
  );
  const samples = probe.samples;
  const last = samples.at(-1);
  const firstAllFired = samples.find((sample) => sample.fired === 99);
  assert.ok(firstAllFired, "All 99 mines must finish detonating");

  // Record each blast at the first frame that increases the fired count; dense bursts may share a frame.
  const observedBlasts = [];
  let previousFired = 0;
  for (const sample of samples) {
    assert.ok(sample.fired >= previousFired, "Fired count must never decrease");
    for (let count = previousFired; count < sample.fired; count += 1) {
      observedBlasts.push(sample.wallMs);
    }
    if (sample.active) {
      assert.equal(
        sample.resultHidden,
        true,
        "Results must remain hidden during the chain",
      );
    }
    previousFired = sample.fired;
  }
  const firstSecondCount = observedBlasts.filter((at) => at <= 1000).length;
  const lastBlastMs = observedBlasts.at(-1);
  const lastBlastSecondCount = observedBlasts.filter(
    (at) => at > lastBlastMs - 1000,
  ).length;
  const totalWallMs = probe.completedAt - probe.startedAt;
  const quarterSecondCounts = Array.from(
    { length: Math.ceil(lastBlastMs / 250) },
    (_, index) => ({
      startMs: index * 250,
      endMs: (index + 1) * 250,
      count: observedBlasts.filter(
        (at) => at >= index * 250 && at < (index + 1) * 250,
      ).length,
    }),
  );
  const report = {
    mode: "expert",
    mines: 99,
    fired: last.fired,
    firstSecondCount,
    lastBlastSecondCount,
    densityRatio: Number(
      (lastBlastSecondCount / Math.max(1, firstSecondCount)).toFixed(2),
    ),
    firstThreeBlastMs: observedBlasts.slice(0, 3).map(Math.round),
    lastBlastMs: Math.round(lastBlastMs),
    totalWallMs: Math.round(totalWallMs),
    sequenceTimeSeconds: Number(last.time.toFixed(3)),
    renderSamples: samples.length,
    quarterSecondCounts,
  };
  await writeFile(
    resolve(ARTIFACT_DIR, "detonation_timing.json"),
    `${JSON.stringify({ ...report, samples }, null, 2)}\n`,
  );
  console.log(`Observed expert timing: ${JSON.stringify(report)}`);
  console.log(
    `First 1 second: ${firstSecondCount} mines; final 1 second before last blast: ${lastBlastSecondCount} mines; total wall time: ${Math.round(totalWallMs)} ms`,
  );

  assert.equal(last.total, 99);
  assert.equal(last.fired, 99);
  assert.equal(last.completed, true);
  assert.equal(last.active, false);
  assert.ok(
    firstSecondCount >= 2 && firstSecondCount <= 12,
    `The first second must contain only a few separate blasts, observed ${firstSecondCount}`,
  );
  assert.ok(
    observedBlasts[1] - observedBlasts[0] >= 120 &&
      observedBlasts[2] - observedBlasts[1] >= 120,
    "The opening three blasts must remain individually perceptible",
  );
  assert.ok(
    lastBlastSecondCount >= 25 && lastBlastSecondCount >= firstSecondCount * 3,
    `The late blast window must be markedly denser than the opening: ${lastBlastSecondCount} vs ${firstSecondCount}`,
  );
  assert.ok(
    last.time <= 4.1,
    `The animation including its tail must fit within four seconds, observed ${last.time}`,
  );
  assert.ok(
    totalWallMs <= MAX_WALL_MS,
    `Real-browser completion must fit within ${MAX_WALL_MS} ms, observed ${totalWallMs}`,
  );
  await page.locator("#result-panel").waitFor({ state: "visible" });
  assert.equal(
    await page.evaluate(() => window.__surveyTest.getGame().status),
    "lost",
  );
  assert.deepEqual(
    BROWSER_ERRORS,
    [],
    "The browser and WebGL must remain error-free",
  );
  console.log(
    "PASS expert detonation opens sparsely, accelerates densely, and completes all 99 mines within the wall-time budget",
  );
  await context.close();
} catch (error) {
  if (BROWSER_ERRORS.length) console.error(BROWSER_ERRORS.join("\n"));
  throw error;
} finally {
  await browser.close();
}
