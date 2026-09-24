import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { orbitToDirection } from "./orbit_helpers.js";

const BASE_URL = process.env.SURVEY_TEST_URL || "http://127.0.0.1:8765";
const ARTIFACT_DIR = resolve("artifacts");
const checks = [];
const errors = [];

function passed(name, evidence = {}) {
  checks.push({ name, ...evidence });
  console.log(`PASS ${name}`);
}

function watchErrors(page, label) {
  page.on("pageerror", (error) => errors.push(`${label}: ${error.message}`));
  page.on("console", (message) => {
    if (
      message.type() === "error" ||
      /WebGL.*(?:error|context lost)|GL_INVALID|shader.*failed/i.test(
        message.text(),
      )
    )
      errors.push(`${label}: ${message.text()}`);
  });
}

async function frames(page, count = 3) {
  await page.evaluate(
    (remaining) =>
      new Promise((resolve) => {
        const next = () =>
          --remaining <= 0 ? resolve() : requestAnimationFrame(next);
        requestAnimationFrame(next);
      }),
    count,
  );
}

function rotateAroundY([x, y, z], angle) {
  return [
    x * Math.cos(angle) + z * Math.sin(angle),
    y,
    z * Math.cos(angle) - x * Math.sin(angle),
  ];
}

async function gameState(page) {
  return page.evaluate(() => {
    const game = window.__surveyTest.getGame();
    return {
      kind: game.topology?.kind || "plane",
      status: game.status,
      revealedCount: game.revealedCount,
      flagCount: game.flagCount,
      cells: game.cells.map((cell) => ({ ...cell })),
    };
  });
}

async function switchMode(page, kind) {
  if (!(await page.locator("#board-mode").isVisible())) {
    await page.locator("#settings-btn").click();
  }
  const before = await gameState(page);
  await page.locator("#board-mode").selectOption(kind);
  if (before.status === "playing") {
    await page.locator("#confirm-dialog").waitFor({ state: "visible" });
    await page.locator("#confirm-accept").click();
  }
  await page.waitForFunction((expected) => {
    const test = window.__surveyTest;
    return (
      (test.getGame().topology?.kind || "plane") === expected &&
      test.getScene()?.cosmos?.meteors
    );
  }, kind);
  await frames(page);
}

async function openSurface(page) {
  page.setDefaultTimeout(15000);
  await page.goto(`${BASE_URL}/?test=1`, { waitUntil: "networkidle" });
  await page.waitForFunction(
    () => window.__surveyTest?.getScene()?.cosmos?.meteors,
  );
  await switchMode(page, "surface");
}

async function aimCell(page, id) {
  await page.locator("#scene-stage").scrollIntoViewIfNeeded();
  // The public camera helper exposes a face; only real pointer input changes gameplay.
  await page.evaluate(
    (cellId) => window.__surveyTest.getScene().focus(cellId),
    id,
  );
  await frames(page);
  const point = await page.evaluate((cellId) => {
    const scene = window.__surveyTest.getScene();
    const projected = scene.projectCell(cellId);
    return {
      ...projected,
      hit: scene.pick({ clientX: projected.x, clientY: projected.y }),
    };
  }, id);
  assert.equal(
    point.visible,
    true,
    `Cell ${id} must remain visible against the sky`,
  );
  assert.equal(
    point.hit,
    id,
    "Background objects must never intercept a tile raycast",
  );
  return point;
}

async function revealCell(page, id, touch = false) {
  const point = await aimCell(page, id);
  if (touch) await page.touchscreen.tap(point.x, point.y);
  else await page.mouse.click(point.x, point.y);
  await frames(page);
  assert.equal((await gameState(page)).cells[id].revealed, true);
  return point;
}

async function backgroundState(page) {
  return page.evaluate(async () => {
    // Sample a rendered frame before ResizeObserver can change the next frame's projection.
    await new Promise(requestAnimationFrame);
    const scene = window.__surveyTest.getScene();
    const cosmos = scene.cosmos;
    cosmos.group.updateWorldMatrix(true, true);
    cosmos.skyCamera.updateMatrixWorld();
    const visible = (object) => {
      for (let current = object; current; current = current.parent) {
        if (!current.visible) return false;
      }
      return true;
    };
    const describe = (object) => {
      const point = scene.camera.position.clone();
      if (object === cosmos.stars) {
        point
          .fromBufferAttribute(object.geometry.attributes.position, 0)
          .applyMatrix4(object.matrixWorld);
      } else if (object === cosmos.galaxy) {
        // The shader's real world-to-galaxy basis defines a fixed direction along the band.
        point
          .set(0, 0, 1)
          .applyMatrix3(
            object.material.uniforms.uGalaxyFromWorld.value.clone().invert(),
          );
      } else object.getWorldPosition(point);
      return {
        name: object.name,
        visible: visible(object),
        backgroundOnly: object.userData.backgroundOnly,
        depthTest: object.material.depthTest,
        vertexCount: object.geometry.attributes.position.count,
        worldDirection: point.clone().normalize().toArray(),
        ndc: point.project(cosmos.skyCamera).toArray(),
      };
    };
    const raycaster = new scene.raycaster.constructor();
    let backgroundHits = 0;
    for (const x of [-0.9, -0.5, 0, 0.5, 0.9]) {
      for (const y of [-0.9, 0, 0.7, 0.9]) {
        raycaster.setFromCamera(
          new scene.pointer.constructor(x, y),
          scene.camera,
        );
        backgroundHits += raycaster.intersectObject(cosmos.group, true).length;
      }
    }
    const tileDepths =
      scene.cellFrames?.map(
        (frame) => frame.center.clone().project(scene.camera).z,
      ) || [];
    return {
      planet: describe(cosmos.planet),
      galaxy: describe(cosmos.galaxy),
      stars: describe(cosmos.stars),
      layout: { ...cosmos.layout },
      backgroundHits,
      furthestTileDepth: tileDepths.length ? Math.max(...tileDepths) : null,
      camera: scene.camera.position.toArray(),
      cameraDirection: scene.camera.position
        .clone()
        .sub(scene.controls.target)
        .normalize()
        .toArray(),
      cameraQuaternion: scene.camera
        .getWorldQuaternion(scene.camera.quaternion.clone())
        .toArray(),
      skyQuaternion: cosmos.skyCamera.quaternion.toArray(),
      anchorQuaternion: cosmos.skyRoot
        .getWorldQuaternion(scene.camera.quaternion.clone())
        .toArray(),
      skyFieldOfView: cosmos.skyCamera.fov,
      skyZoom: cosmos.skyCamera.zoom,
      zoom: scene.camera.zoom,
      memory: { ...scene.renderer.info.memory },
      canvasCount: document.querySelectorAll("#scene-stage canvas").length,
    };
  });
}

function validateBackground(evidence, initial = false) {
  assert.equal(evidence.planet.name, "jupiter");
  assert.equal(evidence.galaxy.name, "milky-way");
  for (const object of [evidence.planet, evidence.galaxy, evidence.stars]) {
    if (object !== evidence.planet || initial)
      assert.equal(object.visible, true, `${object.name} must be enabled`);
    assert.equal(object.backgroundOnly, true);
    assert.equal(object.depthTest, true);
    assert.ok(object.vertexCount > 0);
    assert.ok(object.ndc.every(Number.isFinite));
    assert.ok(Math.abs(Math.hypot(...object.worldDirection) - 1) < 1e-6);
  }
  assert.equal(evidence.backgroundHits, 0);
  assert.equal(evidence.canvasCount, 1);
  assert.equal(evidence.layout.anchored, true);
  assert.equal(
    evidence.skyZoom,
    1,
    "Board zoom must not magnify the distant sky",
  );
  const orientationDot = evidence.cameraQuaternion.reduce(
    (sum, value, index) => sum + value * evidence.skyQuaternion[index],
    0,
  );
  assert.ok(
    Math.abs(orientationDot) > 0.999999,
    "The real sky camera must follow the game camera's orientation",
  );
  if (initial) {
    const [x, y] = evidence.planet.ndc;
    assert.ok(Math.abs(x) < 1 && Math.abs(y) < 1);
    assert.equal(evidence.layout.planetVisible, true);
  }
  const depths = Object.values(evidence.layout.depths);
  assert.ok(depths.length >= 3 && depths.every(Number.isFinite));
  assert.ok(depths.every((depth) => depth > 0.99 && depth < 1));
  if (evidence.furthestTileDepth !== null) {
    assert.ok(
      Math.min(...depths) > evidence.furthestTileDepth,
      "The rendered sky depth must stay behind every solid tile",
    );
  }
}

function validateSkyRotation(
  before,
  after,
  { moved = false, returned = false } = {},
) {
  for (const name of ["planet", "galaxy", "stars"]) {
    assert.ok(
      Math.hypot(
        ...before[name].worldDirection.map(
          (v, i) => v - after[name].worldDirection[i],
        ),
      ) < 1e-6,
      `${name} must retain a fixed world direction`,
    );
    const screenShift = Math.hypot(
      ...before[name].ndc.slice(0, 2).map((v, i) => v - after[name].ndc[i]),
    );
    if (moved)
      assert.ok(
        screenShift > 0.03,
        `${name} must move across the viewport during a real orbit`,
      );
    if (returned)
      assert.ok(
        screenShift < 0.015,
        `${name} must return to its previous screen position`,
      );
  }
  assert.ok(
    before.anchorQuaternion.every(
      (v, i) => Math.abs(v - after.anchorQuaternion[i]) < 1e-6,
    ),
  );
  assert.equal(after.skyFieldOfView, before.skyFieldOfView);
}

async function meteorState(page) {
  return page.evaluate(() => {
    const meteors = window.__surveyTest.getScene().cosmos.meteors;
    return {
      active: meteors.activeCount,
      launched: meteors.launchCount,
      completed: meteors.completedCount,
      groups: meteors.groupCount,
      capacity: meteors.capacity,
      nextIn: meteors.nextIn,
      entries: meteors.activeMeteors,
      draws: meteors.group.children.map((object) => ({
        name: object.name,
        visible: object.visible,
        count: object.geometry.drawRange.count,
      })),
    };
  });
}

async function observeMeteors(page) {
  await page.evaluate(() => {
    const scene = window.__surveyTest.getScene();
    const trace = {
      started: performance.now(),
      frames: [],
      stopped: false,
    };
    window.__cosmicMeteorTrace = trace;
    const sample = () => {
      if (window.__surveyTest.getScene() !== scene) {
        trace.stopped = true;
        return;
      }
      const meteors = scene.cosmos.meteors;
      trace.frames.push({
        at: performance.now() - trace.started,
        active: meteors.activeCount,
        launched: meteors.launchCount,
        completed: meteors.completedCount,
        entries: meteors.activeMeteors,
      });
      if (trace.frames.length < 2500) requestAnimationFrame(sample);
      else trace.stopped = true;
    };
    requestAnimationFrame(sample);
  });
}

await mkdir(ARTIFACT_DIR, { recursive: true });
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
});
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  watchErrors(page, "cosmic-desktop");
  await openSurface(page);
  await observeMeteors(page);
  const initialBackground = await backgroundState(page);
  validateBackground(initialBackground, true);
  await page.screenshot({
    path: resolve(ARTIFACT_DIR, "cosmic_desktop.png"),
  });

  // No effect is started or advanced by this test: wait for the real render loop's schedule.
  const naturalStarted = Date.now();
  await page.waitForFunction(
    () => window.__surveyTest.getScene().cosmos.meteors.activeCount > 0,
  );
  const naturalActive = await meteorState(page);
  assert.ok(naturalActive.active <= naturalActive.capacity);
  assert.ok(
    naturalActive.entries.every(
      (entry) =>
        Number.isFinite(entry.x) &&
        Number.isFinite(entry.y) &&
        entry.progress >= 0 &&
        entry.progress < 1,
    ),
  );
  await page.screenshot({
    path: resolve(ARTIFACT_DIR, "cosmic_natural_meteor.png"),
  });
  await page.waitForFunction(
    () => {
      const meteors = window.__surveyTest.getScene().cosmos.meteors;
      return meteors.completedCount > 0 && meteors.activeCount === 0;
    },
    null,
    { timeout: 5000 },
  );
  const naturalDone = await meteorState(page);
  assert.equal(naturalDone.launched, naturalDone.completed);
  assert.ok(naturalDone.nextIn > 0);
  assert.ok(
    naturalDone.draws.every((draw) => !draw.visible && draw.count === 0),
  );
  const naturalTrace = await page.evaluate(
    () => window.__cosmicMeteorTrace.frames,
  );
  assert.ok(naturalTrace.some((frame) => frame.active > 0));
  assert.ok(
    Math.max(...naturalTrace.map((frame) => frame.active)) <=
      naturalDone.capacity,
  );
  assert.ok(
    naturalTrace.some((frame) =>
      frame.entries.some((entry) => entry.progress > 0.2),
    ),
    "A naturally launched meteor must visibly travel before retirement",
  );
  passed(
    "Jupiter and the Milky Way render behind the solid; natural meteors travel and retire",
    {
      planetNdc: initialBackground.planet.ndc,
      depths: initialBackground.layout.depths,
      naturalWallMs: Date.now() - naturalStarted,
      launched: naturalDone.launched,
      completed: naturalDone.completed,
      peakActive: Math.max(...naturalTrace.map((frame) => frame.active)),
    },
  );

  await revealCell(page, 21);
  let game = await gameState(page);
  assert.equal(game.status, "playing");
  assert.equal(game.cells[21].adjacent, 0);
  // Start the visual orbit from the initial view, with Jupiter genuinely on screen.
  await page.locator("#reset-camera").click();
  await frames(page, 8);
  const beforeDrag = await backgroundState(page);
  validateBackground(beforeDrag, true);
  await orbitToDirection(page, rotateAroundY(beforeDrag.cameraDirection, 0.48));
  assert.deepEqual(
    await gameState(page),
    game,
    "Orbiting must not change the board",
  );
  const afterDrag = await backgroundState(page);
  validateBackground(afterDrag);
  validateSkyRotation(beforeDrag, afterDrag, { moved: true });
  assert.ok(
    afterDrag.camera.some(
      (value, index) => Math.abs(value - beforeDrag.camera[index]) > 0.01,
    ),
  );
  await orbitToDirection(page, beforeDrag.cameraDirection);
  const returned = await backgroundState(page);
  validateBackground(returned);
  validateSkyRotation(beforeDrag, returned, { returned: true });
  await page.mouse.wheel(0, -220);
  await frames(page, 6);
  const afterZoom = await backgroundState(page);
  validateBackground(afterZoom);
  validateSkyRotation(returned, afterZoom, { returned: true });
  assert.ok(
    afterZoom.zoom > afterDrag.zoom,
    "A real wheel gesture must zoom the board",
  );
  assert.deepEqual(await gameState(page), game);
  const numbered = game.cells.find((cell) => !cell.mine && cell.adjacent > 0);
  assert.ok(numbered);
  await revealCell(page, numbered.id);
  const point = await aimCell(page, numbered.id);
  await page.mouse.move(point.x, point.y);
  await frames(page);
  const selected = await page.evaluate((id) => {
    const scene = window.__surveyTest.getScene();
    return {
      selected: scene.activeCellId,
      labelVisible: scene.visibleLabelIds.includes(id),
    };
  }, numbered.id);
  assert.equal(selected.selected, numbered.id);
  assert.equal(selected.labelVisible, true);
  await page.screenshot({
    path: resolve(ARTIFACT_DIR, "cosmic_orbit_zoom.png"),
  });
  passed(
    "Real orbit moves the fixed celestial sky, reversing returns it, and zoom preserves tile input",
    {
      zoom: [afterDrag.zoom, afterZoom.zoom],
      selectedNumberedTile: numbered.id,
      planetBeforeOrbit: beforeDrag.planet.ndc,
      planetAfterOrbit: afterDrag.planet.ndc,
      planetAfterReturn: returned.planet.ndc,
      planetAfterZoom: afterZoom.planet.ndc,
    },
  );

  await page.waitForFunction(
    () => window.__surveyTest.getScene().cosmos.meteors.activeCount > 0,
  );
  const beforeReduce = await meteorState(page);
  const reduceStarted = Date.now();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(
    () => {
      const meteors = window.__surveyTest.getScene().cosmos.meteors;
      return meteors.activeCount === 0 && meteors.nextIn === null;
    },
    null,
    { timeout: 1500 },
  );
  const clearWallMs = Date.now() - reduceStarted;
  assert.ok(
    clearWallMs <= 500,
    `Reduced motion must clear the live sky promptly (${clearWallMs} ms)`,
  );
  const reduced = await meteorState(page);
  assert.ok(reduced.draws.every((draw) => !draw.visible && draw.count === 0));
  await frames(page, 6);
  assert.equal((await meteorState(page)).launched, reduced.launched);
  const reducedBeforeOrbit = await backgroundState(page);
  const reducedGame = await gameState(page);
  await orbitToDirection(
    page,
    rotateAroundY(reducedBeforeOrbit.cameraDirection, 0.25),
  );
  const reducedAfterOrbit = await backgroundState(page);
  validateBackground(reducedAfterOrbit);
  validateSkyRotation(reducedBeforeOrbit, reducedAfterOrbit, {
    moved: true,
  });
  assert.deepEqual(await gameState(page), reducedGame);
  assert.equal((await meteorState(page)).active, 0);
  assert.equal((await meteorState(page)).nextIn, null);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await frames(page, 2);
  const resumed = await meteorState(page);
  assert.equal(resumed.active, 0);
  assert.equal(
    resumed.launched,
    reduced.launched,
    "Resuming must not replay suppressed meteors",
  );
  assert.ok(
    resumed.nextIn > 1 && resumed.nextIn <= 4,
    "Resuming must schedule a fresh pause instead of catching up",
  );
  passed(
    "Reduced motion clears meteors without locking camera control and resumes with a fresh pause",
    {
      interrupted: beforeReduce.active,
      clearWallMs,
      resumedNextIn: resumed.nextIn,
    },
  );

  // Keep optional meteor draws inactive so equal fresh scenes have comparable GPU allocations.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await frames(page);
  // Hold only retired diagnostic references, without modifying production scene state.
  await page.evaluate(() => {
    window.__cosmicRetired = [];
  });
  const resourceSamples = { plane: [], surface: [] };
  for (const kind of ["plane", "surface", "plane", "surface"]) {
    await page.evaluate(() =>
      window.__cosmicRetired.push(window.__surveyTest.getScene().cosmos),
    );
    await switchMode(page, kind);
    // Let resize-driven composer targets be allocated again before comparing live resources.
    await frames(page, 8);
    const sample = await backgroundState(page);
    validateBackground(sample);
    resourceSamples[kind].push(sample.memory);
  }
  assert.deepEqual(resourceSamples.plane[1], resourceSamples.plane[0]);
  assert.deepEqual(resourceSamples.surface[1], resourceSamples.surface[0]);
  const retired = await page.evaluate(() =>
    window.__cosmicRetired.map((cosmos) => ({
      attached: cosmos.group.parent !== null,
      children: cosmos.group.children.length,
      active: cosmos.meteors.activeCount,
      meteorChildren: cosmos.meteors.group.children.length,
      nextIn: cosmos.meteors.nextIn,
    })),
  );
  for (const old of retired) {
    assert.deepEqual(old, {
      attached: false,
      children: 0,
      active: 0,
      meteorChildren: 0,
      nextIn: null,
    });
  }
  assert.equal(
    await page.evaluate(() => window.__cosmicMeteorTrace.stopped),
    true,
  );
  passed(
    "Repeated board-mode switches keep resources stable and dispose retired skies",
    { resourceSamples },
  );
  await writeFile(
    resolve(ARTIFACT_DIR, "cosmic_meteor_trace.json"),
    JSON.stringify(naturalTrace, null, 2),
  );
  await context.close();

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  const mobile = await mobileContext.newPage();
  watchErrors(mobile, "cosmic-mobile");
  await openSurface(mobile);
  validateBackground(await backgroundState(mobile), true);
  await revealCell(mobile, 21, true);
  game = await gameState(mobile);
  assert.equal(game.status, "playing");
  const mobilePoint = await aimCell(mobile, 21);
  const mobileBefore = await backgroundState(mobile);
  const cdp = await mobileContext.newCDPSession(mobile);
  // CDP sends real native touch events, including the two-finger pinch used by the scene controls.
  const sendTouch = (type, points) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: points.map(([x, y], id) => ({ x, y, id })),
    });
  await sendTouch("touchStart", [[mobilePoint.x, mobilePoint.y]]);
  for (let step = 1; step <= 8; step += 1) {
    await sendTouch("touchMove", [
      [mobilePoint.x + step * 8, mobilePoint.y + step * 2],
    ]);
  }
  await sendTouch("touchEnd", []);
  await frames(mobile, 6);
  assert.deepEqual(await gameState(mobile), game);
  const mobileOrbit = await backgroundState(mobile);
  validateBackground(mobileOrbit);
  validateSkyRotation(mobileBefore, mobileOrbit, { moved: true });
  assert.ok(
    mobileOrbit.camera.some(
      (value, index) => Math.abs(value - mobileBefore.camera[index]) > 0.01,
    ),
  );
  const rect = await mobile.locator("#scene-stage canvas").boundingBox();
  assert.ok(rect);
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  await sendTouch("touchStart", [
    [centerX - 32, centerY],
    [centerX + 32, centerY],
  ]);
  for (let step = 1; step <= 8; step += 1) {
    const offset = 32 + step * 4;
    await sendTouch("touchMove", [
      [centerX - offset, centerY],
      [centerX + offset, centerY],
    ]);
  }
  await sendTouch("touchEnd", []);
  await frames(mobile, 6);
  const mobileZoom = await backgroundState(mobile);
  validateBackground(mobileZoom);
  assert.ok(
    mobileZoom.zoom > mobileOrbit.zoom,
    "A real two-finger pinch must zoom the board",
  );
  assert.deepEqual(await gameState(mobile), game);
  const mobileNumber = game.cells.find(
    (cell) => !cell.mine && cell.adjacent > 0,
  );
  assert.ok(mobileNumber);
  await revealCell(mobile, mobileNumber.id, true);
  const width = await mobile.evaluate(() => ({
    viewport: innerWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  assert.ok(
    width.scroll <= width.viewport,
    `Mobile must not overflow horizontally: ${JSON.stringify(width)}`,
  );
  await mobile.screenshot({
    path: resolve(ARTIFACT_DIR, "cosmic_mobile.png"),
    fullPage: true,
  });
  await cdp.detach();
  passed(
    "390px touch orbit, pinch and real numbered-tile taps preserve a visible background",
    {
      width,
      zoom: [mobileOrbit.zoom, mobileZoom.zoom],
      selectedNumberedTile: mobileNumber.id,
    },
  );
  await mobileContext.close();
  assert.deepEqual(errors, [], "Browser and WebGL errors must be absent");
  await writeFile(
    resolve(ARTIFACT_DIR, "cosmic_background_metrics.json"),
    JSON.stringify({ checks, errors }, null, 2),
  );
  console.log(
    `${checks.length}/${checks.length} cosmic background checks passed; no browser or WebGL errors.`,
  );
} finally {
  await browser.close();
}
