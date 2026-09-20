import { Minefield } from "./game_engine.js";
import { SurveyScene } from "./survey_scene.js";
import { SurveyAudio } from "./survey_audio.js";

const PRESETS = {
  beginner: { width: 9, height: 9, mines: 10 },
  intermediate: { width: 16, height: 16, mines: 40 },
  expert: { width: 30, height: 16, mines: 99 },
};
const $ = (id) => document.getElementById(id);
const isLocalTest =
  ["localhost", "127.0.0.1"].includes(location.hostname) &&
  new URLSearchParams(location.search).get("test") === "1";
const audio = new SurveyAudio();
const stage = $("scene-stage");
let model;
let scene;
let config = PRESETS.beginner;
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
  buildAccessibleBoard();
  scene?.rebuild(model.snapshot());
  $("result-panel").hidden = true;
  updateHUD();
  updateAccessibleBoard();
  $("timer").textContent = "00:00";
  $("cell-readout").textContent = "选择一块舱盖，开始探索";
}

function act(action, id) {
  if (!Number.isInteger(id) || id < 0 || id >= model.cells.length) return;
  if (action === "flag" && model.status === "ready") {
    toast("先探索一格，再用信标标记危险。");
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
  if (before === "ready") startedAt = performance.now();
  elapsed = Math.min(999, Math.floor((performance.now() - startedAt) / 1000));
  scene?.update(model.snapshot(), result);
  updateHUD();
  updateAccessibleBoard(result.changed);
  updateReadout(id);
  audio.setMood(model.status);
  if (result.action !== "lose" || !scene) audio.play(result.action);
  if (model.status !== lastStatus && ["won", "lost"].includes(model.status)) {
    if (model.status === "lost" && scene?.detonation.active) {
      $("status-label").textContent = "连锁引爆中";
      $("status-description").textContent =
        "冲击正在向外传递，危险核心将依次显现。";
    } else showResult();
  }
  lastStatus = model.status;
}

function updateHUD() {
  $("mine-counter").textContent = String(
    model.mines - model.flagCount,
  ).padStart(2, "0");
  const progress = Math.round(
    (model.revealedCount / (model.width * model.height - model.mines)) * 100,
  );
  $("progress-value").textContent = `${progress}%`;
  $("progress-fill").style.width = `${progress}%`;
  $("progress-fill").parentElement?.setAttribute(
    "aria-valuenow",
    String(progress),
  );
  const text = {
    ready: ["等待首次扫描", "点击任意舱盖。第一次探索及周围区域保证安全。"],
    playing: ["勘探进行中", "数字表示周围八格的危险数量。用信标标记可疑区域。"],
    won: ["区域勘探完成", "全部安全舱盖已探索，所有危险已被封存。"],
    lost: ["发现不稳定核心", "本次探索结束。查看危险分布，准备下一次出发。"],
  }[model.status];
  $("status-label").textContent = text[0];
  $("status-description").textContent = text[1];
  document.body.dataset.gameState = model.status;
  if ($("sector-size"))
    $("sector-size").textContent = `${model.width} × ${model.height}`;
  if ($("sector-mines"))
    $("sector-mines").textContent = `${model.mines} 处异常`;
}

function showResult() {
  const won = model.status === "won";
  $("result-title").textContent = won
    ? "静默，重新归来。"
    : "有些秘密，仍需谨慎。";
  $("result-description").textContent = won
    ? `用时 ${formatTime(elapsed)}，成功探索全部 ${model.revealedCount} 块安全舱盖。`
    : `用时 ${formatTime(elapsed)}，已探索 ${model.revealedCount} 块安全舱盖。核心位置现已显现。`;
  $("result-panel").hidden = false;
  $("result-panel").dataset.outcome = model.status;
  toast(
    won ? "勘探完成 · 所有安全区域已解锁" : "触发危险核心 · 可以查看完整分布",
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
        ? "选择一块舱盖，开始探索"
        : "拖动旋转 · 滚轮缩放";
    return;
  }
  const cell = model.snapshot().cells[id];
  const label = cell.revealed
    ? cell.mine
      ? "危险核心"
      : cell.adjacent
        ? `${cell.adjacent} 个相邻危险`
        : "安全区域"
    : cell.flagged
      ? "已部署信标"
      : "尚未探索";
  $("cell-readout").textContent =
    `${String(cell.x + 1).padStart(2, "0")} : ${String(cell.y + 1).padStart(2, "0")} / ${label}`;
}

function buildAccessibleBoard() {
  const board = $("board-accessibility");
  board.innerHTML = "";
  board.setAttribute("role", "grid");
  board.setAttribute(
    "aria-label",
    "遗迹扫雷棋盘，使用方向键选择，回车探索，F 标记",
  );
  board.setAttribute("aria-rowcount", String(model.height));
  board.setAttribute("aria-colcount", String(model.width));
  board.style.setProperty("--columns", model.width);
  cellButtons = [];
  for (let y = 0; y < model.height; y++) {
    const row = document.createElement("div");
    row.setAttribute("role", "row");
    for (let x = 0; x < model.width; x++) {
      const id = y * model.width + x;
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.cellId = String(id);
      button.setAttribute("role", "gridcell");
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
      ? "错误信标"
      : cell.revealed
        ? cell.mine
          ? "危险核心"
          : `${cell.adjacent} 个相邻危险`
        : cell.flagged
          ? "已标记"
          : "尚未探索";
    button.setAttribute(
      "aria-label",
      `第 ${cell.y + 1} 行第 ${cell.x + 1} 列，${description}`,
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
  if (focus) cellButtons[focusId].focus({ preventScroll: true });
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
  $("scene-status").textContent =
    "兼容模式 · 当前设备无法渲染 3D，仍可完整探索";
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
  $("confirm-title").textContent = "离开当前探索？";
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
  if (await confirmReset("重新出发将清空当前棋局、信标与计时。")) startGame();
}

function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

// 固定验收页面的布局种子，让前后截图和触控回归可复现；正常游戏使用系统随机数。
function testRandom() {
  let seed = 7127;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

// 仅真实操作后解锁声音；指针模式不保留键盘选中框。
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
    enabled ? "关闭音效" : "开启音效",
  );
  $("sound-toggle").title = enabled ? "关闭音效" : "开启音效";
  const label = $("sound-toggle").querySelector("[data-sound-label]");
  if (label) label.textContent = enabled ? "音效开启" : "音效关闭";
  audio.setEnabled(enabled);
  audio.play("flag");
});
$("music-toggle").addEventListener("click", () => {
  const enabled = $("music-toggle").getAttribute("aria-pressed") !== "true";
  $("music-toggle").setAttribute("aria-pressed", String(enabled));
  $("music-toggle").setAttribute(
    "aria-label",
    enabled ? "关闭背景音乐" : "开启背景音乐",
  );
  $("music-toggle").title = enabled ? "关闭背景音乐" : "开启背景音乐";
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
  if (!panel.hidden) $("preset-select").focus();
});
$("preset-select").addEventListener("change", async () => {
  const nextPreset = $("preset-select").value;
  $("custom-inputs").hidden = nextPreset !== "custom";
  $("config-error").textContent = "";
  if (nextPreset === "custom") return;
  if (await confirmReset("切换探索区域将开始一局新的勘探。")) {
    activePreset = nextPreset;
    startGame(PRESETS[nextPreset]);
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
  if (await confirmReset("应用新的参数将结束当前勘探。")) {
    activePreset = "custom";
    startGame(custom);
  }
});

stage.tabIndex = 0;
stage.setAttribute("role", "group");
stage.setAttribute(
  "aria-label",
  "三维扫雷场景；方向键选择，回车探索，F 标记，V 切换俯视",
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
try {
  scene = new SurveyScene(stage, {
    onReveal: (id) => act("reveal", id),
    onFlag: (id) => act("flag", id),
    onChord: (id) => act("chord", id),
    onHover: updateReadout,
    onFailure: enableFallback,
    onExplosion: (event) => audio.playExplosion(event),
    onChainComplete: () => {
      if (model.status !== "lost") return;
      updateHUD();
      showResult();
    },
  });
  scene.rebuild(model.snapshot());
  $("scene-status").hidden = true;
} catch (error) {
  enableFallback(error);
}

setInterval(() => {
  if (model.status === "playing")
    elapsed = Math.min(999, Math.floor((performance.now() - startedAt) / 1000));
  $("timer").textContent = formatTime(elapsed);
}, 250);

// 本机验收入口只对本地 test=1 页面开放；正式页面不暴露隐藏棋局。
if (isLocalTest) {
  window.__surveyTest = {
    getGame: () => model,
    getScene: () => scene,
    getAudio: () => audio,
  };
}
