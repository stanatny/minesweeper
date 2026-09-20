// 原创本地合成：独立音乐与音效总线，仅在用户手势 unlock 后创建音频上下文。
export class SurveyAudio {
  /**
   * 创建音频控制器，不立即播放或申请音频上下文。
   * @returns {SurveyAudio} 默认开启音乐及音效，等待用户手势解锁。
   */
  constructor() {
    this.enabled = true;
    this.musicEnabled = true;
    this.context = null;
    this.mood = "ready";
    this.unlocked = false;
    this.disposed = false;
    this.voices = new Set();
    this.scheduler = null;
    this.beat = 0;
    this.nextBeatAt = 0;
    this.onVisibility = () => this.handleVisibility();
    globalThis.document?.addEventListener(
      "visibilitychange",
      this.onVisibility,
    );
  }

  /**
   * 在 pointerdown/keydown 等用户手势中建立或恢复音频。
   * @returns {Promise<boolean>} 成功运行时返回 true；不支持或被浏览器拒绝时返回 false。
   */
  async unlock() {
    if (this.disposed || this.isHidden()) return false;
    if (!this.context) {
      const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!Context) return false;
      try {
        this.context = new Context({ latencyHint: "interactive" });
        this.createGraph();
      } catch {
        try {
          await this.context?.close();
        } catch {}
        this.context = null;
        return false;
      }
    }
    if (this.context.state === "closed") return false;
    this.unlocked = true;
    try {
      if (this.context.state !== "running") await this.context.resume();
      if (this.disposed || this.isHidden()) {
        await this.context.suspend().catch(() => {});
        return false;
      }
      this.syncGains();
      this.startMusic();
      return this.context.state === "running";
    } catch {
      this.stopMusic();
      return false;
    }
  }

  /**
   * 开关操作音及爆炸音，不改变音乐偏好。
   * @param {boolean} value 是否开启音效。
   * @returns {void} 静音立即生效，并停止仍在播放的音效声部。
   */
  setEnabled(value) {
    this.enabled = Boolean(value);
    this.setBus(this.sfxGain, this.enabled ? 0.78 : 0);
    if (!this.enabled) this.stopVoices("sfx");
  }

  /**
   * 独立开关背景音乐，不创建音频上下文。
   * @param {boolean} value 是否开启音乐。
   * @returns {void} 关闭时清除调度器和音乐声部。
   */
  setMusicEnabled(value) {
    this.musicEnabled = Boolean(value);
    this.setBus(this.musicGain, this.musicLevel());
    if (this.musicEnabled) this.startMusic();
    else this.stopMusic();
  }

  /**
   * 播放操作反馈，保留旧调用方式。
   * @param {string} action reveal/chord/flag/unflag/win/lose。
   * @returns {void} lose 播放单次爆炸；逐个连锁应直接调用 playExplosion。
   */
  play(action) {
    if (action === "lose") {
      this.playExplosion();
      return;
    }
    if (!this.canPlay("sfx")) return;
    const notes =
      action === "win"
        ? [440, 523.25, 659.25, 880]
        : action === "flag"
          ? [659.25, 987.77]
          : action === "unflag"
            ? [493.88, 329.63]
            : action === "chord"
              ? [329.63, 493.88, 659.25]
              : action === "reveal"
                ? [261.63, 392]
                : [];
    const start = this.context.currentTime + 0.005;
    notes.forEach((frequency, index) =>
      this.tone(
        frequency,
        start + index * 0.065,
        action === "win" ? 0.5 : 0.2,
        0.045,
        "sfx",
      ),
    );
  }

  /**
   * 与一次视觉爆炸同步播放冲击、下坠低频与碎片尾音。
   * @param {object} options 连锁序号 index、总数 total、左右声像 pan（-1 到 1）。
   * @returns {void} 每次调用仅触发一颗雷，不预先调度整条连锁。
   */
  playExplosion({ index = 0, total = 1, pan = 0 } = {}) {
    if (!this.canPlay("sfx")) return;
    const context = this.context;
    const order = Number.isFinite(index) ? Math.max(0, Math.floor(index)) : 0;
    const count = Number.isFinite(total) ? Math.max(1, total) : 1;
    const variation = ((order * 37 + 11) % 23) / 23;
    const force =
      order === 0 ? 1 : (0.66 + variation * 0.17) * (count > 40 ? 0.88 : 1);
    const at = context.currentTime + 0.004;
    const active = [...this.voices].filter(
      (voice) => voice.group === "sfx" && voice.explosion,
    );
    // 前三颗保留冲击力，密集阶段按活跃声部数为同帧低频叠加预留余量。
    const headroom =
      order < 3 ? 1 : Math.min(1, Math.sqrt(3 / (active.length + 1)));
    if (active.length >= 9) active[0].stop();

    const output = context.createGain();
    output.gain.value = force * headroom;
    const panner = context.createStereoPanner
      ? context.createStereoPanner()
      : context.createGain();
    if (panner.pan)
      panner.pan.value = Number.isFinite(pan)
        ? Math.max(-1, Math.min(1, pan))
        : 0;
    output.connect(panner);
    panner.connect(this.sfxGain);
    const nodes = [output, panner];
    const sounds = [];

    // 低通噪声提供空气冲击；频率快速下落，避免持续刺耳的白噪声。
    const blast = context.createBufferSource();
    blast.buffer = this.noiseBuffer;
    blast.playbackRate.value = 0.82 + variation * 0.35;
    const blastFilter = context.createBiquadFilter();
    blastFilter.type = "lowpass";
    blastFilter.Q.value = 0.8;
    blastFilter.frequency.setValueAtTime(1750 + variation * 700, at);
    blastFilter.frequency.exponentialRampToValueAtTime(125, at + 0.34);
    const blastEnvelope = context.createGain();
    this.envelope(blastEnvelope.gain, at, 0.004, 0.29, 0.38);
    blast.connect(blastFilter).connect(blastEnvelope).connect(output);
    nodes.push(blastFilter, blastEnvelope);
    sounds.push({ source: blast, at, duration: 0.41, offset: variation * 0.3 });

    // 两层不同下坠速率的低频形成短促、可辨认的爆破重量。
    for (let layer = 0; layer < 2; layer += 1) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = layer === 0 ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(
        (layer === 0 ? 132 : 73) * (0.9 + variation * 0.22),
        at,
      );
      oscillator.frequency.exponentialRampToValueAtTime(
        layer === 0 ? 34 : 27,
        at + 0.38,
      );
      this.envelope(
        gain.gain,
        at,
        0.003,
        layer === 0 ? 0.4 : 0.09,
        layer === 0 ? 0.6 : 0.35,
      );
      oscillator.connect(gain).connect(output);
      nodes.push(gain);
      sounds.push({
        source: oscillator,
        at,
        duration: layer === 0 ? 0.64 : 0.39,
      });
    }

    // 稍晚的窄带碎片尾音增加颗粒感，声量显著低于主体冲击。
    const shards = context.createBufferSource();
    shards.buffer = this.noiseBuffer;
    shards.playbackRate.value = 1.25 + variation * 0.5;
    const shardFilter = context.createBiquadFilter();
    shardFilter.type = "bandpass";
    shardFilter.frequency.setValueAtTime(3400 + variation * 1900, at);
    shardFilter.frequency.exponentialRampToValueAtTime(1550, at + 0.72);
    shardFilter.Q.value = 1.9;
    const shardEnvelope = context.createGain();
    this.envelope(shardEnvelope.gain, at + 0.028, 0.015, 0.105, 0.78);
    shards.connect(shardFilter).connect(shardEnvelope).connect(output);
    nodes.push(shardFilter, shardEnvelope);
    sounds.push({
      source: shards,
      at: at + 0.028,
      duration: 0.81,
      offset: 0.4,
    });
    const voice = this.registerVoice(sounds, nodes, "sfx");
    if (voice) voice.explosion = true;
  }

  /**
   * 调整音乐氛围，保留用户的音乐与音效设置。
   * @param {string} mood ready、playing、lost 或 won。
   * @returns {void} 已播放长音自然结束，新音符使用更新后的情绪。
   */
  setMood(mood) {
    if (!["ready", "playing", "lost", "won"].includes(mood)) return;
    this.mood = mood;
    if (this.musicGain && this.context?.state !== "closed") {
      const now = this.context.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setTargetAtTime(this.musicLevel(), now, 0.15);
    }
  }

  /**
   * 重置棋局声音和音乐段落，不修改静音选择。
   * @returns {void} 清除尚在播放的爆炸，随后以柔和起音恢复音乐。
   */
  reset() {
    if (this.disposed) return;
    this.stopVoices("sfx");
    this.stopMusic();
    this.beat = 0;
    this.setMood("ready");
    this.startMusic();
  }

  /**
   * 释放事件、调度器、音频节点与音频上下文。
   * @returns {void} 可以重复调用。
   */
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    globalThis.document?.removeEventListener(
      "visibilitychange",
      this.onVisibility,
    );
    this.stopMusic();
    this.stopVoices("sfx");
    for (const node of [
      this.sfxGain,
      this.musicGain,
      this.compressor,
      this.masterGain,
    ]) {
      try {
        node?.disconnect();
      } catch {}
    }
    if (this.context) {
      this.context.onstatechange = null;
      if (this.context.state !== "closed") this.context.close().catch(() => {});
    }
    this.noiseBuffer = null;
  }

  /*********************************************
   * Private Helper Functions
   ********************************************/

  createGraph() {
    const context = this.context;
    this.sfxGain = context.createGain();
    this.musicGain = context.createGain();
    this.compressor = context.createDynamicsCompressor();
    this.masterGain = context.createGain();
    this.compressor.threshold.value = -17;
    this.compressor.knee.value = 20;
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.006;
    this.compressor.release.value = 0.18;
    this.masterGain.gain.value = 0.7;
    this.sfxGain.connect(this.compressor);
    this.musicGain.connect(this.compressor);
    this.compressor.connect(this.masterGain).connect(context.destination);
    this.noiseBuffer = context.createBuffer(
      1,
      Math.ceil(context.sampleRate * 2),
      context.sampleRate,
    );
    const samples = this.noiseBuffer.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1)
      samples[index] = Math.random() * 2 - 1;
    this.syncGains();
    context.onstatechange = () => {
      if (this.disposed) return;
      if (context.state === "running" && !this.isHidden()) this.startMusic();
      else this.stopMusic();
    };
  }

  canPlay(group) {
    return (
      !this.disposed &&
      !this.isHidden() &&
      this.context?.state === "running" &&
      (group === "music" ? this.musicEnabled : this.enabled)
    );
  }

  isHidden() {
    return globalThis.document?.hidden === true;
  }

  setBus(bus, value) {
    if (!bus || !this.context || this.context.state === "closed") return;
    try {
      // 清除总线的旧自动化，连同静默分支中缓存的上一音量一起重置。
      bus.gain.cancelScheduledValues(0);
      bus.gain.value = value;
      bus.gain.setValueAtTime(value, this.context.currentTime);
    } catch {}
  }

  syncGains() {
    this.setBus(this.sfxGain, this.enabled ? 0.78 : 0);
    this.setBus(this.musicGain, this.musicLevel());
  }

  musicLevel() {
    return this.musicEnabled
      ? this.mood === "lost"
        ? 0.085
        : this.mood === "won"
          ? 0.19
          : 0.2
      : 0;
  }

  envelope(parameter, at, attack, peak, duration) {
    parameter.setValueAtTime(0, at);
    parameter.linearRampToValueAtTime(peak, at + attack);
    parameter.exponentialRampToValueAtTime(0.0001, at + duration);
    parameter.linearRampToValueAtTime(0, at + duration + 0.02);
  }

  registerVoice(sounds, nodes, group) {
    if (!this.context || this.context.state === "closed" || this.disposed) {
      for (const node of [...sounds.map((sound) => sound.source), ...nodes]) {
        try {
          node.disconnect();
        } catch {}
      }
      return null;
    }
    const voice = {
      group,
      sources: sounds.map((sound) => sound.source),
      ended: 0,
      cleaned: false,
    };
    voice.cleanup = () => {
      if (voice.cleaned) return;
      voice.cleaned = true;
      this.voices.delete(voice);
      for (const node of [...voice.sources, ...nodes]) {
        try {
          node.disconnect();
        } catch {}
      }
    };
    voice.stop = () => {
      for (const source of voice.sources) {
        try {
          source.stop();
        } catch {}
      }
      voice.cleanup();
    };
    this.voices.add(voice);
    try {
      for (const sound of sounds) {
        sound.source.onended = () => {
          voice.ended += 1;
          if (voice.ended === sounds.length) voice.cleanup();
        };
        if (sound.offset !== undefined)
          sound.source.start(sound.at, sound.offset);
        else sound.source.start(sound.at);
        sound.source.stop(sound.at + sound.duration);
      }
    } catch {
      voice.stop();
      return null;
    }
    return voice;
  }

  stopVoices(group) {
    for (const voice of [...this.voices])
      if (voice.group === group) voice.stop();
  }

  tone(frequency, at, duration, volume, group) {
    if (!this.canPlay(group)) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, at);
    this.envelope(gain.gain, at, 0.006, volume, duration);
    oscillator
      .connect(gain)
      .connect(group === "music" ? this.musicGain : this.sfxGain);
    this.registerVoice(
      [{ source: oscillator, at, duration: duration + 0.03 }],
      [gain],
      group,
    );
  }

  startMusic() {
    if (this.scheduler !== null || !this.unlocked || !this.canPlay("music"))
      return;
    this.nextBeatAt = this.context.currentTime + 0.035;
    // 恢复时从完整和弦开始，避免只有低频脉冲而没有铺底。
    this.beat -= this.beat % 8;
    this.scheduler = setInterval(() => this.scheduleMusic(), 60);
    this.scheduleMusic();
  }

  stopMusic() {
    if (this.scheduler !== null) clearInterval(this.scheduler);
    this.scheduler = null;
    this.stopVoices("music");
  }

  scheduleMusic() {
    if (!this.canPlay("music")) {
      this.stopMusic();
      return;
    }
    const now = this.context.currentTime;
    if (this.nextBeatAt < now - 0.2) {
      this.nextBeatAt = now + 0.025;
      this.beat -= this.beat % 8;
    }
    let scheduled = 0;
    while (this.nextBeatAt < now + 0.18 && scheduled < 4) {
      this.scheduleBeat(this.beat, this.nextBeatAt);
      this.nextBeatAt += 60 / 52;
      this.beat += 1;
      scheduled += 1;
    }
  }

  scheduleBeat(beat, at) {
    const chords = [
      [57, 60, 64],
      [53, 57, 60],
      [48, 55, 60],
      [55, 59, 62],
    ];
    const notes = chords[Math.floor(beat / 8) % chords.length];
    if (beat % 8 === 0) this.pad(notes, at, (60 / 52) * 8 + 0.65);
    if (beat % 4 === 2 && this.mood !== "lost") {
      const note = notes[Math.floor(beat / 4) % notes.length] + 12;
      const frequency = 440 * 2 ** ((note - 69) / 12);
      this.tone(frequency, at, 1.65, 0.052, "music");
      this.tone(frequency * 2.004, at + 0.012, 0.9, 0.008, "music");
    }
    if (beat % 2 === 0 && this.mood !== "lost") {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(62, at);
      oscillator.frequency.exponentialRampToValueAtTime(43, at + 0.32);
      this.envelope(gain.gain, at, 0.03, 0.07, 0.37);
      oscillator.connect(gain).connect(this.musicGain);
      this.registerVoice(
        [{ source: oscillator, at, duration: 0.42 }],
        [gain],
        "music",
      );
    }
  }

  pad(notes, at, duration) {
    const context = this.context;
    const lowpass = context.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.Q.value = 0.5;
    lowpass.frequency.setValueAtTime(this.mood === "lost" ? 330 : 640, at);
    lowpass.frequency.linearRampToValueAtTime(
      this.mood === "lost" ? 260 : 850,
      at + duration * 0.45,
    );
    lowpass.frequency.linearRampToValueAtTime(420, at + duration);
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(0.06, at + 1.25);
    gain.gain.setValueAtTime(0.06, at + duration - 1.45);
    gain.gain.linearRampToValueAtTime(0, at + duration);
    lowpass.connect(gain).connect(this.musicGain);
    const sounds = [];
    for (const note of notes) {
      for (const detune of [-4, 4]) {
        const oscillator = context.createOscillator();
        oscillator.type = detune < 0 ? "sine" : "triangle";
        oscillator.frequency.value = 440 * 2 ** ((note - 69) / 12);
        oscillator.detune.value = detune;
        oscillator.connect(lowpass);
        sounds.push({ source: oscillator, at, duration: duration + 0.025 });
      }
    }
    this.registerVoice(sounds, [lowpass, gain], "music");
  }

  async handleVisibility() {
    if (!this.context || this.disposed || this.context.state === "closed")
      return;
    if (this.isHidden()) {
      this.stopMusic();
      this.stopVoices("sfx");
      try {
        await this.context.suspend();
      } catch {}
    } else if (this.unlocked && (this.enabled || this.musicEnabled)) {
      await this.unlock();
    }
  }
}
