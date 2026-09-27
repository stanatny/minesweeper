import test from "node:test";
import assert from "node:assert/strict";
import { TouchChordGesture, chordHintIds } from "../js/touch_chord.js";
import { Minefield } from "../js/game_engine.js";

function harness() {
  let time = 0;
  const gesture = new TouchChordGesture({ now: () => time });
  const event = (overrides = {}) => ({
    pointerType: "touch",
    pointerId: 1,
    clientX: 100,
    clientY: 100,
    ...overrides,
  });
  const tick = (delta) => {
    time += delta;
  };
  const tap = (id = 7, eligible = true, overrides = {}) => {
    const pointer = event(overrides);
    gesture.start(pointer, id, eligible);
    tick(25);
    return gesture.finish(pointer, id);
  };
  return { gesture, event, tick, tap };
}

test("two short touches on an open number chord exactly once and suppress the synthetic dblclick", () => {
  const { gesture, tap, tick } = harness();
  assert.deepEqual(tap(), { id: 7, chord: false });
  tick(90);
  assert.deepEqual(tap(), { id: 7, chord: true });
  assert.equal(gesture.ignoresNativeDoubleClick({}), true);
  tick(90);
  assert.equal(tap().chord, false);
  tick(800);
  assert.equal(gesture.ignoresNativeDoubleClick({}), false);
  assert.equal(
    gesture.ignoresNativeDoubleClick({
      sourceCapabilities: { firesTouchEvents: true },
    }),
    true,
  );
});

test("a first reveal, distinct cell, distant touch, or slow second touch cannot form a chord", () => {
  for (const scenario of ["covered", "different", "distant", "slow"]) {
    const { tap, tick } = harness();
    tap(7, scenario !== "covered");
    tick(scenario === "slow" ? 400 : 60);
    const result = tap(
      scenario === "different" ? 8 : 7,
      true,
      scenario === "distant" ? { clientX: 120 } : {},
    );
    assert.equal(result.chord, false, scenario);
  }
});

test("dragging out and back, a long press, and an explicitly consumed gesture break the tap pair", () => {
  for (const scenario of ["drag", "long", "consumed"]) {
    const { gesture, tap, tick, event } = harness();
    tap();
    tick(30);
    gesture.start(event(), 7, true);
    if (scenario === "drag") gesture.move(event({ clientX: 109 }));
    if (scenario === "consumed") gesture.consume();
    tick(scenario === "long" ? 480 : 25);
    assert.equal(gesture.finish(event(), 7), null, scenario);
    tick(20);
    assert.equal(tap().chord, false, scenario);
  }
});

test("multitouch invalidates both releases and the preceding tap", () => {
  const { gesture, tap, tick, event } = harness();
  tap();
  tick(20);
  gesture.start(event(), 7, true);
  gesture.start(event({ pointerId: 2, clientX: 180 }), 8, true);
  tick(25);
  assert.equal(gesture.finish(event(), 7), null);
  assert.equal(gesture.finish(event({ pointerId: 2, clientX: 180 }), 8), null);
  assert.equal(gesture.pointers.size, 0);
  assert.equal(tap().chord, false);
});

test("capture loss, cancellation, a different release target, and backward time cannot leave a pending chord", () => {
  for (const scenario of ["cancel", "target", "clock"]) {
    const { gesture, tap, tick, event } = harness();
    tap();
    gesture.start(event(), 7, true);
    if (scenario === "cancel") gesture.cancel();
    tick(scenario === "clock" ? -1 : 25);
    assert.equal(
      gesture.finish(event(), scenario === "target" ? 8 : 7),
      null,
      scenario,
    );
    assert.equal(tap().chord, false, scenario);
  }
});

test("real mouse input clears touch suppression so desktop double clicks remain available", () => {
  const { gesture, tap, event } = harness();
  tap();
  const mouse = event({ pointerType: "mouse" });
  gesture.start(mouse, 7, true);
  assert.equal(gesture.ignoresNativeDoubleClick(mouse), false);
  assert.equal(gesture.finish(mouse, 7), null);
  assert.equal(tap().chord, false);
});

test("mismatched flags hint only covered unmarked neighbors without changing the game", () => {
  const game = new Minefield({ random: () => 0.37 });
  game.reveal(40);
  const anchor = game.cells.find(
    (cell) =>
      cell.revealed &&
      cell.adjacent > 0 &&
      game.neighbors(cell.id).some((id) => !game.cells[id].revealed),
  );
  assert(anchor);
  const neighbors = game.neighbors(anchor.id);
  const expected = neighbors.filter(
    (id) => !game.cells[id].revealed && !game.cells[id].flagged,
  );
  const before = game.snapshot();
  assert.deepEqual(chordHintIds(game, anchor.id), expected);
  assert.deepEqual(game.snapshot(), before);
  for (const id of neighbors.filter((id) => game.cells[id].mine))
    game.toggleFlag(id);
  assert.deepEqual(chordHintIds(game, anchor.id), []);
  const unmarked = neighbors.find(
    (id) => !game.cells[id].revealed && !game.cells[id].flagged,
  );
  if (unmarked !== undefined) {
    game.toggleFlag(unmarked);
    assert.deepEqual(
      chordHintIds(game, anchor.id),
      neighbors.filter(
        (id) => !game.cells[id].revealed && !game.cells[id].flagged,
      ),
    );
  }
  assert.deepEqual(chordHintIds(game, 40), []);
  assert.deepEqual(chordHintIds(game, -1), []);
});
