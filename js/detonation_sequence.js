// Reveal, prime, and detonate mines outward from the impact point without changing the rules engine.
export class DetonationSequence {
  constructor() {
    this.reset();
  }

  reset() {
    this.time = 0;
    this.entries = [];
    this.byId = new Map();
    this.active = false;
    this.completed = false;
    this.duration = 0;
  }

  // start accepts the public snapshot after a loss, beginning with the triggered mine and spreading outward.
  start(snapshot) {
    this.reset();
    if (snapshot.status !== "lost") return;
    const mines = snapshot.cells.filter((cell) => cell.revealed && cell.mine);
    const origin = mines.find((cell) => cell.exploded) || mines[0];
    if (!origin) return;
    mines.sort((a, b) => {
      if (a.id === origin.id) return -1;
      if (b.id === origin.id) return 1;
      return (
        Math.hypot(a.x - origin.x, a.y - origin.y) -
          Math.hypot(b.x - origin.x, b.y - origin.y) || a.id - b.id
      );
    });
    // Separate the first three blasts, then shorten intervals along an ease-out curve to finish within about four seconds.
    const openingCount = Math.min(3, mines.length);
    const remaining = mines.length - openingCount;
    const openingEnd = 0.12 + (openingCount - 1) * 0.28;
    const cascadeDuration = Math.min(2.03, remaining * 0.14);
    this.entries = mines.map((cell, index) => {
      const progress =
        remaining > 0 ? (index - openingCount + 1) / remaining : 0;
      const blastAt =
        index < openingCount
          ? 0.12 + index * 0.28
          : openingEnd + 0.12 + cascadeDuration * (1 - (1 - progress) ** 1.9);
      return {
        id: cell.id,
        x: cell.x,
        y: cell.y,
        index,
        blastAt,
        revealAt: Math.max(0, blastAt - 0.42),
        fired: false,
        revealed: index === 0,
      };
    });
    this.byId = new Map(this.entries.map((entry) => [entry.id, entry]));
    this.duration = this.entries.at(-1).blastAt + 1.1;
    this.active = true;
  }

  // advance returns newly revealed mines and explosions so audio and 3D particles share one timeline.
  advance(delta) {
    if (!this.active) return { revealed: [], explosions: [], finished: false };
    // Use elapsed time while the page is visible so occasional slow frames do not prolong expert-mode detonations.
    this.time += Math.max(0, Number.isFinite(delta) ? delta : 0);
    const revealed = [],
      explosions = [];
    for (const entry of this.entries) {
      if (!entry.revealed && this.time >= entry.revealAt) {
        entry.revealed = true;
        revealed.push(entry.id);
      }
      if (!entry.fired && this.time >= entry.blastAt) {
        entry.fired = true;
        explosions.push({ ...entry, total: this.entries.length });
      }
    }
    const finished = this.time >= this.duration;
    if (finished) {
      this.active = false;
      this.completed = true;
    }
    return { revealed, explosions, finished };
  }

  stage(id) {
    const entry = this.byId.get(id);
    if (!entry) return { stage: "armed", progress: 0 };
    if (this.time < entry.revealAt) return { stage: "hidden", progress: 0 };
    if (this.time >= entry.blastAt)
      return {
        stage: "spent",
        progress: Math.min(1, (this.time - entry.blastAt) / 0.7),
      };
    const progress = 1 - Math.min(1, (entry.blastAt - this.time) / 0.42);
    return { stage: progress < 0.35 ? "armed" : "primed", progress };
  }

  present(snapshot) {
    if (!this.entries.length || snapshot.status !== "lost") return snapshot;
    return {
      ...snapshot,
      cells: snapshot.cells.map((cell) =>
        this.byId.has(cell.id) && this.stage(cell.id).stage === "hidden"
          ? {
              ...cell,
              revealed: false,
              mine: null,
              adjacent: null,
              exploded: false,
            }
          : cell,
      ),
    };
  }
}
