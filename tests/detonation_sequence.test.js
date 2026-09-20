import test from "node:test";
import assert from "node:assert/strict";
import { DetonationSequence } from "../js/detonation_sequence.js";

const snapshot = {
  status: "lost",
  cells: [
    { id: 0, x: 0, y: 0, mine: true, revealed: true, exploded: false },
    { id: 1, x: 1, y: 0, mine: true, revealed: true, exploded: true },
    { id: 2, x: 5, y: 5, mine: true, revealed: true, exploded: false },
    { id: 3, x: 2, y: 0, mine: false, revealed: true, adjacent: 2 },
  ],
};

test("detonates the actual hit first, then outward without changing game state", () => {
  const sequence = new DetonationSequence();
  const original = structuredClone(snapshot);
  sequence.start(snapshot);
  assert.deepEqual(
    sequence.entries.map((entry) => entry.id),
    [1, 0, 2],
  );
  assert.equal(sequence.present(snapshot).cells[2].revealed, false);
  assert.equal(sequence.present(snapshot).cells[3].adjacent, 2);
  const fired = [];
  for (let i = 0; i < 100; i++)
    fired.push(...sequence.advance(0.05).explosions);
  assert.deepEqual(
    fired.map((entry) => entry.id),
    [1, 0, 2],
  );
  assert.equal(sequence.completed, true);
  assert.equal(sequence.stage(2).stage, "spent");
  assert.deepEqual(snapshot, original);
  assert.equal(sequence.advance(1).explosions.length, 0);
});

test("preheats the next mine before its own explosion and resets outstanding events", () => {
  const sequence = new DetonationSequence();
  sequence.start(snapshot);
  for (let i = 0; i < 2; i++) sequence.advance(0.1);
  assert.equal(sequence.stage(1).stage, "spent");
  assert.equal(sequence.stage(0).stage, "primed");
  assert.equal(sequence.stage(2).stage, "hidden");
  sequence.reset();
  assert.equal(sequence.active, false);
  assert.equal(sequence.advance(0.1).explosions.length, 0);
  assert.equal(sequence.present(snapshot), snapshot);
});

test("dense boards remain bounded and invalid timing does not advance the sequence", () => {
  const sequence = new DetonationSequence();
  sequence.start({
    status: "lost",
    cells: Array.from({ length: 1491 }, (_, id) => ({
      id,
      x: id % 50,
      y: Math.floor(id / 50),
      revealed: true,
      mine: true,
      exploded: id === 0,
    })),
  });
  assert.ok(sequence.duration <= 4);
  sequence.advance(NaN);
  sequence.advance(-1);
  assert.equal(sequence.time, 0);
  sequence.start({ status: "ready", cells: [] });
  assert.equal(sequence.active, false);
});

test("all difficulties start sparsely, accelerate, and finish within four seconds", () => {
  for (const count of [1, 2, 3, 4, 10, 40, 99, 1491]) {
    const sequence = new DetonationSequence();
    sequence.start({
      status: "lost",
      cells: Array.from({ length: count }, (_, id) => ({
        id,
        x: id % 50,
        y: Math.floor(id / 50),
        revealed: true,
        mine: true,
        exploded: id === 0,
      })),
    });
    const times = sequence.entries.map((entry) => entry.blastAt);
    assert.ok(
      sequence.duration <= 4,
      `${count} mines must finish within four seconds`,
    );
    assert.ok(
      times.filter((time) => time <= 0.7).length <= 3,
      "The opening must contain only a few explosions",
    );
    for (let i = 1; i < times.length; i++) assert.ok(times[i] > times[i - 1]);
    if (count >= 10) {
      const gaps = times.slice(1).map((time, i) => time - times[i]);
      assert.ok(
        gaps.at(-1) < gaps[0] / 4,
        "The ending must be denser than the opening",
      );
      for (let i = 3; i < gaps.length; i++)
        assert.ok(gaps[i] <= gaps[i - 1] + 1e-10);
    }
    if (count >= 40) {
      const opening = times.filter((time) => time <= 1).length;
      const finale = times.filter((time) => time > times.at(-1) - 1).length;
      assert.ok(
        finale >= opening * 3,
        "Large boards must build into a dense finale",
      );
    }
    const fired = [];
    while (sequence.active) fired.push(...sequence.advance(1 / 30).explosions);
    assert.equal(fired.length, count);
    assert.equal(new Set(fired.map((entry) => entry.id)).size, count);
  }
});

test("slow frames do not stretch the sequence and never replay an explosion", () => {
  const sequence = new DetonationSequence();
  sequence.start(snapshot);
  const events = sequence.advance(2);
  assert.equal(events.explosions.length, 3);
  assert.equal(events.finished, true);
  assert.equal(sequence.advance(2).explosions.length, 0);
});
