/**
 * 识别同一数字格上的连续短触摸；宿主负责命中测试、长按动作与实际连开。
 * now 可注入时钟；start/move/finish 接收 PointerEvent 和命中的格子 ID。
 */
export class TouchChordGesture {
  constructor({ now = () => performance.now(), interval = 360 } = {}) {
    this.now = now;
    this.interval = interval;
    this.pointers = new Set();
    this.state = null;
    this.previous = null;
    this.suppressUntil = 0;
  }

  start(event, id, eligible = false) {
    if (event.pointerType !== "touch") {
      this.cancel();
      this.suppressUntil = 0;
      return;
    }
    const time = this.now();
    this.suppressUntil = time + 750;
    this.pointers.add(event.pointerId);
    if (this.pointers.size > 1) {
      this.consume();
      return;
    }
    this.state = {
      pointerId: event.pointerId,
      id,
      x: event.clientX,
      y: event.clientY,
      time,
      eligible,
      cancelled: false,
    };
  }

  move(event) {
    if (
      this.state?.pointerId === event.pointerId &&
      Math.hypot(event.clientX - this.state.x, event.clientY - this.state.y) > 6
    )
      this.consume();
  }

  finish(event, id) {
    if (event.pointerType !== "touch") return null;
    const time = this.now();
    this.suppressUntil = time + 750;
    const state = this.state;
    this.pointers.delete(event.pointerId);
    if (this.pointers.size === 0) this.state = null;
    if (
      !state ||
      state.cancelled ||
      state.pointerId !== event.pointerId ||
      this.pointers.size > 0 ||
      id !== state.id ||
      !Number.isInteger(id) ||
      id < 0 ||
      time < state.time ||
      time - state.time >= 480 ||
      Math.hypot(event.clientX - state.x, event.clientY - state.y) > 6
    ) {
      this.previous = null;
      return null;
    }
    const previous = this.previous;
    const chord = Boolean(
      state.eligible &&
      previous &&
      previous.id === id &&
      time >= previous.time &&
      time - previous.time <= this.interval &&
      Math.hypot(event.clientX - previous.x, event.clientY - previous.y) <= 18,
    );
    // 一对触摸只产生一次连开；翻开盖板的首触不能与下一触误组成数字双击。
    this.previous =
      state.eligible && !chord
        ? { id, x: event.clientX, y: event.clientY, time }
        : null;
    return { id, chord };
  }

  consume() {
    if (this.state) this.state.cancelled = true;
    this.previous = null;
  }

  cancel() {
    this.pointers.clear();
    this.state = null;
    this.previous = null;
  }

  ignoresNativeDoubleClick(event) {
    return (
      event.pointerType === "touch" ||
      event.sourceCapabilities?.firesTouchEvents === true ||
      this.now() < this.suppressUntil
    );
  }
}

/** 返回标记数量不符时应提示的未翻开、未标记邻格，不改变游戏状态。 */
export function chordHintIds(game, id) {
  const cell = game.cells[id];
  if (
    game.status !== "playing" ||
    !cell?.revealed ||
    cell.mine ||
    cell.adjacent <= 0
  )
    return [];
  const neighbors = game.neighbors(id);
  if (
    neighbors.filter((neighbor) => game.cells[neighbor].flagged).length ===
    cell.adjacent
  )
    return [];
  return neighbors.filter(
    (neighbor) =>
      !game.cells[neighbor].revealed && !game.cells[neighbor].flagged,
  );
}
