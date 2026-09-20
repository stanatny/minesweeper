/**
 * 扫雷状态引擎：独立于渲染与输入方式，支持三维场景、键盘操作和测试。
 * cells 保存完整棋局；对外展示请使用不包含隐藏答案的 snapshot()。
 */
export class Minefield {
  /**
   * 创建待开始的棋局。
   * @param {object} options 宽、高、雷数及可注入的随机数函数。
   * @returns {Minefield} 尚未布雷的棋局，首击时生成安全邻域。
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
   * 翻开一格，空白区域自动展开；首次翻开排除周围八格的雷。
   * @param {number} id 从零开始、按行排列的格子编号。
   * @returns {object} 改变的格子编号、棋局状态及实际动作。
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
   * 切换未翻开格子的旗标；首击前及结束后无操作。
   * @param {number} id 格子编号。
   * @returns {object} 改变的格子编号、棋局状态及 flag/unflag/noop 动作。
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
   * 数字周围的旗数匹配时，翻开剩余邻格；误标可能触雷。
   * @param {number} id 已翻开的数字格编号。
   * @returns {object} 改变的格子编号、棋局状态及 chord/lose/win/noop 动作。
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
   * 获取有效的八方向邻格，按从上到下、从左到右的顺序返回。
   * @param {number} id 格子编号；非法编号不会改变棋局。
   * @returns {number[]} 邻格编号，非法编号返回空数组。
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
   * 获取供界面及无障碍文本使用的独立快照。
   * @returns {object} 棋局和格子副本；隐藏格的 mine、adjacent 均为 null。
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

    // 先完成随机抽样再修改棋局，随机源报错时仍保留初始状态。
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
