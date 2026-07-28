/**
 * effects.js — 扫雷特效引擎
 * 暴露 window.GameFX：
 *   - init(canvas)         初始化，ResizeObserver 跟随 #board-wrap 尺寸，devicePixelRatio 缩放
 *   - explodeAt(x, y)      粒子爆炸（火花 + 冲击波圆环 + 闪光），x/y 为相对 canvas 的 CSS 像素坐标
 *   - shakeBoard()         给 #board-wrap 加 .shake 类，animationend 后移除（600ms 兜底）
 *   - celebrate()          胜利庆祝：全 canvas 随机位置喷射彩色纸屑/烟花约 2 秒
 * 所有粒子由单一 requestAnimationFrame 循环驱动，无活动粒子时停止循环节能。
 * 纯原生 Canvas 2D + Web 标准 API，无外部依赖，file:// 直接可用。
 */
(function () {
  'use strict';

  var GameFX = {};

  // ---------- 内部状态 ----------
  var canvas = null;        // 目标 canvas 元素
  var ctx = null;           // 2D 上下文
  var cssW = 0;             // canvas 的 CSS 像素宽
  var cssH = 0;             // canvas 的 CSS 像素高
  var particles = [];       // 活动粒子列表
  var rafId = null;         // 当前 RAF 句柄（null 表示循环已停）
  var lastTime = 0;         // 上一帧时间戳
  var resizeObserver = null;
  var celebrateUntil = 0;   // 庆祝喷射截止时间（performance.now()）
  var nextBurstAt = 0;      // 下一次庆祝喷射时间

  // ---------- 粒子工厂 ----------
  // 火花粒子：径向飞散、重力下坠、透明度衰减、大小收缩
  function makeSpark(x, y) {
    var angle = Math.random() * Math.PI * 2;
    var speed = 90 + Math.random() * 260; // px/s
    return {
      type: 'spark',
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 60, // 略微向上偏
      gravity: 520,
      drag: 0.985,
      life: 0.5 + Math.random() * 0.5,  // 秒
      age: 0,
      size: 2 + Math.random() * 3.5,
      color: pick(['#ffdd55', '#ffaa33', '#ff7722', '#ff4411', '#ffcc66'])
    };
  }

  // 冲击波圆环：描边扩散、淡出
  function makeShockwave(x, y) {
    return {
      type: 'ring',
      x: x, y: y,
      radius: 4,
      growth: 320,       // px/s
      lineWidth: 5,
      life: 0.45,
      age: 0,
      color: 'rgba(255, 200, 120, 1)'
    };
  }

  // 白色闪光圆：快速放大淡出
  function makeFlash(x, y) {
    return {
      type: 'flash',
      x: x, y: y,
      radius: 6,
      growth: 900,       // px/s，非常快
      life: 0.18,
      age: 0,
      color: 'rgba(255, 255, 255, 1)'
    };
  }

  // 彩色纸屑：从喷射点向上喷出，受重力下落并左右飘动
  function makeConfetti(x, y) {
    var angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4; // 大致向上
    var speed = 180 + Math.random() * 320;
    return {
      type: 'confetti',
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 420,
      drag: 0.99,
      life: 1.2 + Math.random() * 1.0,
      age: 0,
      size: 3 + Math.random() * 4,
      wobble: Math.random() * Math.PI * 2,   // 左右飘动相位
      wobbleSpeed: 4 + Math.random() * 6,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 12,
      color: pick(['#ff5555', '#ffaa33', '#ffee55', '#55dd77',
                   '#5599ff', '#cc77ff', '#ff77aa', '#ffffff'])
    };
  }

  // 烟花火花：从爆点径向飞散的彩色亮点（celebrate 用）
  function makeFireworkSpark(x, y, color) {
    var angle = Math.random() * Math.PI * 2;
    var speed = 60 + Math.random() * 220;
    return {
      type: 'spark',
      x: x, y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 260,
      drag: 0.975,
      life: 0.7 + Math.random() * 0.7,
      age: 0,
      size: 1.5 + Math.random() * 2.5,
      color: color
    };
  }

  function pick(arr) {
    return arr[(Math.random() * arr.length) | 0];
  }

  // ---------- 渲染循环 ----------
  function ensureLoop() {
    if (rafId === null) {
      lastTime = performance.now();
      rafId = requestAnimationFrame(tick);
    }
  }

  function tick(now) {
    var dt = (now - lastTime) / 1000;
    lastTime = now;
    if (dt > 0.05) dt = 0.05; // 防止切后台后大跳变

    // 庆祝期间持续喷射新粒子
    if (now < celebrateUntil && now >= nextBurstAt) {
      spawnCelebrateBurst();
      nextBurstAt = now + 90 + Math.random() * 140; // 90~230ms 一组
    }

    // 更新并绘制
    ctx.clearRect(0, 0, cssW, cssH);
    var alive = [];
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.age += dt;
      if (p.age < p.life) {
        updateParticle(p, dt);
        drawParticle(p);
        alive.push(p);
      }
    }
    particles = alive;

    // 无活动粒子且庆祝已结束 → 停循环节能
    if (particles.length === 0 && now >= celebrateUntil) {
      ctx.clearRect(0, 0, cssW, cssH);
      rafId = null;
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  function updateParticle(p, dt) {
    switch (p.type) {
      case 'spark':
      case 'confetti':
        p.vy += p.gravity * dt;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.type === 'confetti') {
          p.wobble += p.wobbleSpeed * dt;
          p.x += Math.sin(p.wobble) * 30 * dt;
          p.rotation += p.rotSpeed * dt;
        }
        break;
      case 'ring':
      case 'flash':
        p.radius += p.growth * dt;
        break;
    }
  }

  function drawParticle(p) {
    var t = p.age / p.life;          // 0 → 1
    var alpha = 1 - t;               // 透明度衰减
    switch (p.type) {
      case 'spark': {
        var size = p.size * (1 - t * 0.8); // 大小收缩
        if (size < 0.3) return;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'confetti': {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        // 矩形纸屑，y 方向随相位压扁模拟翻转
        ctx.fillRect(-p.size, -p.size * 0.6 * Math.abs(Math.sin(p.wobble)),
                     p.size * 2, p.size * 1.2 * Math.abs(Math.sin(p.wobble)));
        ctx.restore();
        break;
      }
      case 'ring': {
        ctx.globalAlpha = alpha * 0.9;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(0.5, p.lineWidth * (1 - t));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
      case 'flash': {
        ctx.globalAlpha = alpha * 0.85;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }
    ctx.globalAlpha = 1;
  }

  // ---------- 尺寸管理 ----------
  function syncSize() {
    if (!canvas) return;
    // 尺寸跟随父容器（#board-wrap）
    var host = canvas.parentElement || canvas;
    var rect = host.getBoundingClientRect();
    cssW = Math.max(1, rect.width);
    cssH = Math.max(1, rect.height);

    // devicePixelRatio 缩放，保证 Retina 清晰
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // 之后全部用 CSS 像素坐标
  }

  // ---------- 公开 API ----------
  GameFX.init = function (canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    syncSize();

    // ResizeObserver 跟随 #board-wrap 尺寸变化（难度切换/窗口缩放）
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(function () { syncSize(); });
      resizeObserver.observe(canvas.parentElement || canvas);
    } else {
      // 兜底：监听窗口 resize
      window.addEventListener('resize', syncSize);
    }
  };

  // 粒子爆炸：60+ 橙红黄色火花 + 冲击波圆环 + 白色闪光
  GameFX.explodeAt = function (x, y) {
    if (!ctx) return;
    var count = 70; // 60+ 火花
    for (var i = 0; i < count; i++) {
      particles.push(makeSpark(x, y));
    }
    particles.push(makeShockwave(x, y));
    particles.push(makeFlash(x, y));
    ensureLoop();
  };

  // 震屏：给 #board-wrap 加 .shake，动画结束后移除（兜底 600ms）
  GameFX.shakeBoard = function () {
    var wrap = document.getElementById('board-wrap');
    if (!wrap) return;

    var done = false;
    var cleanup = function () {
      if (done) return;
      done = true;
      wrap.classList.remove('shake');
      wrap.removeEventListener('animationend', onEnd);
      clearTimeout(timer);
    };
    var onEnd = function (e) {
      // 只响应 shake 动画自身的结束（防止子元素动画冒泡误触发）
      if (!e || e.target === wrap) cleanup();
    };
    var timer = setTimeout(cleanup, 600);

    // 重新触发：先移除再强制 reflow 后加回
    wrap.classList.remove('shake');
    void wrap.offsetWidth;
    wrap.addEventListener('animationend', onEnd);
    wrap.classList.add('shake');
  };

  // 胜利庆祝：约 2 秒内全 canvas 随机位置连续喷射彩色纸屑/烟花
  GameFX.celebrate = function () {
    if (!ctx) return;
    var now = performance.now();
    celebrateUntil = now + 2000; // 持续约 2 秒
    nextBurstAt = now;
    ensureLoop();
  };

  // 在 canvas 随机位置喷射一组：一束彩色纸屑 + 一圈烟花火花
  function spawnCelebrateBurst() {
    var x = cssW * (0.1 + Math.random() * 0.8);
    var y = cssH * (0.15 + Math.random() * 0.55);
    var color = pick(['#ff5555', '#ffaa33', '#ffee55', '#55dd77',
                      '#5599ff', '#cc77ff', '#ff77aa']);
    var i;
    for (i = 0; i < 14; i++) particles.push(makeConfetti(x, y + cssH * 0.3));
    for (i = 0; i < 24; i++) particles.push(makeFireworkSpark(x, y, color));
  }

  window.GameFX = GameFX;
})();
