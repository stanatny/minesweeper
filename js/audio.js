/**
 * js/audio.js — 扫雷音效引擎
 * 角色：音效工程师_Audio
 *
 * 对外契约（其他模块只依赖这些接口）：
 *   window.GameAudio.play(name)
 *     name ∈ {'click','flag','unflag','reveal','explosion','win'}
 *   window.GameAudio.setEnabled(bool)
 *   window.GameAudio.enabled
 *
 * 实现约束：
 *   - 全部使用 Web Audio API 实时合成，不引用任何外部音频文件。
 *   - AudioContext 懒加载，首次 play（首次用户手势）时创建并 resume，
 *     以兼容浏览器自动播放策略；resume 期间的播放请求会被排队补播。
 *   - 统一经过主增益（限幅防爆音）输出，音量适中。
 *   - 纯原生 JS，可在 file:// 下直接运行，无任何依赖。
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 内部状态
  // ---------------------------------------------------------------------------
  var ctx = null;              // AudioContext（懒加载）
  var master = null;           // 主增益节点（限幅/总音量）
  var enabled = true;          // 音效开关（默认开，与 HTML 里 checkbox checked 对应）
  var pendingPlays = [];       // ctx 处于 suspended 期间排队的播放请求

  /** 创建 AudioContext 与主增益链（仅第一次调用时执行） */
  function ensureContext() {
    if (ctx) return true;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false; // 极老浏览器无 Web Audio，静默降级

    ctx = new AC();

    // 主增益：总音量 0.9，留 10% 余量防爆音
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
    return true;
  }

  /**
   * 确保 ctx 处于 running 状态。
   * 浏览器自动播放策略下，首次手势后 resume() 是异步的；
   * 此期间把播放请求排队，resume 成功后补播。
   */
  function resumeIfNeeded() {
    if (ctx.state === 'suspended') {
      ctx.resume().then(function () {
        var queue = pendingPlays.slice();
        pendingPlays.length = 0;
        queue.forEach(function (fn) { fn(); });
      }).catch(function () { /* resume 失败则静默忽略 */ });
      return false;
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // 基础合成小工具
  // ---------------------------------------------------------------------------

  /**
   * 单个振荡器音符：指定波形、频率、起止时间、音量包络（快速起音 + 指数衰减）。
   * @param {string} type     波形：'sine'|'square'|'triangle'|'sawtooth'
   * @param {number} freq     频率 Hz
   * @param {number} startAt  开始时间（AudioContext 时间轴）
   * @param {number} duration 持续时间 s
   * @param {number} peak     峰值音量
   */
  function playTone(type, freq, startAt, duration, peak) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startAt);

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.008); // 8ms 快速起音，避免爆点
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration); // 指数衰减

    osc.connect(gain);
    gain.connect(master);
    osc.start(startAt);
    osc.stop(startAt + duration + 0.05);
  }

  /**
   * 白噪声 buffer（缓存复用）：1 秒、单声道。
   */
  var noiseBuffer = null;
  function getNoiseBuffer() {
    if (noiseBuffer) return noiseBuffer;
    var length = ctx.sampleRate; // 1 秒
    noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
    var data = noiseBuffer.getChannelData(0);
    for (var i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return noiseBuffer;
  }

  /**
   * 播放一段经滤波器处理的噪声。
   * @param {number} startAt   开始时间
   * @param {number} duration  持续时间 s
   * @param {string} filterType 'lowpass'|'bandpass'|'highpass'
   * @param {number} freqFrom  滤波起始频率
   * @param {number} freqTo    滤波结束频率（扫频）
   * @param {number} peak      峰值音量
   */
  function playNoise(startAt, duration, filterType, freqFrom, freqTo, peak) {
    var src = ctx.createBufferSource();
    src.buffer = getNoiseBuffer();
    src.loop = false;

    var filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(freqFrom, startAt);
    filter.frequency.exponentialRampToValueAtTime(Math.max(freqTo, 1), startAt + duration);

    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(startAt);
    src.stop(startAt + duration + 0.05);
  }

  // ---------------------------------------------------------------------------
  // 各音效实现
  // ---------------------------------------------------------------------------

  /** click：超短方波 tick（按钮/格子按下感） */
  function sfxClick() {
    var t = ctx.currentTime;
    playTone('square', 1200, t, 0.03, 0.15);
  }

  /** flag：较高音短促正弦 blip */
  function sfxFlag() {
    var t = ctx.currentTime;
    playTone('sine', 880, t, 0.09, 0.25);
  }

  /** unflag：较低音短促正弦 blip（与 flag 可明显区分） */
  function sfxUnflag() {
    var t = ctx.currentTime;
    playTone('sine', 520, t, 0.09, 0.25);
  }

  /** reveal：轻柔 pop —— 低通滤波噪声 + 快速衰减 */
  function sfxReveal() {
    var t = ctx.currentTime;
    playNoise(t, 0.06, 'lowpass', 900, 300, 0.2);
    // 叠一点低频正弦体，让 pop 更圆润
    playTone('sine', 220, t, 0.06, 0.12);
  }

  /** explosion：白噪声低通扫频爆轰 + 低频 sub-thump，约 0.8s，有冲击力 */
  function sfxExplosion() {
    var t = ctx.currentTime;
    var dur = 0.8;

    // 1) 主体：白噪声经低通滤波从 ~5kHz 扫到 ~60Hz，模拟爆轰能量衰减
    playNoise(t, dur, 'lowpass', 5000, 60, 0.7);

    // 2) 起始高频"裂响"层：高通短噪声，增加冲击瞬态
    playNoise(t, 0.12, 'highpass', 2000, 4000, 0.3);

    // 3) 低频 sub-thump：正弦从 120Hz 滑到 35Hz，模拟轰击体感
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.5);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.65, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);

    osc.connect(gain);
    gain.connect(master);
    osc.start(t);
    osc.stop(t + 0.6);
  }

  /** win：上行琶音 C5-E5-G5-C6 + 结尾高八度和弦，约 1s */
  function sfxWin() {
    var t = ctx.currentTime;
    var notes = [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6
    var step = 0.13;
    notes.forEach(function (freq, i) {
      playTone('triangle', freq, t + i * step, 0.22, 0.28);
    });
    // 结尾叠加高八度和弦收尾（C6+E6），更明亮
    var end = t + notes.length * step;
    playTone('triangle', 1046.50, end, 0.4, 0.22);
    playTone('triangle', 1318.51, end, 0.4, 0.18);
  }

  var SFX = {
    click: sfxClick,
    flag: sfxFlag,
    unflag: sfxUnflag,
    reveal: sfxReveal,
    explosion: sfxExplosion,
    win: sfxWin
  };

  // ---------------------------------------------------------------------------
  // 对外 API：window.GameAudio
  // ---------------------------------------------------------------------------
  window.GameAudio = {
    /**
     * 播放指定音效。未知名称静默忽略（防御性，避免打断游戏逻辑）。
     * @param {string} name 'click'|'flag'|'unflag'|'reveal'|'explosion'|'win'
     */
    play: function (name) {
      if (!enabled) return;
      var fn = SFX[name];
      if (!fn) return;
      if (!ensureContext()) return; // 无 Web Audio 支持，静默降级

      try {
        if (resumeIfNeeded()) {
          fn();
        } else {
          // ctx 尚未 resume 成功（理论上 play 均发生在用户手势后，正常可立即 resume）：
          // 排队，待 resume 完成后补播，保证首次点击也有声音。
          pendingPlays.push(fn);
        }
      } catch (e) {
        // 任何合成异常都不应影响游戏主流程
      }
    },

    /** 开关音效（game.js 绑定 sound-toggle 复选框调用） */
    setEnabled: function (on) {
      enabled = !!on;
    },

    /** 当前音效开关状态 */
    get enabled() {
      return enabled;
    }
  };
})();
