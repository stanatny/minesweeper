/**
 * Minesweeper state engine, independent of rendering and input, for 3D scenes, keyboard controls, and tests.
 * cells stores the full board; use snapshot() for presentation to avoid exposing hidden answers.
 */
export class Minefield {
  /**
   * Create a board that is ready to start.
   * @param {object} options Board width, height, mine count, and an optional random number generator.
   * @returns {Minefield} An unseeded board that reserves a safe neighborhood on the first reveal.
   */
  constructor({
    width = 9,
    height = 9,
    mines = 10,
    random = Math.random,
  } = {}) {
    if (!Number.isInteger(width) || width < 5 || width > 50) {
      throw new RangeError("Width must be an integer between 5 and 50");
    }
    if (!Number.isInteger(height) || height < 5 || height > 30) {
      throw new RangeError("Height must be an integer between 5 and 30");
    }
    if (!Number.isInteger(mines) || mines < 1 || mines > width * height - 9) {
      throw new RangeError(
        "Mines must be an integer between 1 and width * height - 9",
      );
    }
    if (typeof random !== "function") {
      throw new TypeError("Random must be a function");
    }

    this.width = width;
    this.height = height;
    this.mines = mines;
    this.status = "ready";
    this.revealedCount = 0;
    this.flagCount = 0;
    this.#random = random;
    this.cells = Array.from({ length: width * height }, (_, id) => ({
      id,
      x: id % width,
      y: Math.floor(id / width),
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
      exploded: false,
      wrongFlag: false,
    }));
  }

  /**
   * Reveal a cell and expand empty regions; the first reveal and its eight neighbors are mine-free.
   * @param {number} id Zero-based cell index in row-major order.
   * @returns {object} Changed cell IDs, the game status, and the resulting action.
   */
  reveal(id) {
    if (!this.#canAct(id)) return this.#result();
    const cell = this.cells[id];
    if (cell.revealed || cell.flagged) return this.#result();
    if (this.status === "ready") {
      this.#placeMines(id);
      this.status = "playing";
    }

    const changed = new Set();
    if (cell.mine) {
      this.#lose(id, changed);
      return this.#result(changed, "lose");
    }
    this.#revealSafe(id, changed);
    const action = this.#checkWin(changed) ? "win" : "reveal";
    return this.#result(changed, action);
  }

  /**
   * Toggle a flag on a covered cell; do nothing before the first reveal or after the game ends.
   * @param {number} id Cell index.
   * @returns {object} Changed cell IDs, the game status, and a flag, unflag, or noop action.
   */
  toggleFlag(id) {
    if (!this.#canAct(id) || this.status !== "playing") return this.#result();
    const cell = this.cells[id];
    if (cell.revealed) return this.#result();
    cell.flagged = !cell.flagged;
    this.flagCount += cell.flagged ? 1 : -1;
    return this.#result(new Set([id]), cell.flagged ? "flag" : "unflag");
  }

  /**
   * Reveal remaining neighbors when adjacent flags match the number; incorrect flags can trigger a mine.
   * @param {number} id Index of a revealed numbered cell.
   * @returns {object} Changed cell IDs, the game status, and a chord, lose, win, or noop action.
   */
  chord(id) {
    if (!this.#canAct(id) || this.status !== "playing") return this.#result();
    const cell = this.cells[id];
    if (!cell.revealed || cell.adjacent === 0) return this.#result();
    const nearby = this.neighbors(id);
    const flags = nearby.filter(
      (neighborId) => this.cells[neighborId].flagged,
    ).length;
    if (flags !== cell.adjacent) return this.#result();

    const changed = new Set();
    for (const neighborId of nearby) {
      const neighbor = this.cells[neighborId];
      if (neighbor.revealed || neighbor.flagged) continue;
      if (neighbor.mine) {
        this.#lose(neighborId, changed);
        return this.#result(changed, "lose");
      }
      this.#revealSafe(neighborId, changed);
    }
    const action = this.#checkWin(changed) ? "win" : "chord";
    return this.#result(changed, action);
  }

  /**
   * Return valid neighbors in all eight directions, ordered from top to bottom and left to right.
   * @param {number} id Cell index; invalid indices do not change the board.
   * @returns {number[]} Neighbor indices, or an empty array for an invalid index.
   */
  neighbors(id) {
    if (!this.#isValidId(id)) return [];
    const { x, y } = this.cells[id];
    const nearby = [];
    for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
      for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
        if (offsetX === 0 && offsetY === 0) continue;
        const neighborX = x + offsetX;
        const neighborY = y + offsetY;
        if (
          neighborX < 0 ||
          neighborY < 0 ||
          neighborX >= this.width ||
          neighborY >= this.height
        )
          continue;
        nearby.push(neighborY * this.width + neighborX);
      }
    }
    return nearby;
  }

  /**
   * Create a detached snapshot for the interface and accessibility text.
   * @returns {object} Copies of the game and cells; covered cells have null mine and adjacent values.
   */
  snapshot() {
    return {
      width: this.width,
      height: this.height,
      mines: this.mines,
      status: this.status,
      revealedCount: this.revealedCount,
      flagCount: this.flagCount,
      cells: this.cells.map((cell) => ({
        ...cell,
        mine: cell.revealed ? cell.mine : null,
        adjacent: cell.revealed ? cell.adjacent : null,
      })),
    };
  }

  /*********************************************
   * Private Helper Functions
   ********************************************/

  #random;

  #isValidId(id) {
    return Number.isInteger(id) && id >= 0 && id < this.cells.length;
  }

  #canAct(id) {
    return (
      this.#isValidId(id) &&
      (this.status === "ready" || this.status === "playing")
    );
  }

  #result(changed = new Set(), action = "noop") {
    return {
      changed: [...changed],
      outcome: this.status,
      action: changed.size > 0 ? action : "noop",
    };
  }

  #placeMines(safeId) {
    const forbidden = new Set([safeId, ...this.neighbors(safeId)]);
    const candidates = this.cells
      .filter((cell) => !forbidden.has(cell.id))
      .map((cell) => cell.id);

    // Finish random sampling before changing the board so a failing random source leaves the initial state intact.
    for (let index = candidates.length - 1; index > 0; index -= 1) {
      const sample = this.#random();
      if (!Number.isFinite(sample) || sample < 0 || sample >= 1) {
        throw new RangeError("Random must return a finite number in [0, 1)");
      }
      const target = Math.floor(sample * (index + 1));
      [candidates[index], candidates[target]] = [
        candidates[target],
        candidates[index],
      ];
    }
    for (const id of candidates.slice(0, this.mines))
      this.cells[id].mine = true;
    for (const cell of this.cells) {
      if (!cell.mine) {
        cell.adjacent = this.neighbors(cell.id).filter(
          (id) => this.cells[id].mine,
        ).length;
      }
    }
  }

  #revealSafe(startId, changed) {
    const queue = [startId];
    const queued = new Set(queue);
    for (let head = 0; head < queue.length; head += 1) {
      const cell = this.cells[queue[head]];
      if (cell.revealed || cell.flagged || cell.mine) continue;
      cell.revealed = true;
      this.revealedCount += 1;
      changed.add(cell.id);
      if (cell.adjacent !== 0) continue;
      for (const id of this.neighbors(cell.id)) {
        const neighbor = this.cells[id];
        if (
          neighbor.revealed ||
          neighbor.flagged ||
          neighbor.mine ||
          queued.has(id)
        )
          continue;
        queue.push(id);
        queued.add(id);
      }
    }
  }

  #lose(hitId, changed) {
    this.status = "lost";
    this.cells[hitId].exploded = true;
    for (const cell of this.cells) {
      if (cell.mine) {
        cell.revealed = true;
        changed.add(cell.id);
      } else if (cell.flagged) {
        cell.wrongFlag = true;
        changed.add(cell.id);
      }
    }
  }

  #checkWin(changed) {
    if (this.revealedCount !== this.cells.length - this.mines) return false;
    this.status = "won";
    for (const cell of this.cells) {
      if (cell.mine && !cell.flagged) {
        cell.flagged = true;
        this.flagCount += 1;
        changed.add(cell.id);
      }
    }
    return true;
  }
}
