// Original local synthesis with separate music and effects buses; create the audio context only after a user gesture calls unlock.
export class SurveyAudio {
  /**
   * Create an audio controller without starting playback or requesting an audio context.
   * @returns {SurveyAudio} Music and effects default to enabled and wait for a user gesture to unlock playback.
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
   * Create or resume audio from a user gesture such as pointerdown or keydown.
   * @returns {Promise<boolean>} True when audio is running, or false if unsupported or blocked by the browser.
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
   * Enable or disable interaction and explosion sounds without changing the music preference.
   * @param {boolean} value Whether sound effects are enabled.
   * @returns {void} Muting takes effect immediately and stops active sound-effect voices.
   */
  setEnabled(value) {
    this.enabled = Boolean(value);
    this.setBus(this.sfxGain, this.enabled ? 0.78 : 0);
    if (!this.enabled) this.stopVoices("sfx");
  }

  /**
   * Toggle background music independently without creating an audio context.
   * @param {boolean} value Whether background music is enabled.
   * @returns {void} Disabling music clears its scheduler and voices.
   */
  setMusicEnabled(value) {
    this.musicEnabled = Boolean(value);
    this.setBus(this.musicGain, this.musicLevel());
    if (this.musicEnabled) this.startMusic();
    else this.stopMusic();
  }

  /**
   * Play interaction feedback while preserving the existing call interface.
   * @param {string} action reveal/chord/flag/unflag/win/lose。
   * @returns {void} lose plays one explosion; chain reactions should call playExplosion for each blast.
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
   * Play an impact, descending bass, and a debris tail in sync with one visual explosion.
   * @param {object} options Chain index, total mine count, and stereo pan from -1 to 1.
   * @returns {void} Each call triggers one mine without scheduling the entire chain in advance.
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
    // Keep the first three blasts punchy, then reserve bass headroom based on active voices during the dense finale.
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

    // Low-pass noise supplies the air impact; its cutoff falls quickly to avoid sustained harsh white noise.
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

    // Two bass layers descend at different rates to give each brief blast a distinct sense of weight.
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

    // A slightly delayed narrow-band debris tail adds texture at a much lower level than the main impact.
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
   * Play a soft rising launch or a bright pop with a short sparkle tail.
   * @param {string} phase "launch" or "burst", matching the visual firework event.
   * @param {object} options Strength from 0 to 1.5 and stereo pan from -1 to 1.
   * @returns {void} At most four firework voices share the effects bus and its lifecycle.
   */
  playFirework(phase, { strength = 1, pan = 0 } = {}) {
    if ((phase !== "launch" && phase !== "burst") || !this.canPlay("sfx"))
      return;
    const force = Number.isFinite(strength)
      ? Math.max(0, Math.min(1.5, strength))
      : 1;
    if (force === 0) return;
    const active = [...this.voices].filter((voice) => voice.firework);
    if (active.length >= 4) active.shift().stop();

    const context = this.context;
    const at = context.currentTime + 0.004;
    const launch = phase === "launch";
    const output = context.createGain();
    // Keep simultaneous pops below the victory chord, including the densest finale.
    output.gain.value = force * Math.min(1, Math.sqrt(2 / (active.length + 1)));
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

    // A narrow noise band rises with the rocket; a burst uses a brief, bass-free pop.
    const air = context.createBufferSource();
    air.buffer = this.noiseBuffer;
    air.playbackRate.value = launch ? 0.9 : 1.35;
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = launch ? 1.1 : 0.8;
    filter.frequency.setValueAtTime(launch ? 700 : 1850, at);
    filter.frequency.exponentialRampToValueAtTime(
      launch ? 2250 : 1100,
      at + (launch ? 0.38 : 0.085),
    );
    const airGain = context.createGain();
    this.envelope(
      airGain.gain,
      at,
      launch ? 0.065 : 0.003,
      launch ? 0.025 : 0.065,
      launch ? 0.42 : 0.105,
    );
    air.connect(filter).connect(airGain).connect(output);
    nodes.push(filter, airGain);
    sounds.push({
      source: air,
      at,
      duration: launch ? 0.46 : 0.14,
      offset: launch ? 0.15 : 0.65,
    });

    // Sine glints stay in the upper register and leave room for the existing win chord.
    const pitches = launch ? [880] : [1760, 2637.02];
    pitches.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const begins = at + (launch ? 0.025 : 0.022 + index * 0.055);
      const duration = launch ? 0.36 : 0.25 + index * 0.06;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, begins);
      oscillator.frequency.exponentialRampToValueAtTime(
        launch ? 1760 : frequency * 0.985,
        begins + duration,
      );
      this.envelope(
        gain.gain,
        begins,
        launch ? 0.05 : 0.005,
        launch ? 0.007 : 0.009 / (index + 1),
        duration,
      );
      oscillator.connect(gain).connect(output);
      nodes.push(gain);
      sounds.push({
        source: oscillator,
        at: begins,
        duration: duration + 0.03,
      });
    });

    const voice = this.registerVoice(sounds, nodes, "sfx");
    if (voice) {
      voice.firework = true;
      voice.fireworkPhase = phase;
    }
  }

  /**
   * Count live firework voices, excluding music and other game sounds.
   * @returns {number} Active launch and burst voices, bounded by four.
   */
  get fireworkVoiceCount() {
    let count = 0;
    for (const voice of this.voices) if (voice.firework) count += 1;
    return count;
  }

  /**
   * Stop current firework voices without interrupting music or the victory chord.
   * @returns {void} Safe before unlocking audio and after disposal.
   */
  stopFireworks() {
    for (const voice of [...this.voices]) if (voice.firework) voice.stop();
  }

  /**
   * Adjust the musical mood while preserving the music and sound-effect preferences.
   * @param {string} mood ready, playing, lost, or won.
   * @returns {void} Sustained notes finish naturally, and new notes use the updated mood.
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
   * Reset game sounds and the musical phrase without changing mute preferences.
   * @returns {void} Stop ongoing effects, then restart the music with a gentle attack.
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
   * Release event listeners, the scheduler, audio nodes, and the audio context.
   * @returns {void} Repeated calls are safe.
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
      // Clear previous bus automation and reset the cached volume, including values retained while muted.
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
    // Resume on a complete chord so the bass pulse is accompanied by the ambient pad.
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
