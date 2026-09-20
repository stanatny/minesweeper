import test from "node:test";
import assert from "node:assert/strict";
import { Minefield } from "../js/game_engine.js";

// 固定随机源让布雷测试可重复，同时覆盖真实的首次布雷流程。
function seededRandom(seed = 1729) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

// 显式棋局用于独立验证翻开与旗标语义，不依赖随机布雷的具体排列。
function preparedField({
  mineIds = [6, 8, 18, 22],
  revealedIds = [],
  flaggedIds = [],
} = {}) {
  const field = new Minefield({ width: 5, height: 5, mines: mineIds.length });
  for (const id of mineIds) field.cells[id].mine = true;
  for (const cell of field.cells) {
    if (!cell.mine)
      cell.adjacent = field
        .neighbors(cell.id)
        .filter((id) => field.cells[id].mine).length;
  }
  for (const id of revealedIds) field.cells[id].revealed = true;
  for (const id of flaggedIds) field.cells[id].flagged = true;
  field.revealedCount = revealedIds.length;
  field.flagCount = flaggedIds.length;
  field.status = "playing";
  return field;
}

test("new fields preserve presets and defer mine placement until the first reveal", () => {
  for (const config of [
    undefined,
    { width: 16, height: 16, mines: 40 },
    { width: 30, height: 16, mines: 99 },
  ]) {
    const field = new Minefield(config);
    assert.equal(field.status, "ready");
    assert.equal(field.cells.length, field.width * field.height);
    assert.equal(field.revealedCount, 0);
    assert.equal(field.flagCount, 0);
    assert.ok(
      field.cells.every(
        (cell) => !cell.mine && !cell.revealed && !cell.flagged,
      ),
    );
  }
});

test("configuration requires integers and accepts both supported size boundaries", () => {
  for (const config of [
    { width: 4 },
    { width: 51 },
    { width: 5.5 },
    { width: "9" },
    { width: NaN },
    { height: 4 },
    { height: 31 },
    { height: 8.1 },
    { height: Infinity },
    { mines: 0 },
    { mines: 73 },
    { mines: 1.2 },
    { mines: "10" },
  ])
    assert.throws(() => new Minefield(config), RangeError);
  assert.throws(() => new Minefield({ random: 1 }), TypeError);
  assert.equal(
    new Minefield({ width: 5, height: 5, mines: 16 }).cells.length,
    25,
  );
  assert.equal(
    new Minefield({ width: 50, height: 30, mines: 1491 }).cells.length,
    1500,
  );
});

test("first reveal excludes the chosen cell and all neighbors, with exact mines and adjacent counts", () => {
  for (const firstId of [0, 4, 12, 20, 24]) {
    const field = new Minefield({
      width: 5,
      height: 5,
      mines: 16,
      random: seededRandom(firstId + 1),
    });
    const result = field.reveal(firstId);
    assert.ok(result.changed.includes(firstId));
    assert.equal(field.cells.filter((cell) => cell.mine).length, 16);
    assert.equal(field.cells[firstId].adjacent, 0);
    for (const id of [firstId, ...field.neighbors(firstId)])
      assert.equal(field.cells[id].mine, false);
    for (const cell of field.cells.filter((candidate) => !candidate.mine)) {
      assert.equal(
        cell.adjacent,
        field.neighbors(cell.id).filter((id) => field.cells[id].mine).length,
      );
    }
  }
});

test("invalid random output leaves the field unmodified", () => {
  for (const sample of [-0.1, 1, NaN, Infinity, "0.5"]) {
    const field = new Minefield({ random: () => sample });
    const before = field.snapshot();
    assert.throws(() => field.reveal(40), RangeError);
    assert.deepEqual(field.snapshot(), before);
    assert.ok(field.cells.every((cell) => !cell.mine));
  }
});

test("neighbors do not wrap across rows and invalid ids have no side effects", () => {
  const field = new Minefield({
    width: 5,
    height: 5,
    mines: 4,
    random: seededRandom(),
  });
  assert.deepEqual(field.neighbors(0), [1, 5, 6]);
  assert.deepEqual(field.neighbors(4), [3, 8, 9]);
  assert.deepEqual(field.neighbors(12), [6, 7, 8, 11, 13, 16, 17, 18]);
  for (const id of [-1, 25, 0.5, NaN, Infinity, undefined, null, "1", {}, []]) {
    const before = field.snapshot();
    assert.deepEqual(field.neighbors(id), []);
    for (const method of ["reveal", "toggleFlag", "chord"]) {
      assert.deepEqual(field[method](id), {
        changed: [],
        outcome: "ready",
        action: "noop",
      });
      assert.deepEqual(field.snapshot(), before);
    }
  }
});

test("flags require a started game, protect hidden cells, and toggle the count", () => {
  const ready = new Minefield();
  assert.equal(ready.toggleFlag(0).action, "noop");
  assert.equal(ready.flagCount, 0);
  const field = preparedField({ revealedIds: [7] });
  assert.equal(field.toggleFlag(7).action, "noop");
  assert.deepEqual(field.toggleFlag(6), {
    changed: [6],
    outcome: "playing",
    action: "flag",
  });
  assert.equal(field.flagCount, 1);
  assert.equal(field.reveal(6).action, "noop");
  assert.deepEqual(field.toggleFlag(6), {
    changed: [6],
    outcome: "playing",
    action: "unflag",
  });
  assert.equal(field.flagCount, 0);
});

test("flood reveal opens connected zero cells and their number boundary, preserving flags", () => {
  const field = preparedField({ mineIds: [4, 20, 24], flaggedIds: [1] });
  const result = field.reveal(0);
  const expected = [
    0, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23,
  ];
  assert.equal(result.action, "reveal");
  assert.deepEqual(
    [...result.changed].sort((a, b) => a - b),
    expected,
  );
  assert.equal(field.revealedCount, 21);
  assert.equal(field.cells[1].revealed, false);
  assert.ok(
    field.cells.filter((cell) => cell.mine).every((cell) => !cell.revealed),
  );
  assert.equal(new Set(result.changed).size, result.changed.length);
  assert.equal(field.reveal(0).action, "noop");
});

test("chord requires a revealed number and matching neighbor flags", () => {
  const field = preparedField({ revealedIds: [7] });
  const before = field.snapshot();
  assert.equal(field.chord(0).action, "noop");
  assert.equal(field.chord(7).action, "noop");
  assert.deepEqual(field.snapshot(), before);
  field.toggleFlag(6);
  assert.equal(field.chord(7).action, "noop");
  field.toggleFlag(8);
  const result = field.chord(7);
  assert.equal(result.action, "chord");
  assert.ok([1, 2, 3, 11, 12, 13].every((id) => field.cells[id].revealed));
  assert.ok(
    [6, 8].every((id) => field.cells[id].flagged && !field.cells[id].revealed),
  );
  assert.equal(field.status, "playing");
  assert.equal(field.chord(7).action, "noop");
});

test("incorrect chord flags trigger a loss and reveal all mines plus wrong flags", () => {
  const field = preparedField({ revealedIds: [7], flaggedIds: [1, 8] });
  const result = field.chord(7);
  assert.equal(result.action, "lose");
  assert.equal(result.outcome, "lost");
  assert.equal(field.cells[6].exploded, true);
  assert.equal(field.cells[1].wrongFlag, true);
  assert.equal(field.cells[8].wrongFlag, false);
  assert.ok(
    [6, 8, 18, 22].every(
      (id) => field.cells[id].revealed && result.changed.includes(id),
    ),
  );
  assert.ok(result.changed.includes(1));
  assert.equal(field.cells.filter((cell) => cell.exploded).length, 1);
  assert.equal(
    field.revealedCount,
    field.cells.filter((cell) => cell.revealed && !cell.mine).length,
  );
});

test("direct mine reveal loses and freezes further input", () => {
  const field = preparedField();
  assert.equal(field.reveal(6).action, "lose");
  assert.equal(field.cells[6].exploded, true);
  const before = field.snapshot();
  for (const method of ["reveal", "toggleFlag", "chord"]) {
    assert.deepEqual(field[method](0), {
      changed: [],
      outcome: "lost",
      action: "noop",
    });
    assert.deepEqual(field.snapshot(), before);
  }
});

test("revealing every safe cell wins, automatically flags mines, and freezes input", () => {
  const field = preparedField({ mineIds: [4, 20, 24], flaggedIds: [4] });
  const result = field.reveal(0);
  assert.equal(result.action, "win");
  assert.equal(field.status, "won");
  assert.equal(field.revealedCount, 22);
  assert.equal(field.flagCount, 3);
  assert.ok([4, 20, 24].every((id) => field.cells[id].flagged));
  assert.ok([20, 24].every((id) => result.changed.includes(id)));
  assert.equal(result.changed.includes(4), false);
  const before = field.snapshot();
  for (const method of ["reveal", "toggleFlag", "chord"])
    assert.equal(field[method](4).action, "noop");
  assert.deepEqual(field.snapshot(), before);
});

test("chord can finish a game and report win as the final action", () => {
  const mineIds = [6, 8, 18, 22];
  const revealedIds = Array.from({ length: 25 }, (_, id) => id).filter(
    (id) => !mineIds.includes(id) && id !== 2,
  );
  const field = preparedField({ mineIds, revealedIds, flaggedIds: [6, 8] });
  assert.deepEqual(field.chord(7), {
    changed: [2, 18, 22],
    outcome: "won",
    action: "win",
  });
  assert.equal(field.flagCount, 4);
});

test("snapshot masks hidden mines and numbers, and does not share mutable cell objects", () => {
  const field = preparedField({ revealedIds: [7], flaggedIds: [6] });
  const snapshot = field.snapshot();
  for (const cell of snapshot.cells.filter(
    (candidate) => !candidate.revealed,
  )) {
    assert.equal(cell.mine, null);
    assert.equal(cell.adjacent, null);
  }
  assert.equal(snapshot.cells[7].mine, false);
  assert.equal(snapshot.cells[7].adjacent, 2);
  snapshot.cells[6].flagged = false;
  snapshot.status = "won";
  assert.equal(field.cells[6].flagged, true);
  assert.equal(field.status, "playing");
  field.reveal(8);
  assert.ok(
    field.snapshot().cells.filter((cell) => cell.mine === true).length === 4,
  );
});
