import { Minefield } from "./game_engine.js";
import { SurveyScene } from "./survey_scene.js";
import { SurveyAudio } from "./survey_audio.js";
import { SurfaceScene } from "./surface_scene.js";
import { createSurface } from "./surface_topology.js";

const PRESETS = {
  beginner: { width: 9, height: 9, mines: 10 },
  intermediate: { width: 16, height: 16, mines: 40 },
  expert: { width: 30, height: 16, mines: 99 },
};
const FACE_NAMES = ["Right", "Left", "Up", "Down", "Front", "Back"];
const $ = (id) => document.getElementById(id);
const isLocalTest =
  ["localhost", "127.0.0.1"].includes(location.hostname) &&
  new URLSearchParams(location.search).get("test") === "1";
const audio = new SurveyAudio();
const stage = $("scene-stage");
let model;
let scene;
let config = PRESETS.beginner;
let planeConfig = PRESETS.beginner;
let surfaceConfig = null;
let surfaceSeed = 14863;
let sceneInitialized = false;
let sceneKind = "plane";
let activePreset = "beginner";
let mode = "reveal";
let focusId = 0;
let startedAt = 0;
let elapsed = 0;
let lastStatus = "ready";
let fallback = false;
let pendingConfirmation = null;
let toastTimer;
let cellButtons = [];

function startGame(nextConfig = config) {
  audio.reset();
  config = { ...nextConfig };
  model = new Minefield(
    isLocalTest ? { ...config, random: testRandom() } : config,
  );
  focusId =
    Math.floor(model.height / 2) * model.width + Math.floor(model.width / 2);
  elapsed = 0;
  startedAt = 0;
  lastStatus = "ready";
  setMode("reveal");
  syncWorldControls();
  buildAccessibleBoard();
  const nextKind = model.topology ? "surface" : "plane";
  if (sceneInitialized && nextKind !== sceneKind) mountScene();
  else scene?.rebuild(model.snapshot());
  $("top-view").setAttribute("aria-pressed", String(scene?.topView ?? false));
  $("result-panel").hidden = true;
  updateHUD();
  updateAccessibleBoard();
  $("timer").textContent = "00:00";
  $("cell-readout").textContent = "Choose a tile to begin";
}

function syncWorldControls() {
  const surface = Boolean(model.topology);
  document.body.dataset.boardMode = surface ? "surface" : "plane";
  $("board-mode").value = surface ? "surface" : "plane";
  $("plane-settings").hidden = surface;
  $("surface-settings").hidden = !surface;
  const topology = model.topology;
  $("surface-current").textContent = surface
    ? `${topology.cellCount} tiles · ${model.mines} cores · Seed ${topology.seed}`
    : "";
  $("surface-summary").textContent = surface
    ? `${topology.cellCount} equal tiles · ${Math.round(topology.irregularity * 100)}% cuts`
    : "216 equal tiles · 45% cuts";
  document.querySelector(".mission-intro h1").innerHTML = surface
    ? "Every face.<span>One solid puzzle.</span>"
    : "Chart the <span>unknown.</span>";
  document.querySelector(".mission-description").innerHTML = surface
    ? "Read the edges.<br />Find the safe path around every corner."
    : "A dormant relic.<br />Every number points to safety.";
  stage.setAttribute(
    "aria-label",
    surface
      ? "Faceted minesweeper solid. Drag to orbit every side. Arrow keys follow neighboring tiles; Enter explores; F marks."
      : "3D minesweeper board. Arrow keys select; Enter explores; F marks; V toggles top view.",
  );
}

function mountScene() {
  sceneInitialized = true;
  scene?.dispose();
  scene = null;
  fallback = false;
  sceneKind = model.topology ? "surface" : "plane";
  stage.classList.remove("fallback-active");
  $("fallback-board").hidden = true;
  const board = $("board-accessibility");
  document.querySelector(".scene-section").appendChild(board);
  board.classList.add("sr-only");
  $("reset-camera").disabled = false;
  $("top-view").disabled = false;
  try {
    const Scene = model.topology ? SurfaceScene : SurveyScene;
    scene = new Scene(stage, {
      onReveal: (id) => act("reveal", id),
      onFlag: (id) => act("flag", id),
      onChord: (id) => act("chord", id),
      onHover: updateReadout,
      onFailure: enableFallback,
      onExplosion: (event) => audio.playExplosion(event),
      onFirework: (phase, event) => audio.playFirework(phase, event),
      onFireworksStop: () => audio.stopFireworks(),
      onChainComplete: () => {
        if (model.status !== "lost") return;
        updateHUD();
        showResult();
      },
    });
    scene.rebuild(model.snapshot());
    scene.setMode(mode);
    $("scene-status").hidden = true;
  } catch (error) {
    enableFallback(error);
  }
}

function surfaceDraft() {
  const shape = $("surface-shape").value;
  return {
    shape,
    resolution: Number($("surface-area").value),
    irregularity:
      shape === "cube" ? 0 : Number($("surface-irregularity").value) / 100,
    density: Number($("surface-density").value),
  };
}

function updateSurfaceDraft() {
  const draft = surfaceDraft();
  const count = 6 * draft.resolution ** 2;
  $("surface-area-value").textContent = `${count} tiles`;
  $("surface-area").setAttribute("aria-valuetext", `${count} tiles`);
  $("surface-irregularity-value").textContent =
    draft.shape === "cube" ? "Off" : `${Math.round(draft.irregularity * 100)}%`;
  $("surface-irregularity").disabled = draft.shape === "cube";
  $("surface-relief-hint").textContent =
    draft.shape === "cube"
      ? "A regular cube has no corner cuts."
      : "Deeper steps. Equal square tiles.";
  $("surface-density-value").textContent =
    `${draft.density}% · ${Math.floor((count * draft.density) / 100)} cores`;
  $("surface-draft-note").textContent =
    "Generate to apply these settings. Your current field stays unchanged.";
}

function generateSurfaceConfig() {
  const draft = surfaceDraft();
  const seed = isLocalTest
    ? ++surfaceSeed
    : crypto.getRandomValues(new Uint32Array(1))[0];
  const topology = createSurface({ ...draft, seed });
  return {
    topology,
    mines: Math.floor((topology.cellCount * draft.density) / 100),
  };
}

function act(action, id) {
  if (!Number.isInteger(id) || id < 0 || id >= model.cells.length) return;
  if (action === "flag" && model.status === "ready") {
    toast("Explore a tile before marking suspected cores.");
    return;
  }
  const before = model.status;
  const result =
    action === "flag"
      ? model.toggleFlag(id)
      : action === "chord"
        ? model.chord(id)
        : model.reveal(id);
  if (result.action === "noop") return;
  if (before === "ready") {
    startedAt = performance.now();
    if (model.topology) $("surface-generator").open = false;
  }
  elapsed = Math.min(999, Math.floor((performance.now() - startedAt) / 1000));
  scene?.update(model.snapshot(), result);
  updateHUD();
  updateAccessibleBoard(result.changed);
  updateReadout(id);
  audio.setMood(model.status);
  if (result.action !== "lose" || !scene) audio.play(result.action);
  if (model.status !== lastStatus && ["won", "lost"].includes(model.status)) {
    if (model.status === "lost" && scene?.detonation.active) {
      $("status-label").textContent = "Chain reaction";
      $("status-description").textContent =
        "The blast is spreading. Cores will detonate one by one.";
    } else showResult();
  }
  lastStatus = model.status;
}

function updateHUD() {
  $("mine-counter").textContent = String(
    model.mines - model.flagCount,
  ).padStart(2, "0");
  const progress = Math.round(
    (model.revealedCount / (model.cells.length - model.mines)) * 100,
  );
  $("progress-value").textContent = `${progress}%`;
  $("progress-fill").style.width = `${progress}%`;
  $("progress-fill").parentElement?.setAttribute(
    "aria-valuenow",
    String(progress),
  );
  const text = {
    ready: [
      "Ready to explore",
      "Choose any tile. Your first move and its neighbors are safe.",
    ],
    playing: [
      "Survey in progress",
      "Numbers count cores in the eight neighboring tiles. Mark suspected cores.",
    ],
    won: ["Sector cleared", "All safe tiles explored. Every core is marked."],
    lost: [
      "Core triggered",
      "Review the revealed cores, then start a new survey.",
    ],
  }[model.status];
  if (model.topology && model.status === "playing")
    text[1] =
      "Numbers count touching tiles across the surface. Rotate to explore every side.";
  if (model.topology && model.status === "ready")
    text[1] =
      "Choose any tile. Hover to see its neighbors; drag to explore every side.";
  $("status-label").textContent = text[0];
  $("status-description").textContent = text[1];
  document.body.dataset.gameState = model.status;
  if ($("sector-size"))
    $("sector-size").textContent = model.topology
      ? `${model.cells.length} surface tiles`
      : `${model.width} × ${model.height}`;
  if ($("sector-mines")) $("sector-mines").textContent = `${model.mines} cores`;
}

function showResult() {
  const won = model.status === "won";
  $("result-title").textContent = won
    ? "Silence restored."
    : "Survey interrupted.";
  $("result-description").textContent = won
    ? `All ${model.revealedCount} safe tiles explored in ${formatTime(elapsed)}.`
    : `${model.revealedCount} safe tiles explored in ${formatTime(elapsed)}. All core locations are now visible.`;
  $("result-panel").hidden = false;
  $("result-panel").dataset.outcome = model.status;
  toast(
    won
      ? "Survey complete · all safe tiles explored"
      : "Core triggered · full layout revealed",
  );
}

function setMode(next) {
  mode = next;
  scene?.setMode(mode);
  $("reveal-mode").setAttribute("aria-pressed", String(mode === "reveal"));
  $("flag-mode").setAttribute("aria-pressed", String(mode === "flag"));
  document.body.dataset.inputMode = mode;
}

function updateReadout(id) {
  if (id < 0 || !model?.cells[id]) {
    $("cell-readout").textContent =
      model?.status === "ready"
        ? "Choose a tile to begin"
        : "Drag to orbit · Scroll to zoom";
    return;
  }
  const cell = model.snapshot().cells[id];
  const label = cell.revealed
    ? cell.mine
      ? "Unstable core"
      : cell.adjacent
        ? `${cell.adjacent} nearby core${cell.adjacent === 1 ? "" : "s"}`
        : "Safe tile"
    : cell.flagged
      ? "Marked"
      : "Unexplored";
  $("cell-readout").textContent = model.topology
    ? `Tile ${cell.id + 1} / ${label} · ${model.neighbors(id).length} neighbors`
    : `${String(cell.x + 1).padStart(2, "0")} : ${String(cell.y + 1).padStart(2, "0")} / ${label}`;
}

function buildAccessibleBoard() {
  const board = $("board-accessibility");
  board.innerHTML = "";
  board.setAttribute("role", "grid");
  board.setAttribute(
    "aria-label",
    model.topology
      ? "Faceted minesweeper solid. Arrow keys follow touching tiles across faces. Enter explores and F marks."
      : "Minesweeper grid. Use the arrow keys to select a tile, Enter to explore, and F to mark.",
  );
  board.setAttribute("aria-rowcount", String(model.height));
  board.setAttribute("aria-colcount", String(model.width));
  board.style.setProperty("--columns", model.width);
  cellButtons = [];
  for (let y = 0; y < model.height; y++) {
    if (model.topology && y % model.topology.resolution === 0) {
      const heading = document.createElement("div");
      heading.className = "surface-face-label";
      heading.setAttribute("role", "presentation");
      heading.textContent = `${FACE_NAMES[Math.floor(y / model.topology.resolution)]}-facing tiles`;
      board.appendChild(heading);
    }
    const row = document.createElement("div");
    row.setAttribute("role", "row");
    for (let x = 0; x < model.width; x++) {
      const id = y * model.width + x;
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.cellId = String(id);
      button.setAttribute("role", "gridcell");
      if (model.topology)
        button.dataset.face = String(model.topology.cells[id].face);
      button.setAttribute("aria-rowindex", String(y + 1));
      button.setAttribute("aria-colindex", String(x + 1));
      button.tabIndex = id === focusId ? 0 : -1;
      button.addEventListener("click", () => act(mode, id));
      button.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        act("flag", id);
      });
      button.addEventListener("dblclick", () => act("chord", id));
      button.addEventListener("focus", () => selectCell(id, false));
      cellButtons.push(button);
      row.appendChild(button);
    }
    board.appendChild(row);
  }
}

function updateAccessibleBoard(changed = model.cells.map((cell) => cell.id)) {
  const snapshot = model.snapshot();
  for (const id of changed) {
    const cell = snapshot.cells[id];
    const button = cellButtons[id];
    const description = cell.wrongFlag
      ? "Incorrect mark"
      : cell.revealed
        ? cell.mine
          ? "Unstable core"
          : `${cell.adjacent} nearby core${cell.adjacent === 1 ? "" : "s"}`
        : cell.flagged
          ? "Marked"
          : "Unexplored";
    button.setAttribute(
      "aria-label",
      model.topology
        ? `${FACE_NAMES[cell.face]}-facing tile ${cell.id + 1}: ${description}. Neighbors ${model
            .neighbors(id)
            .map((neighbor) => neighbor + 1)
            .join(", ")}.`
        : `Row ${cell.y + 1}, column ${cell.x + 1}: ${description}`,
    );
    button.dataset.state = cell.wrongFlag
      ? "wrong"
      : cell.revealed
        ? cell.mine
          ? "mine"
          : "revealed"
        : cell.flagged
          ? "flagged"
          : "covered";
    button.textContent = cell.wrongFlag
      ? "×"
      : cell.revealed
        ? cell.mine
          ? "✦"
          : cell.adjacent || "·"
        : cell.flagged
          ? "▲"
          : "";
  }
}

function selectCell(id, focus = true) {
  cellButtons[focusId]?.setAttribute("tabindex", "-1");
  focusId = id;
  cellButtons[focusId].tabIndex = 0;
  scene?.focus(focusId);
  updateReadout(focusId);
  if (model.topology) {
    const nearby = new Set(model.neighbors(focusId));
    for (const button of cellButtons)
      button.dataset.neighbor = String(
        nearby.has(Number(button.dataset.cellId)),
      );
  }
  if (focus) cellButtons[focusId].focus({ preventScroll: !fallback });
}

// Navigate the surface graph in the direction seen on screen, including across face seams.
function surfaceNeighbor(id, key) {
  const direction = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
  }[key];
  const topology = model.topology;
  const cell = topology.cells[id];
  const origin = scene?.projectCell(id);
  const tangent = (corner) =>
    corner.map((value, axis) => value - cell.corners[0][axis]);
  const u = tangent(cell.corners[1]);
  const v = tangent(cell.corners[3]);
  const unit = (vector) => {
    const size = Math.hypot(...vector) || 1;
    return vector.map((value) => value / size);
  };
  const uAxis = unit(u),
    vAxis = unit(v);
  const dot = (a, b) =>
    a.reduce((sum, value, axis) => sum + value * b[axis], 0);
  let best = id,
    bestScore = -Infinity;
  for (const neighbor of model.neighbors(id)) {
    let dx, dy;
    if (scene && origin) {
      const projected = scene.projectCell(neighbor);
      dx = projected.x - origin.x;
      dy = projected.y - origin.y;
    } else {
      const offset = topology.cells[neighbor].center.map(
        (value, axis) => value - cell.center[axis],
      );
      dx = dot(offset, uAxis);
      dy = dot(offset, vAxis);
    }
    const distance = Math.hypot(dx, dy);
    if (!distance) continue;
    const forward = dx * direction[0] + dy * direction[1];
    if (forward <= 0) continue;
    const score = forward / distance - distance * 0.0001;
    if (score > bestScore) {
      best = neighbor;
      bestScore = score;
    }
  }
  return best;
}

function enableFallback(error) {
  if (fallback) return;
  fallback = true;
  console.warn(
    "3D rendering unavailable; accessible grid enabled.",
    error?.message || "",
  );
  scene?.dispose();
  scene = null;
  stage.classList.add("fallback-active");
  $("fallback-board").hidden = false;
  $("fallback-board").appendChild($("board-accessibility"));
  $("board-accessibility").classList.remove("sr-only");
  $("scene-status").textContent = "3D unavailable · The grid is ready to play.";
  if (model?.topology)
    $("scene-status").textContent =
      "3D unavailable · Direction atlas enabled. Neighbors still connect across faces.";
  $("scene-status").hidden = false;
  $("reset-camera").disabled = true;
  $("top-view").disabled = true;
  if (model?.status === "lost") {
    updateHUD();
    showResult();
  }
}

function toast(message) {
  clearTimeout(toastTimer);
  $("toast").textContent = message;
  $("toast").hidden = false;
  toastTimer = setTimeout(() => {
    $("toast").hidden = true;
  }, 3200);
}

function confirmReset(description) {
  if (model.status !== "playing") return Promise.resolve(true);
  if (pendingConfirmation) return Promise.resolve(false);
  $("confirm-title").textContent = "Start a new survey?";
  $("confirm-description").textContent = description;
  $("confirm-dialog").showModal();
  return new Promise((resolve) => {
    pendingConfirmation = resolve;
  });
}

function finishConfirmation(value) {
  const resolve = pendingConfirmation;
  pendingConfirmation = null;
  $("confirm-dialog").close();
  resolve?.(value);
}

async function restart() {
  if (await confirmReset("This will reset the board, marks, and timer."))
    startGame();
}

function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

// Use a fixed layout seed for repeatable screenshots and input tests; normal games use system randomness.
function testRandom() {
  let seed = 7127;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

// Unlock audio after real input and clear keyboard focus when using a pointer.
document.addEventListener(
  "pointerdown",
  () => {
    scene?.clearFocus();
    void audio.unlock();
  },
  { capture: true },
);
document.addEventListener("pointerup", () => void audio.unlock(), {
  capture: true,
});
document.addEventListener("keydown", () => void audio.unlock(), {
  capture: true,
});

$("reveal-mode").addEventListener("click", () => setMode("reveal"));
$("flag-mode").addEventListener("click", () => setMode("flag"));
$("new-game").addEventListener("click", restart);
$("result-restart").addEventListener("click", restart);
$("reset-camera").addEventListener("click", () => scene?.resetCamera());
$("top-view").addEventListener("click", () => {
  const next = $("top-view").getAttribute("aria-pressed") !== "true";
  $("top-view").setAttribute("aria-pressed", String(next));
  scene?.setTopView(next);
});
$("sound-toggle").addEventListener("click", () => {
  const enabled = $("sound-toggle").getAttribute("aria-pressed") !== "true";
  $("sound-toggle").setAttribute("aria-pressed", String(enabled));
  $("sound-toggle").setAttribute(
    "aria-label",
    enabled ? "Mute sound effects" : "Unmute sound effects",
  );
  $("sound-toggle").title = enabled
    ? "Mute sound effects"
    : "Unmute sound effects";
  const label = $("sound-toggle").querySelector("[data-sound-label]");
  if (label) label.textContent = enabled ? "Sound on" : "Sound off";
  audio.setEnabled(enabled);
  audio.play("flag");
});
$("music-toggle").addEventListener("click", () => {
  const enabled = $("music-toggle").getAttribute("aria-pressed") !== "true";
  $("music-toggle").setAttribute("aria-pressed", String(enabled));
  $("music-toggle").setAttribute(
    "aria-label",
    enabled ? "Mute music" : "Unmute music",
  );
  $("music-toggle").title = enabled ? "Mute music" : "Unmute music";
  audio.setMusicEnabled(enabled);
});
$("help-btn").addEventListener("click", () => $("help-dialog").showModal());
document
  .querySelectorAll("[data-close-dialog]")
  .forEach((button) =>
    button.addEventListener("click", () => button.closest("dialog").close()),
  );
$("confirm-accept").addEventListener("click", () => finishConfirmation(true));
$("confirm-cancel").addEventListener("click", () => finishConfirmation(false));
$("confirm-dialog").addEventListener("cancel", (event) => {
  event.preventDefault();
  finishConfirmation(false);
});
$("settings-btn").addEventListener("click", () => {
  const panel = $("settings-panel");
  panel.hidden = !panel.hidden;
  $("settings-btn").setAttribute("aria-expanded", String(!panel.hidden));
  if (!panel.hidden) $("board-mode").focus();
});
$("preset-select").addEventListener("change", async () => {
  const nextPreset = $("preset-select").value;
  $("custom-inputs").hidden = nextPreset !== "custom";
  $("config-error").textContent = "";
  if (nextPreset === "custom") return;
  if (await confirmReset("Changing sectors will reset your current survey.")) {
    activePreset = nextPreset;
    planeConfig = PRESETS[nextPreset];
    startGame(planeConfig);
  } else {
    $("preset-select").value = activePreset;
    $("custom-inputs").hidden = activePreset !== "custom";
  }
});
$("apply-btn").addEventListener("click", async () => {
  const custom = {
    width: Number($("custom-width").value),
    height: Number($("custom-height").value),
    mines: Number($("custom-mines").value),
  };
  try {
    new Minefield(custom);
  } catch (error) {
    $("config-error").textContent = error.message;
    return;
  }
  $("config-error").textContent = "";
  if (
    await confirmReset(
      "Applying these settings will reset your current survey.",
    )
  ) {
    activePreset = "custom";
    planeConfig = custom;
    startGame(planeConfig);
  }
});

$("surface-generator").open = matchMedia("(min-width: 761px)").matches;
for (const id of [
  "surface-shape",
  "surface-area",
  "surface-irregularity",
  "surface-density",
])
  $(id).addEventListener("input", updateSurfaceDraft);
$("board-mode").addEventListener("change", async () => {
  const requested = $("board-mode").value;
  const current = model.topology ? "surface" : "plane";
  if (requested === current) return;
  if (
    !(await confirmReset("Changing the field type will start a new survey."))
  ) {
    $("board-mode").value = current;
    return;
  }
  try {
    if (requested === "surface") {
      surfaceConfig ||= generateSurfaceConfig();
      startGame(surfaceConfig);
    } else startGame(planeConfig);
  } catch (error) {
    $("board-mode").value = current;
    $("config-error").textContent = error.message;
    toast(error.message);
  }
});
$("surface-generate").addEventListener("click", async () => {
  if (
    !(await confirmReset(
      "Generating a new solid will reset this survey, marks, and timer.",
    ))
  )
    return;
  try {
    const next = generateSurfaceConfig();
    new Minefield(next);
    $("surface-error").textContent = "";
    surfaceConfig = next;
    startGame(surfaceConfig);
    $("surface-draft-note").textContent =
      "New solid ready. Equal squares on every face.";
    if (matchMedia("(max-width: 760px)").matches)
      $("surface-generator").open = false;
  } catch (error) {
    $("surface-error").textContent = error.message;
  }
});

stage.tabIndex = 0;
stage.setAttribute("role", "group");
stage.setAttribute(
  "aria-label",
  "3D minesweeper board. Arrow keys select; Enter explores; F marks; V toggles top view.",
);
stage.addEventListener("focus", () => {
  if (stage.matches(":focus-visible")) scene?.focus(focusId);
});
stage.addEventListener("focusout", (event) => {
  if (!event.relatedTarget?.closest?.("#board-accessibility"))
    scene?.clearFocus();
});
document.addEventListener("keydown", (event) => {
  if (
    event.isComposing ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    document.querySelector("dialog[open]")
  )
    return;
  if (event.target.closest('input, select, textarea, [contenteditable="true"]'))
    return;
  const inBoard =
    event.target === stage || event.target.closest("#board-accessibility");
  if (
    inBoard &&
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
  ) {
    event.preventDefault();
    if (model.topology) {
      selectCell(surfaceNeighbor(focusId, event.key));
      return;
    }
    const x = focusId % model.width,
      y = Math.floor(focusId / model.width);
    const nx = Math.max(
      0,
      Math.min(
        model.width - 1,
        x +
          (event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0),
      ),
    );
    const ny = Math.max(
      0,
      Math.min(
        model.height - 1,
        y + (event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0),
      ),
    );
    selectCell(ny * model.width + nx);
  } else if (inBoard && ["Enter", " "].includes(event.key)) {
    event.preventDefault();
    selectCell(focusId, false);
    act(model.cells[focusId].revealed ? "chord" : mode, focusId);
  } else if (inBoard && event.key.toLowerCase() === "f") {
    event.preventDefault();
    selectCell(focusId, false);
    act("flag", focusId);
  } else if (event.key.toLowerCase() === "v") {
    $("top-view").click();
  } else if (event.key.toLowerCase() === "r") {
    event.preventDefault();
    restart();
  } else if (event.key === "Escape") {
    setMode("reveal");
  }
});

startGame();
mountScene();

setInterval(() => {
  if (model.status === "playing")
    elapsed = Math.min(999, Math.floor((performance.now() - startedAt) / 1000));
  $("timer").textContent = formatTime(elapsed);
}, 250);

// Expose test hooks only on local test=1 pages; public pages never expose the hidden board.
if (isLocalTest) {
  window.__surveyTest = {
    getGame: () => model,
    getScene: () => scene,
    getAudio: () => audio,
  };
}
