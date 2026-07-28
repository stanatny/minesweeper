/* ============================================================
 * 扫雷 · 游戏逻辑（game.js）
 * 角色：游戏逻辑工程师_Game
 * 依赖契约：
 *   - DOM: #preset-select #custom-inputs #custom-width #custom-height
 *          #custom-mines #apply-btn #sound-toggle #mine-counter
 *          #face-btn #timer #board-wrap #board #fx-canvas
 *   - window.GameAudio.play(name) / GameAudio.setEnabled(bool)
 *   - window.GameFX.explodeAt(x, y) / GameFX.shakeBoard() / GameFX.celebrate()
 * 本文件不修改 HTML/CSS，只读契约中的 id 与全局 API。
 * ============================================================ */
(function () {
  'use strict';

  /* ---------- DOM 引用（严格按契约 id） ---------- */
  var presetSelect = document.getElementById('preset-select');
  var customInputs = document.getElementById('custom-inputs');
  var customWidth  = document.getElementById('custom-width');
  var customHeight = document.getElementById('custom-height');
  var customMines  = document.getElementById('custom-mines');
  var applyBtn     = document.getElementById('apply-btn');
  var soundToggle  = document.getElementById('sound-toggle');
  var mineCounter  = document.getElementById('mine-counter');
  var faceBtn      = document.getElementById('face-btn');
  var timerEl      = document.getElementById('timer');
  var boardWrap    = document.getElementById('board-wrap');
  var board        = document.getElementById('board');
  var fxCanvas     = document.getElementById('fx-canvas');

  /* ---------- 难度预设（契约规定） ---------- */
  var PRESETS = {
    beginner:     { width: 9,  height: 9,  mines: 10 },
    intermediate: { width: 16, height: 16, mines: 40 },
    expert:       { width: 30, height: 16, mines: 99 }
  };

  /* ---------- 内部状态：二维数组 {mine, revealed, flagged, adjacent} ---------- */
  var config = { width: 9, height: 9, mines: 10 }; // 当前难度
  var grid = [];        // grid[y][x] -> cell state
  var cellEls = [];     // cellEls[y][x] -> DOM element
  var minesPlaced = false;  // 首次点击后才布雷
  var gameOver = false;
  var won = false;
  var revealedCount = 0;
  var flagCount = 0;
  var time = 0;
  var timerId = null;

  /* 鼠标按键跟踪：用于“左右键同按”chording */
  var leftDown = false;
  var rightDown = false;
  var chordArmed = false;   // 双键同按已触发
  var chordCell = null;     // 双键按下时所在格
  var suppressClick = false; // chord 后抑制随之而来的 click
  var suppressFlag = false;  // chord 后抑制随之而来的 contextmenu 插旗

  /* ============================================================
   * 工具函数
   * ============================================================ */

  /* 三位数码管格式化：可为负（如 -05），正数补零（如 010），超界直接显示 */
  function format3(n) {
    if (n < 0) {
      var a = Math.abs(n);
      return '-' + (a < 100 ? String(a).padStart(2, '0') : String(a));
    }
    return n <= 999 ? String(n).padStart(3, '0') : String(n);
  }

  function updateMineCounter() {
    mineCounter.textContent = format3(config.mines - flagCount);
  }

  function updateTimer() {
    timerEl.textContent = format3(Math.min(time, 999));
  }

  function startTimer() {
    if (timerId) return;
    timerId = setInterval(function () {
      time = Math.min(time + 1, 999); // 封顶 999
      updateTimer();
      if (time >= 999) stopTimer();
    }, 1000);
  }

  function stopTimer() {
    if (timerId) { clearInterval(timerId); timerId = null; }
  }

  function setFace(emoji) { faceBtn.textContent = emoji; }

  function inBounds(x, y) {
    return x >= 0 && x < config.width && y >= 0 && y < config.height;
  }

  function forEachNeighbor(x, y, fn) {
    for (var dy = -1; dy <= 1; dy++) {
      for (var dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        var nx = x + dx, ny = y + dy;
        if (inBounds(nx, ny)) fn(nx, ny);
      }
    }
  }

  function eventCell(e) {
    var el = e.target.closest ? e.target.closest('.cell') : null;
    if (!el || !board.contains(el)) return null;
    return { x: +el.dataset.x, y: +el.dataset.y };
  }

  /* ============================================================
   * 建盘 / 布雷 / 渲染
   * ============================================================ */

  function buildGrid() {
    grid = [];
    for (var y = 0; y < config.height; y++) {
      var row = [];
      for (var x = 0; x < config.width; x++) {
        row.push({ mine: false, revealed: false, flagged: false, adjacent: 0 });
      }
      grid.push(row);
    }
  }

  /* 首次点击后才布雷：排除被点格及其 8 邻域 */
  function placeMines(safeX, safeY) {
    var forbidden = {};
    forbidden[safeX + ',' + safeY] = true;
    forEachNeighbor(safeX, safeY, function (nx, ny) {
      forbidden[nx + ',' + ny] = true;
    });

    var candidates = [];
    for (var y = 0; y < config.height; y++) {
      for (var x = 0; x < config.width; x++) {
        if (!forbidden[x + ',' + y]) candidates.push({ x: x, y: y });
      }
    }

    // Fisher–Yates 洗牌后取前 N 个布雷
    for (var i = candidates.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = candidates[i]; candidates[i] = candidates[j]; candidates[j] = t;
    }
    var n = Math.min(config.mines, candidates.length);
    for (var k = 0; k < n; k++) {
      grid[candidates[k].y][candidates[k].x].mine = true;
    }

    // 预计算邻雷数
    for (var yy = 0; yy < config.height; yy++) {
      for (var xx = 0; xx < config.width; xx++) {
        if (grid[yy][xx].mine) continue;
        var count = 0;
        forEachNeighbor(xx, yy, function (nx, ny) {
          if (grid[ny][nx].mine) count++;
        });
        grid[yy][xx].adjacent = count;
      }
    }
    minesPlaced = true;
  }

  /* 单格渲染：class 组合遵循 CSS 契约 */
  function renderCell(x, y) {
    var c = grid[y][x];
    var el = cellEls[y][x];
    el.className = 'cell';
    el.textContent = '';
    if (c.revealed) {
      el.classList.add('revealed');
      if (c.mine) {
        el.classList.add('mine');
        el.textContent = '💣';
      } else if (c.adjacent > 0) {
        el.classList.add('n' + c.adjacent); // n1~n8 数字着色
        el.textContent = c.adjacent;
      }
    } else if (c.flagged) {
      el.classList.add('flagged');
      el.textContent = '🚩';
    }
  }

  /* 渲染整个棋盘：gridTemplateColumns 用 CSS 变量 --cell-size */
  function renderBoard() {
    board.innerHTML = '';
    board.style.gridTemplateColumns = 'repeat(' + config.width + ', var(--cell-size))';
    cellEls = [];
    var frag = document.createDocumentFragment();
    for (var y = 0; y < config.height; y++) {
      var rowEls = [];
      for (var x = 0; x < config.width; x++) {
        var el = document.createElement('div');
        el.className = 'cell';
        el.dataset.x = x;
        el.dataset.y = y;
        frag.appendChild(el);
        rowEls.push(el);
      }
      cellEls.push(rowEls);
    }
    board.appendChild(frag);
  }

  /* ============================================================
   * 新游戏
   * ============================================================ */
  function newGame() {
    stopTimer();
    minesPlaced = false;
    gameOver = false;
    won = false;
    revealedCount = 0;
    flagCount = 0;
    time = 0;
    leftDown = rightDown = chordArmed = false;
    chordCell = null;
    buildGrid();
    renderBoard();
    updateMineCounter();
    updateTimer();
    setFace('🙂');
  }

  /* ============================================================
   * 翻开 / 洪水填充
   * ============================================================ */

  /* 翻开单格；0 邻雷时 BFS 洪水展开。返回是否真实翻开了格子。 */
  function reveal(x, y) {
    var c = grid[y][x];
    if (c.revealed || c.flagged || gameOver) return false;

    // 首次左键：布雷（排除首点及 8 邻域）并启动计时器
    if (!minesPlaced) {
      placeMines(x, y);
      startTimer();
    }

    if (c.mine) { lose(x, y); return true; }

    // BFS 洪水填充
    var stack = [[x, y]];
    var openedAny = false;
    while (stack.length) {
      var p = stack.pop();
      var cx = p[0], cy = p[1];
      var cell = grid[cy][cx];
      if (cell.revealed || cell.flagged || cell.mine) continue;
      cell.revealed = true;
      revealedCount++;
      openedAny = true;
      renderCell(cx, cy);
      if (cell.adjacent === 0) {
        forEachNeighbor(cx, cy, function (nx, ny) {
          var n = grid[ny][nx];
          if (!n.revealed && !n.flagged && !n.mine) stack.push([nx, ny]);
        });
      }
    }
    if (openedAny) {
      window.GameAudio.play('reveal');
      checkWin();
    }
    return openedAny;
  }

  /* 左键动作：翻开；对未布雷区的普通点击播放 click */
  function handleLeftClick(x, y) {
    if (gameOver) return;
    var c = grid[y][x];
    if (c.revealed || c.flagged) {
      window.GameAudio.play('click'); // 普通点击（无翻开效果）
      return;
    }
    reveal(x, y);
  }

  /* 右键动作：插旗/取消旗 */
  function toggleFlag(x, y) {
    if (gameOver || !minesPlaced) return; // 未布雷前不插旗（经典行为：首点前盘面无操作必要）
    var c = grid[y][x];
    if (c.revealed) return;
    c.flagged = !c.flagged;
    flagCount += c.flagged ? 1 : -1;
    window.GameAudio.play(c.flagged ? 'flag' : 'unflag');
    renderCell(x, y);
    updateMineCounter();
  }

  /* chording：数字格上，周围旗数 == 数字时翻开其余邻格（可能踩雷） */
  function chord(x, y) {
    if (gameOver || !minesPlaced) return;
    var c = grid[y][x];
    if (!c.revealed || c.adjacent === 0) return;
    var flags = 0;
    forEachNeighbor(x, y, function (nx, ny) {
      if (grid[ny][nx].flagged) flags++;
    });
    if (flags !== c.adjacent) return;
    forEachNeighbor(x, y, function (nx, ny) {
      var n = grid[ny][nx];
      if (!n.revealed && !n.flagged) reveal(nx, ny);
    });
  }

  /* ============================================================
   * 踩雷 / 胜利
   * ============================================================ */
  function lose(hitX, hitY) {
    gameOver = true;
    stopTimer();
    window.GameAudio.play('explosion');

    // 该格中心换算为相对 #fx-canvas 的像素坐标
    var cellEl = cellEls[hitY][hitX];
    var cr = cellEl.getBoundingClientRect();
    var fr = fxCanvas.getBoundingClientRect();
    var px = cr.left - fr.left + cr.width / 2;
    var py = cr.top - fr.top + cr.height / 2;
    window.GameFX.explodeAt(px, py);
    window.GameFX.shakeBoard();

    // 揭示全部雷；错误旗标 wrong-flag；被踩格标 exploded
    for (var y = 0; y < config.height; y++) {
      for (var x = 0; x < config.width; x++) {
        var c = grid[y][x];
        var el = cellEls[y][x];
        if (c.mine && !c.flagged) {
          c.revealed = true;
          renderCell(x, y); // revealed + mine
        } else if (!c.mine && c.flagged) {
          el.classList.add('wrong-flag'); // 保留 flagged + 🚩，CSS 画红叉
        }
      }
    }
    cellEl.classList.add('exploded'); // 红底
    setFace('😵');
  }

  function checkWin() {
    if (gameOver) return;
    if (revealedCount !== config.width * config.height - config.mines) return;
    gameOver = true;
    won = true;
    stopTimer();
    // 自动给剩余雷插旗
    for (var y = 0; y < config.height; y++) {
      for (var x = 0; x < config.width; x++) {
        var c = grid[y][x];
        if (c.mine && !c.flagged) {
          c.flagged = true;
          flagCount++;
          renderCell(x, y);
        }
      }
    }
    updateMineCounter();
    setFace('😎');
    window.GameAudio.play('win');
    window.GameFX.celebrate();
  }

  /* ============================================================
   * 事件绑定
   * ============================================================ */

  /* 阻止棋盘右键默认菜单 */
  board.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });

  /* 左键翻开（click）；chord 后抑制一次 */
  board.addEventListener('click', function (e) {
    if (suppressClick) { suppressClick = false; return; }
    var p = eventCell(e);
    if (!p) return;
    handleLeftClick(p.x, p.y);
  });

  /* 右键插旗（mouseup 右键时）；chord 后抑制一次 */
  board.addEventListener('mouseup', function (e) {
    if (e.button !== 2) return;
    if (suppressFlag) { suppressFlag = false; return; }
    if (chordArmed) return; // 双键流程中不插旗
    var p = eventCell(e);
    if (!p) return;
    toggleFlag(p.x, p.y);
  });

  /* 按下：笑脸变 😮；跟踪左右键实现“同按 chording” */
  board.addEventListener('mousedown', function (e) {
    if (!gameOver) setFace('😮');
    if (e.button === 0) leftDown = true;
    if (e.button === 2) rightDown = true;
    if (leftDown && rightDown && !chordArmed) {
      chordArmed = true;
      chordCell = eventCell(e);
    }
  });

  /* 松开：恢复笑脸；双键同按结束时执行 chord */
  document.addEventListener('mouseup', function (e) {
    if (e.button === 0) leftDown = false;
    if (e.button === 2) rightDown = false;
    if (!gameOver) setFace('🙂');
    if (chordArmed && !leftDown && !rightDown) {
      chordArmed = false;
      suppressClick = true;  // 抑制 chord 后浏览器派生的 click
      suppressFlag = true;   // 抑制 chord 后派生的右键插旗
      if (chordCell) chord(chordCell.x, chordCell.y);
      chordCell = null;
      // 若后续没有对应事件，标记在下一轮事件循环自动复位
      setTimeout(function () { suppressClick = false; suppressFlag = false; }, 0);
    }
  });

  /* 数字格双击 chording */
  board.addEventListener('dblclick', function (e) {
    var p = eventCell(e);
    if (!p) return;
    var c = grid[p.y][p.x];
    if (c.revealed && c.adjacent > 0) chord(p.x, p.y);
  });

  /* 笑脸按钮：点击重开 */
  faceBtn.addEventListener('click', function () {
    newGame();
  });

  /* 难度切换：预设即重开；custom 显示自定义输入 */
  presetSelect.addEventListener('change', function () {
    var v = presetSelect.value;
    if (v === 'custom') {
      customInputs.hidden = false;
      return; // 等待 apply-btn
    }
    customInputs.hidden = true;
    var p = PRESETS[v];
    if (!p) return;
    config = { width: p.width, height: p.height, mines: p.mines };
    newGame();
  });

  /* 自定义校验：宽 5-50、高 5-30、雷 1 到 宽×高-9 */
  applyBtn.addEventListener('click', function () {
    var w = parseInt(customWidth.value, 10);
    var h = parseInt(customHeight.value, 10);
    var m = parseInt(customMines.value, 10);
    var maxMines = w * h - 9; // 至少留出首点安全区 9 格
    if (!Number.isFinite(w) || w < 5 || w > 50) {
      alert('宽度必须是 5 ~ 50 之间的整数');
      return;
    }
    if (!Number.isFinite(h) || h < 5 || h > 30) {
      alert('高度必须是 5 ~ 30 之间的整数');
      return;
    }
    if (!Number.isFinite(m) || m < 1 || m > maxMines) {
      alert('雷数必须是 1 ~ ' + maxMines + '（宽×高-9）之间的整数');
      return;
    }
    config = { width: w, height: h, mines: m };
    newGame();
  });

  /* 音效开关 */
  soundToggle.addEventListener('change', function () {
    window.GameAudio.setEnabled(soundToggle.checked);
  });
  window.GameAudio.setEnabled(soundToggle.checked); // 初始化同步

  /* 初始化特效引擎（Canvas 叠层） */
  window.GameFX.init(fxCanvas);

  /* ---------- 启动：默认初级 ---------- */
  newGame();
})();
