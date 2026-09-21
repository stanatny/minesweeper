import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const BASE_URL = process.env.SURVEY_TEST_URL || "http://127.0.0.1:8765";
const ARTIFACT_DIR = resolve("artifacts");
const ERRORS = [];
const CHECKS = [];
const EXPECTED_CONTEXT_LOSS = new WeakSet();

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
    ) {
      ERRORS.push(`${label}: ${message.text()}`);
    }
  });
}

// Geometry and answers are inspected only through the localhost test hook; gameplay uses real input.
async function state(page) {
  return page.evaluate(() => {
    const game = window.__surveyTest.getGame();
    const topology = game.topology;
    return {
      kind: topology?.kind || "plane",
      status: game.status,
      mines: game.mines,
      revealedCount: game.revealedCount,
      flagCount: game.flagCount,
      cells: game.cells.map((cell) => ({ ...cell })),
      topology: topology?.kind === "surface" ? topology : null,
    };
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
  await page.locator("#board-mode").waitFor({ state: "attached" });
  await showSettings(page);
  assert.equal(await page.locator("#board-mode").inputValue(), "plane");
  assert.equal((await state(page)).kind, "plane");
}

async function showSettings(page) {
  if (!(await page.locator("#board-mode").isVisible())) {
    await page.locator("#settings-btn").click();
    await page.locator("#board-mode").waitFor({ state: "visible" });
  }
}

async function showSurfaceGenerator(page) {
  await showSettings(page);
  if (
    !(await page
      .locator("#surface-generator")
      .evaluate((element) => element.open))
  ) {
    await page.locator("#surface-generator > summary").click();
  }
}

async function selectShape(page, shape) {
  await showSurfaceGenerator(page);
  await page.locator("#surface-shape").selectOption(shape);
}

async function waitMode(page, kind) {
  await page.waitForFunction((expected) => {
    const test = window.__surveyTest;
    return (
      (test.getGame().topology?.kind || "plane") === expected &&
      test.getScene()?.renderer
    );
  }, kind);
  await frames(page);
}

async function switchMode(page, kind, accept = true) {
  const before = await state(page);
  await showSettings(page);
  await page.locator("#board-mode").selectOption(kind);
  if (before.status === "playing") {
    await page.locator("#confirm-dialog").waitFor({ state: "visible" });
    await page.locator(accept ? "#confirm-accept" : "#confirm-cancel").click();
  }
  await waitMode(page, accept ? kind : before.kind);
}

async function setRange(page, selector, value) {
  await showSurfaceGenerator(page);
  const input = page.locator(selector);
  const range = await input.evaluate((element) => ({
    min: Number(element.min),
    max: Number(element.max),
    step: Number(element.step || 1),
  }));
  assert.ok(
    value >= range.min && value <= range.max,
    `${selector} must support ${value}`,
  );
  const fromStart = Math.round((value - range.min) / range.step);
  const fromEnd = Math.round((range.max - value) / range.step);
  await input.focus();
  await page.keyboard.press(fromStart <= fromEnd ? "Home" : "End");
  for (let index = 0; index < Math.min(fromStart, fromEnd); index += 1) {
    await page.keyboard.press(
      fromStart <= fromEnd ? "ArrowRight" : "ArrowLeft",
    );
  }
  assert.equal(Number(await input.inputValue()), value);
}

async function generate(page, accept = true) {
  const before = await state(page);
  await showSurfaceGenerator(page);
  await page.locator("#surface-generate").click();
  if (before.status === "playing") {
    await page.locator("#confirm-dialog").waitFor({ state: "visible" });
    await page.locator(accept ? "#confirm-accept" : "#confirm-cancel").click();
  }
  if (accept)
    await page.waitForFunction(
      () => window.__surveyTest.getGame().status === "ready",
    );
  await frames(page);
}

async function aimCell(page, id) {
  // focus() only positions the camera; it never changes a cell or substitutes for a real click.
  await page.locator("#scene-stage").scrollIntoViewIfNeeded();
  await page.evaluate(
    (cellId) => window.__surveyTest.getScene().focus(cellId),
    id,
  );
  await frames(page);
  const point = await page.evaluate(
    (cellId) => window.__surveyTest.getScene().projectCell(cellId),
    id,
  );
  assert.ok(
    Number.isFinite(point.x) && Number.isFinite(point.y),
    `Cell ${id} must have finite screen coordinates`,
  );
  assert.equal(
    point.visible,
    true,
    `Focused surface cell ${id} must be visible`,
  );
  return point;
}

async function activateCell(page, id, options = {}) {
  const point = await aimCell(page, id);
  if (options.touch) await page.touchscreen.tap(point.x, point.y);
  else {
    const { touch, ...mouseOptions } = options;
    await page.mouse.click(point.x, point.y, mouseOptions);
  }
  await frames(page, 2);
}

async function restart(page, result = false) {
  const before = await state(page);
  await page.locator(result ? "#result-restart" : "#new-game").click();
  if (before.status === "playing")
    await page.locator("#confirm-accept").click();
  await page.waitForFunction(
    () => window.__surveyTest.getGame().status === "ready",
  );
  await frames(page);
}

function graph(game) {
  return game.topology.cells.map((cell) => cell.neighbors);
}

const subtract = (a, b) => a.map((value, index) => value - b[index]);
const dot = (a, b) =>
  a.reduce((sum, value, index) => sum + value * b[index], 0);

function validateTiles(game) {
  const cells = game.topology.cells;
  const counts = Array(6).fill(0),
    lengths = [],
    areas = [];
  for (const cell of cells) {
    counts[cell.face] += 1;
    const edges = cell.corners.map((point, index) =>
      subtract(cell.corners[(index + 1) % 4], point),
    );
    for (const edge of edges) {
      const length = Math.hypot(...edge);
      lengths.push(length);
      assert.ok(
        Math.abs(length - 1) < 1e-8,
        `Tile ${cell.id} must have unit edges`,
      );
      assert.ok(Math.abs(dot(edge, cell.normal)) < 1e-8);
    }
    assert.ok(
      Math.abs(dot(edges[0], edges[1])) < 1e-8,
      "Every tile must have right angles",
    );
    const area = Math.sqrt(
      dot(edges[0], edges[0]) * dot(edges[1], edges[1]) -
        dot(edges[0], edges[1]) ** 2,
    );
    areas.push(area);
    assert.ok(Math.abs(area - 1) < 1e-8, "Every tile must have unit area");
    const center = [0, 1, 2].map(
      (axis) => cell.corners.reduce((sum, point) => sum + point[axis], 0) / 4,
    );
    assert.ok(Math.hypot(...subtract(center, cell.center)) < 1e-8);
    assert.equal(
      cell.normal.filter((value) => Math.abs(value) === 1).length,
      1,
    );
    assert.equal(dot(cell.normal, cell.normal), 1);
    assert.equal(new Set(cell.neighbors).size, cell.neighbors.length);
    for (const neighbor of cell.neighbors) {
      assert.ok(
        neighbor !== cell.id && cells[neighbor]?.neighbors.includes(cell.id),
        "Tile adjacency must be valid and symmetric",
      );
    }
  }
  assert.deepEqual(counts, Array(6).fill(game.topology.resolution ** 2));
  assert.equal(
    Math.max(...graph(game).map((neighbors) => neighbors.length)),
    game.topology.maxDegree,
  );
  return {
    tiles: cells.length,
    edgeRange: [Math.min(...lengths), Math.max(...lengths)],
    areaRange: [Math.min(...areas), Math.max(...areas)],
    maxDegree: game.topology.maxDegree,
  };
}

function isConcave(game, id) {
  const cell = game.topology.cells[id];
  return cell.neighbors.some((neighborId) => {
    const neighbor = game.topology.cells[neighborId];
    return (
      dot(cell.normal, neighbor.normal) === 0 &&
      dot(subtract(neighbor.center, cell.center), cell.normal) > 0.1
    );
  });
}

async function labelMatrix(page, id) {
  return page.evaluate((cellId) => {
    const scene = window.__surveyTest.getScene();
    for (const mesh of scene.labelMeshes) {
      const index = mesh.userData.cellIds.indexOf(cellId);
      if (index < 0) continue;
      const matrix = mesh.matrix.clone();
      mesh.getMatrixAt(index, matrix);
      matrix.premultiply(mesh.matrixWorld);
      return matrix.toArray();
    }
    throw new Error(`Visible cell ${cellId} has no number instance`);
  }, id);
}

async function verifyFixedNumber(page, game, id) {
  const cell = game.topology.cells[id];
  const opposite = game.topology.cells.find(
    (other) => dot(other.normal, cell.normal) === -1,
  );
  await aimCell(page, opposite.id);
  const point = await aimCell(page, id);
  const before = await labelMatrix(page, id);
  const offset = subtract(before.slice(12, 15), cell.center);
  const depth = dot(offset, cell.normal);
  assert.ok(
    depth > 0.005 && depth < 0.04,
    "A number must sit just above its tile plane",
  );
  assert.ok(
    Math.hypot(
      ...subtract(
        offset,
        cell.normal.map((value) => value * depth),
      ),
    ) < 1e-5,
  );
  const normal = before.slice(8, 11),
    length = Math.hypot(...normal);
  assert.ok(
    dot(
      normal.map((value) => value / length),
      cell.normal,
    ) > 0.99999,
  );
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x + 24, point.y + 9, { steps: 6 });
  await page.mouse.up();
  await frames(page, 6);
  const after = await labelMatrix(page, id);
  assert.ok(
    before.every((value, index) => Math.abs(value - after[index]) < 1e-6),
    "Orbiting must not billboard, rotate, or move face-mounted numbers",
  );
  assert.deepEqual(await state(page), game, "Orbiting must preserve the round");
  await capture(page, "solid_numbers_after_orbit.png");
}

function isSeam(game, id) {
  const cell = game.topology.cells[id];
  return cell.neighbors.some(
    (other) => game.topology.cells[other].face !== cell.face,
  );
}

async function capture(page, name) {
  await page.screenshot({ path: resolve(ARTIFACT_DIR, name), fullPage: true });
}

async function revealFirst(page, touch = false) {
  const game = await state(page);
  const n = game.topology.resolution;
  const id = Math.floor(n / 2) * n + Math.floor(n / 2);
  await activateCell(page, id, { touch });
  const after = await state(page);
  assert.equal(after.status, "playing");
  assert.equal(after.cells[id].revealed, true);
  assert.equal(after.cells[id].adjacent, 0);
  for (const neighbor of [id, ...after.topology.cells[id].neighbors]) {
    assert.equal(
      after.cells[neighbor].mine,
      false,
      "The first reveal must protect the actual surface neighborhood",
    );
  }
  return id;
}

async function resourceState(page) {
  await frames(page, 6);
  return page.evaluate(() => {
    const scene = window.__surveyTest.getScene();
    return {
      geometries: scene.renderer.info.memory.geometries,
      textures: scene.renderer.info.memory.textures,
      canvases: document.querySelectorAll("#scene-stage canvas").length,
    };
  });
}

async function retainRenderer(page) {
  await page.evaluate(() => {
    window.__surfaceRetiredRenderers ??= [];
    const scene = window.__surveyTest.getScene();
    const builtins = new Set();
    // Three.js r186 retains its global PBR lookup texture after renderer disposal.
    // Identify that exact allocated texture instead of tolerating unknown leftovers.
    scene.scene.traverse((object) => {
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      for (const material of materials.filter(Boolean)) {
        const texture =
          scene.renderer.properties.get(material).uniforms?.dfgLUT?.value;
        if (
          texture?.name === "DFG_LUT" &&
          texture.image?.width === 16 &&
          texture.image?.height === 16 &&
          scene.renderer.properties.get(texture).__webglTexture
        ) {
          builtins.add(texture);
        }
      }
    });
    window.__surfaceRetiredRenderers.push({
      renderer: scene.renderer,
      builtinTextureCount: builtins.size,
    });
  });
}

await mkdir(ARTIFACT_DIR, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  const page = await desktopContext.newPage();
  watchErrors(page, "surface-desktop");
  await openGame(page);
  await switchMode(page, "surface");
  let game = await state(page);
  assert.equal(game.cells.length, 216);
  assert.equal(game.topology.resolution, 6);
  assert.equal(game.topology.shape, "stepped");
  assert.equal(await page.locator("#surface-settings").isVisible(), true);
  assert.equal(await page.locator("#plane-settings").isVisible(), false);
  assert.equal(
    Number(await page.locator("#surface-irregularity").inputValue()),
    45,
  );
  const leakedKeys = await page.evaluate(() => {
    const geometry = JSON.stringify(
      window.__surveyTest.getGame().snapshot().topology,
    );
    return (
      geometry.match(
        /"(?:mine|mines|flagged|revealed|adjacent|exploded)"\s*:/g,
      ) || []
    );
  });
  assert.deepEqual(
    leakedKeys,
    [],
    "Presentation topology must contain geometry without hidden answers",
  );
  const defaultMetrics = validateTiles(game);
  const rendered = await page.evaluate(() => {
    const scene = window.__surveyTest.getScene();
    const scales = scene.cellFrames.map((frame) => frame.scale);
    return {
      scaleRange: [Math.min(...scales), Math.max(...scales)],
      numberCapacity: scene.labelMeshes.length,
    };
  });
  assert.deepEqual(rendered.scaleRange, [1, 1]);
  assert.ok(rendered.numberCapacity >= game.topology.maxDegree);
  const firstId = await revealFirst(page);
  passed(
    "default solid has 216 equal square tiles and a safe real first reveal",
    { ...defaultMetrics, ...rendered },
  );

  game = await state(page);
  const concave = game.cells.find(
    (cell) => !cell.mine && !cell.revealed && isConcave(game, cell.id),
  );
  assert.ok(
    concave,
    "The stepped fixture must offer a covered safe tile inside a concave corner",
  );
  await activateCell(page, concave.id);
  game = await state(page);
  assert.equal(game.cells[concave.id].revealed, true);
  const firstNormal = game.topology.cells[firstId].normal;
  const onBack = (cell) =>
    game.topology.cells[cell.id].normal.reduce(
      (sum, component, index) => sum + component * firstNormal[index],
      0,
    ) < -0.4;
  const backMine = game.cells.find(
    (cell) => cell.mine && !cell.revealed && onBack(cell),
  );
  const backSafe = game.cells.find(
    (cell) => !cell.mine && !cell.revealed && onBack(cell),
  );
  assert.ok(
    backMine && backSafe,
    "The opposite face must contain covered safe and mined tiles",
  );
  await activateCell(page, backMine.id, { button: "right" });
  assert.equal((await state(page)).cells[backMine.id].flagged, true);
  await activateCell(page, backMine.id, { button: "right" });
  assert.equal((await state(page)).cells[backMine.id].flagged, false);
  await activateCell(page, backSafe.id);
  assert.equal((await state(page)).cells[backSafe.id].revealed, true);
  const dragPoint = await aimCell(page, backSafe.id);
  const beforeDrag = await state(page);
  const cameraBefore = await page.evaluate(() =>
    window.__surveyTest.getScene().camera.position.toArray(),
  );
  await page.mouse.move(dragPoint.x, dragPoint.y);
  await page.mouse.down();
  await page.mouse.move(dragPoint.x + 110, dragPoint.y + 35, { steps: 12 });
  await page.mouse.up();
  await frames(page, 6);
  assert.deepEqual(
    await state(page),
    beforeDrag,
    "Orbiting must not reveal or mark a surface cell",
  );
  const cameraAfter = await page.evaluate(() =>
    window.__surveyTest.getScene().camera.position.toArray(),
  );
  assert.ok(
    cameraBefore.some(
      (value, index) => Math.abs(value - cameraAfter[index]) > 0.01,
    ),
  );
  game = await state(page);
  const seamCell = game.cells.find(
    (cell) => !cell.mine && cell.adjacent > 0 && isSeam(game, cell.id),
  );
  assert.ok(
    seamCell,
    "The seeded board must expose a safe numbered cell at a face seam",
  );
  const seamId = seamCell.id;
  if (!seamCell.revealed) await activateCell(page, seamId);
  game = await state(page);
  const seamPoint = await aimCell(page, seamId);
  await page.mouse.move(seamPoint.x, seamPoint.y);
  await frames(page);
  const hover = await page.evaluate(() => {
    const scene = window.__surveyTest.getScene();
    return {
      id: scene.activeCellId,
      highlighted: [...scene.highlightedIds],
      labels: [...scene.visibleLabelIds],
    };
  });
  assert.equal(hover.id, seamId);
  assert.ok(
    hover.labels.includes(seamId),
    "A focused numbered seam cell must retain its visible number label",
  );
  assert.deepEqual(
    hover.highlighted.sort((a, b) => a - b),
    [seamId, ...game.topology.cells[seamId].neighbors].sort((a, b) => a - b),
  );
  assert.equal(
    Math.max(...graph(game).map((neighbors) => neighbors.length)),
    game.topology.maxDegree,
  );
  for (const cell of game.cells.filter(
    (cell) => cell.revealed && isSeam(game, cell.id),
  )) {
    const actual = game.topology.cells[cell.id].neighbors.filter(
      (id) => game.cells[id].mine,
    ).length;
    assert.equal(
      cell.adjacent,
      actual,
      "Seam numbers must count neighbors across faces",
    );
  }
  await verifyFixedNumber(page, game, seamId);
  await capture(page, "surface_desktop.png");
  passed(
    "concave and back-face input, fixed face numbers, orbiting, and cross-seam highlights work",
  );

  const beforeDraft = await state(page);
  await setRange(page, "#surface-area", 8);
  await setRange(page, "#surface-irregularity", 65);
  await setRange(page, "#surface-density", 12);
  await selectShape(page, "terrace");
  assert.deepEqual(
    await state(page),
    beforeDraft,
    "Draft controls must not alter the current round",
  );
  await generate(page, false);
  assert.deepEqual(
    await state(page),
    beforeDraft,
    "Canceling Generate must preserve the board and shape",
  );
  await generate(page);
  game = await state(page);
  assert.equal(game.cells.length, 384);
  assert.equal(game.topology.resolution, 8);
  assert.equal(game.topology.shape, "terrace");
  assert.ok(Math.abs(game.topology.irregularity - 0.65) < 0.00001);
  assert.ok(Math.abs(game.mines - game.cells.length * 0.12) <= 1);
  assert.notEqual(game.topology.seed, beforeDraft.topology.seed);
  validateTiles(game);
  const originalShape = game.topology.cells.map((cell) => cell.center);
  await selectShape(page, "cube");
  assert.equal(await page.locator("#surface-irregularity").isDisabled(), true);
  assert.equal(
    Number(await page.locator("#surface-irregularity").inputValue()),
    65,
  );
  await generate(page);
  game = await state(page);
  assert.equal(game.topology.shape, "cube");
  assert.equal(game.topology.irregularity, 0);
  assert.equal(game.cells.length, 384);
  validateTiles(game);
  assert.notDeepEqual(
    game.topology.cells.map((cell) => cell.center),
    originalShape,
  );
  await selectShape(page, "terrace");
  assert.equal(await page.locator("#surface-irregularity").isDisabled(), false);
  assert.equal(
    Number(await page.locator("#surface-irregularity").inputValue()),
    65,
  );
  await setRange(page, "#surface-irregularity", 20);
  await generate(page);
  validateTiles(await state(page));
  await page.locator("#top-view").click();
  assert.equal(
    await page.evaluate(() => window.__surveyTest.getScene().topView),
    true,
  );
  await generate(page);
  assert.equal(
    await page.locator("#top-view").getAttribute("aria-pressed"),
    "true",
  );
  assert.equal(
    await page.evaluate(() => window.__surveyTest.getScene().topView),
    true,
  );
  await page.locator("#top-view").click();
  assert.equal(
    await page.locator("#top-view").getAttribute("aria-pressed"),
    "false",
  );
  assert.equal(
    await page.evaluate(() => window.__surveyTest.getScene().topView),
    false,
  );
  await revealFirst(page);
  const beforeModeCancel = await state(page);
  await switchMode(page, "plane", false);
  assert.equal(await page.locator("#board-mode").inputValue(), "surface");
  assert.deepEqual(await state(page), beforeModeCancel);
  await switchMode(page, "plane");
  assert.equal(await page.locator("#plane-settings").isVisible(), true);
  assert.equal(await page.locator("#surface-settings").isVisible(), false);
  await switchMode(page, "surface");
  const baselineResources = await resourceState(page);
  for (let cycle = 0; cycle < 2; cycle += 1) {
    await retainRenderer(page);
    await switchMode(page, "plane");
    await retainRenderer(page);
    await switchMode(page, "surface");
    assert.deepEqual(
      await resourceState(page),
      baselineResources,
      "Repeated mode changes must not accumulate live renderer resources or canvases",
    );
  }
  const retired = await page.evaluate(() =>
    window.__surfaceRetiredRenderers.map(
      ({ renderer, builtinTextureCount }) => ({
        ...renderer.info.memory,
        builtinTextureCount,
      }),
    ),
  );
  for (const memory of retired) {
    assert.equal(
      memory.geometries,
      0,
      "Retired renderers must release geometry",
    );
    assert.equal(
      memory.textures,
      memory.builtinTextureCount,
      "Retired renderers must release every application texture; only the identified Three.js lookup may remain",
    );
  }
  passed(
    "draft configuration, generate and mode confirmations, shape topology, and renderer cleanup remain consistent",
    baselineResources,
  );

  await setRange(page, "#surface-area", 4);
  await setRange(page, "#surface-density", 12);
  await selectShape(page, "stepped");
  await generate(page);
  await revealFirst(page);
  game = await state(page);
  const mineId = game.cells.find((cell) => cell.mine && !cell.flagged).id;
  await activateCell(page, mineId);
  assert.equal((await state(page)).status, "lost");
  const chainStart = await page.evaluate(() => {
    const scene = window.__surveyTest.getScene();
    return {
      active: scene.detonation.active,
      fired: scene.detonation.entries.filter((entry) => entry.fired).length,
      resultHidden: document.getElementById("result-panel").hidden,
    };
  });
  assert.equal(chainStart.active, true);
  assert.ok(chainStart.fired < game.mines);
  assert.equal(chainStart.resultHidden, true);
  await page.waitForFunction(
    () =>
      !window.__surveyTest.getScene().detonation.active &&
      !document.getElementById("result-panel").hidden,
  );
  assert.equal(
    await page.evaluate(
      () =>
        window.__surveyTest
          .getScene()
          .detonation.entries.filter((entry) => entry.fired).length,
    ),
    game.mines,
  );
  await restart(page, true);
  await revealFirst(page);
  game = await state(page);
  let safeClicks = 1;
  while (game.status === "playing" && safeClicks <= game.cells.length) {
    const safe = game.cells.find(
      (cell) => !cell.mine && !cell.revealed && !cell.flagged,
    );
    assert.ok(safe);
    await activateCell(page, safe.id);
    safeClicks += 1;
    game = await state(page);
  }
  assert.equal(game.status, "won");
  assert.equal(game.revealedCount, game.cells.length - game.mines);
  await page.waitForFunction(() => {
    const fireworks = window.__surveyTest.getScene().fireworks;
    return (
      fireworks.active && fireworks.burstCount > 0 && fireworks.activeCount > 0
    );
  });
  assert.equal(await page.locator("#result-panel").isVisible(), true);
  await capture(page, "surface_victory.png");
  await restart(page, true);
  const clean = await page.evaluate(() => {
    const test = window.__surveyTest;
    return {
      chain: test.getScene().detonation.active,
      fireworks: test.getScene().fireworks.active,
      particles: test.getScene().fireworks.activeCount,
      voices: test.getAudio().fireworkVoiceCount,
    };
  });
  assert.deepEqual(clean, {
    chain: false,
    fireworks: false,
    particles: 0,
    voices: 0,
  });
  passed(
    "real surface loss retains sequential explosions and real victory launches restartable fireworks",
    { safeClicks },
  );

  await revealFirst(page);
  const beforeFallback = await state(page);
  EXPECTED_CONTEXT_LOSS.add(page);
  await page.evaluate(() =>
    window.__surveyTest.getScene().renderer.forceContextLoss(),
  );
  await page.locator("#fallback-board").waitFor({ state: "visible" });
  await page.waitForFunction(() => !window.__surveyTest.getScene());
  assert.deepEqual(
    await state(page),
    beforeFallback,
    "Context loss must preserve the surface board and its graph",
  );
  const fallbackCell = (id) =>
    page.locator(`#fallback-board [data-cell-id="${id}"]`);
  game = await state(page);
  let seamNumber = game.cells.find(
    (cell) =>
      !cell.mine &&
      cell.adjacent > 0 &&
      isSeam(game, cell.id) &&
      game.topology.cells[cell.id].neighbors.some(
        (id) => !game.cells[id].mine && !game.cells[id].revealed,
      ),
  );
  assert.ok(
    seamNumber,
    "The seeded surface must offer a safe seam chord in fallback",
  );
  const atlasStart = await fallbackCell(seamNumber.id).evaluate((button) => {
    const bounds = button.getBoundingClientRect();
    return {
      scrollTop: document.getElementById("fallback-board").scrollTop,
      reachable:
        document.elementFromPoint(
          bounds.x + bounds.width / 2,
          bounds.y + bounds.height / 2,
        ) === button,
    };
  });
  assert.deepEqual(
    atlasStart,
    { scrollTop: 0, reachable: true },
    "The top atlas rows must be clickable at scrollTop zero",
  );
  if (!seamNumber.revealed) await fallbackCell(seamNumber.id).click();
  game = await state(page);
  assert.equal(game.cells[seamNumber.id].revealed, true);
  const neighboringMines = game.topology.cells[seamNumber.id].neighbors.filter(
    (id) => game.cells[id].mine,
  );
  for (const id of neighboringMines)
    await fallbackCell(id).click({ button: "right" });
  const targets = game.topology.cells[seamNumber.id].neighbors.filter(
    (id) => !game.cells[id].mine && !game.cells[id].revealed,
  );
  assert.ok(targets.length > 0);
  assert.equal(
    await fallbackCell(seamNumber.id).textContent(),
    String(neighboringMines.length),
  );
  await fallbackCell(seamNumber.id).dblclick({ delay: 80 });
  game = await state(page);
  assert.ok(
    targets.every((id) => game.cells[id].revealed),
    "Fallback chording must reveal graph neighbors across seams",
  );
  assert.notEqual(game.status, "lost");
  await capture(page, "surface_fallback.png");
  passed(
    "context-loss fallback preserves topology and supports a real cross-seam chord",
    { firstAtlasTile: seamNumber.id, ...atlasStart },
  );
  await desktopContext.close();

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  const mobile = await mobileContext.newPage();
  watchErrors(mobile, "surface-mobile-390");
  await openGame(mobile);
  await switchMode(mobile, "surface");
  assert.equal(
    await mobile
      .locator("#surface-generator")
      .evaluate((element) => element.open),
    false,
    "The mobile generator must initially leave room for the board",
  );
  await setRange(mobile, "#surface-area", 4);
  await selectShape(mobile, "terrace");
  await generate(mobile);
  assert.equal(
    await mobile
      .locator("#surface-generator")
      .evaluate((element) => element.open),
    false,
    "Generating a mobile surface must collapse its settings again",
  );
  await revealFirst(mobile, true);
  game = await state(mobile);
  assert.equal(game.cells.length, 96);
  assert.equal(game.topology.shape, "terrace");
  validateTiles(game);
  const mobileMine = game.cells.find((cell) => cell.mine && !cell.flagged).id;
  await mobile.locator("#flag-mode").tap();
  await activateCell(mobile, mobileMine, { touch: true });
  assert.equal((await state(mobile)).cells[mobileMine].flagged, true);
  await activateCell(mobile, mobileMine, { touch: true });
  assert.equal((await state(mobile)).cells[mobileMine].flagged, false);
  await mobile.locator("#reveal-mode").tap();
  const sizes = await mobile.evaluate(() => ({
    viewport: innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  assert.ok(
    sizes.document <= sizes.viewport + 1 && sizes.body <= sizes.viewport + 1,
    "Surface settings and the scene must fit a 390px viewport",
  );
  await capture(mobile, "surface_mobile.png");
  await switchMode(mobile, "plane");
  await mobile.locator("#scene-stage").scrollIntoViewIfNeeded();
  const planePoint = await mobile.evaluate(() =>
    window.__surveyTest.getScene().projectCell(40),
  );
  await mobile.touchscreen.tap(planePoint.x, planePoint.y);
  assert.equal(
    (await state(mobile)).cells[40].revealed,
    true,
    "Returning to plane mode must preserve classic touch gameplay",
  );
  passed(
    "390px surface settings, touch reveal and marking, and returning to plane mode work",
  );
  await mobileContext.close();

  assert.deepEqual(
    ERRORS,
    [],
    "Unexpected browser, shader, and WebGL errors must fail the suite",
  );
  await writeFile(
    resolve(ARTIFACT_DIR, "surface_browser_metrics.json"),
    `${JSON.stringify(CHECKS, null, 2)}\n`,
  );
  passed("no unexpected browser or WebGL errors");
  console.log(`Surface browser checks passed: ${CHECKS.length}`);
} catch (error) {
  if (ERRORS.length) console.error(ERRORS.join("\n"));
  throw error;
} finally {
  await browser.close();
}
