import test from "node:test";
import assert from "node:assert/strict";
import { createSurface } from "../js/surface_topology.js";
import { Minefield } from "../js/game_engine.js";

function randomSource(seed = 17) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const subtract = (a, b) => a.map((value, index) => value - b[index]);
const dot = (a, b) =>
  a.reduce((sum, value, index) => sum + value * b[index], 0);
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const pointKey = (point) => point.join(",");
const edgeKey = (a, b) => [pointKey(a), pointKey(b)].sort().join("|");

function triangles(cell) {
  const result = [];
  for (let row = 0; row < cell.patchSize - 1; row += 1) {
    for (let column = 0; column < cell.patchSize - 1; column += 1) {
      const offset = row * cell.patchSize + column;
      const a = cell.patch[offset];
      const b = cell.patch[offset + 1];
      const c = cell.patch[offset + cell.patchSize + 1];
      const d = cell.patch[offset + cell.patchSize];
      result.push([a, b, c], [a, c, d]);
    }
  }
  return result;
}

function preparedSurface({
  topology = createSurface({ resolution: 4 }),
  mineIds,
  revealedIds = [],
  flaggedIds = [],
}) {
  const field = new Minefield({ topology, mines: mineIds.length });
  for (const id of mineIds) field.cells[id].mine = true;
  for (const cell of field.cells) {
    if (!cell.mine) {
      cell.adjacent = field
        .neighbors(cell.id)
        .filter((id) => field.cells[id].mine).length;
    }
  }
  for (const id of revealedIds) field.cells[id].revealed = true;
  for (const id of flaggedIds) field.cells[id].flagged = true;
  field.revealedCount = revealedIds.length;
  field.flagCount = flaggedIds.length;
  field.status = "playing";
  return field;
}

test("surface configuration validates shape, integer resolution, safe seed, and irregularity", () => {
  for (const resolution of [3, 13, 4.5, "6", NaN, Infinity]) {
    assert.throws(() => createSurface({ resolution }), RangeError);
  }
  for (const irregularity of [-0.01, 1.01, "0.5", NaN, Infinity]) {
    assert.throws(() => createSurface({ irregularity }), RangeError);
  }
  for (const seed of [0.5, "1", NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => createSurface({ seed }), RangeError);
  }
  assert.throws(() => createSurface({ shape: "torus" }), RangeError);
  assert.equal(createSurface().cellCount, 216);
  assert.equal(createSurface({ seed: -11 }).seed, -11);
});

test("every resolution and shape preserves six complete direction atlases and exact surface area", () => {
  for (let resolution = 4; resolution <= 12; resolution += 1) {
    for (const shape of ["cube", "stepped", "terrace"]) {
      for (const irregularity of [0, 0.05, 0.45, 1]) {
        for (const seed of [1, 42, 14864]) {
          const topology = createSurface({
            resolution,
            shape,
            irregularity,
            seed,
          });
          const count = 6 * resolution * resolution;
          assert.equal(topology.kind, "surface");
          assert.equal(topology.cellCount, count);
          assert.equal(topology.cells.length, count);
          assert.equal(topology.surfaceArea, count);
          assert.equal(topology.width, resolution);
          assert.equal(topology.height, 6 * resolution);
          assert.equal(topology.patchSize, 2);
          assert(Math.abs(Math.hypot(...topology.viewDirection) - 1) < 1e-12);
          assert(
            topology.viewDirection[1] > 0,
            "The default view must keep the staircase upright",
          );
          for (let face = 0; face < 6; face += 1) {
            const cells = topology.cells.filter((cell) => cell.face === face);
            assert.equal(cells.length, resolution ** 2);
            assert.equal(
              new Set(cells.map((cell) => `${cell.u},${cell.v}`)).size,
              resolution ** 2,
            );
          }
          for (const cell of topology.cells) {
            assert.equal(
              cell.id,
              cell.face * resolution ** 2 + cell.v * resolution + cell.u,
            );
            assert.equal(cell.x, cell.u);
            assert.equal(cell.y, cell.face * resolution + cell.v);
            assert.equal(cell.x, cell.id % resolution);
            assert.equal(cell.y, Math.floor(cell.id / resolution));
            assert(cell.neighbors.length >= 6 && cell.neighbors.length <= 9);
            assert.equal(new Set(cell.neighbors).size, cell.neighbors.length);
            assert(!cell.neighbors.includes(cell.id));
            for (const neighbor of cell.neighbors)
              assert(topology.cells[neighbor].neighbors.includes(cell.id));
          }
          assert.equal(
            topology.maxDegree,
            Math.max(...topology.cells.map((cell) => cell.neighbors.length)),
          );
        }
      }
    }
  }
});

test("all tiles are coplanar unit squares with outward axis-aligned normals and exact 2x2 patches", () => {
  const normals = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ];
  for (const resolution of [4, 7, 12]) {
    for (const shape of ["cube", "stepped", "terrace"]) {
      for (const irregularity of [0, 0.45, 1]) {
        const topology = createSurface({
          resolution,
          shape,
          irregularity,
          seed: 7351,
        });
        let area = 0;
        let volume = 0;
        let radius = 0;
        for (const cell of topology.cells) {
          assert.equal(cell.patchSize, 2);
          assert.equal(cell.patch.length, 4);
          assert.deepEqual(cell.patch, [
            cell.corners[0],
            cell.corners[1],
            cell.corners[3],
            cell.corners[2],
          ]);
          assert.deepEqual(cell.normal, normals[cell.face]);
          const edges = cell.corners.map((point, index) =>
            subtract(cell.corners[(index + 1) % 4], point),
          );
          for (let index = 0; index < 4; index += 1) {
            assert.equal(Math.hypot(...edges[index]), 1);
            assert.equal(dot(edges[index], edges[(index + 1) % 4]), 0);
            assert.equal(
              dot(subtract(cell.corners[index], cell.center), cell.normal),
              0,
            );
            assert(
              cell.corners[index].every((coordinate) =>
                Number.isInteger(coordinate + resolution / 2),
              ),
            );
            radius = Math.max(radius, Math.hypot(...cell.corners[index]));
          }
          assert.deepEqual(
            cell.center,
            cell.corners[0].map(
              (value, axis) => (value + cell.corners[2][axis]) / 2,
            ),
          );
          assert.deepEqual(
            cross(edges[0], edges[1]).map((value) => value || 0),
            cell.normal,
          );
          assert.equal(
            Math.hypot(...subtract(cell.corners[0], cell.corners[2])),
            Math.SQRT2,
          );
          for (const [a, b, c] of triangles(cell)) {
            const normal = cross(subtract(b, a), subtract(c, a));
            assert.equal(Math.hypot(...normal) / 2, 0.5);
            assert.equal(dot(normal, cell.normal), 1);
            area += 0.5;
            volume += dot(a, cross(b, c)) / 6;
          }
        }
        assert.equal(area, topology.surfaceArea);
        assert.equal(radius, topology.radius);
        assert(volume > 0 && volume <= resolution ** 3 + 1e-8);
        if (shape !== "cube" && irregularity > 0)
          assert(volume < resolution ** 3);
      }
    }
  }
});

test("integer corner adjacency matches real contact and the closed mesh has one manifold link at every vertex", () => {
  for (const resolution of [4, 6, 12]) {
    for (const shape of ["cube", "stepped", "terrace"]) {
      for (const seed of [1, 42, 912]) {
        const topology = createSurface({
          resolution,
          shape,
          irregularity: 1,
          seed,
        });
        const owners = new Map();
        const edges = new Map();
        const orientedEdges = new Map();
        for (const cell of topology.cells) {
          for (const corner of cell.corners) {
            const key = pointKey(corner);
            if (!owners.has(key)) owners.set(key, []);
            owners.get(key).push(cell.id);
          }
          cell.corners.forEach((corner, index) => {
            const next = cell.corners[(index + 1) % 4];
            const key = edgeKey(corner, next);
            if (!edges.has(key)) edges.set(key, []);
            edges.get(key).push(cell.id);
            const direction = pointKey(corner) < pointKey(next) ? 1 : -1;
            orientedEdges.set(key, (orientedEdges.get(key) || 0) + direction);
          });
        }
        assert([...edges.values()].every((ids) => ids.length === 2));
        assert([...orientedEdges.values()].every((sum) => sum === 0));
        assert.equal(owners.size - edges.size + topology.cellCount, 2);
        for (const cell of topology.cells) {
          const expected = new Set(
            cell.corners.flatMap((corner) => owners.get(pointKey(corner))),
          );
          expected.delete(cell.id);
          assert.deepEqual(
            cell.neighbors,
            [...expected].sort((a, b) => a - b),
          );
        }
        // A connected cycle around each vertex excludes solids joined only at an edge or point.
        for (const [vertex, incident] of owners) {
          const links = new Map(incident.map((id) => [id, new Set()]));
          for (const id of incident) {
            const corners = topology.cells[id].corners;
            const index = corners.findIndex(
              (corner) => pointKey(corner) === vertex,
            );
            for (const next of [(index + 1) % 4, (index + 3) % 4]) {
              for (const neighbor of edges.get(
                edgeKey(corners[index], corners[next]),
              )) {
                if (neighbor !== id) links.get(id).add(neighbor);
              }
            }
            assert.equal(links.get(id).size, 2);
          }
          const reached = new Set([incident[0]]);
          const pending = [incident[0]];
          for (let cursor = 0; cursor < pending.length; cursor += 1) {
            for (const id of links.get(pending[cursor])) {
              if (!reached.has(id)) {
                reached.add(id);
                pending.push(id);
              }
            }
          }
          assert.equal(reached.size, incident.length);
        }
        const reached = new Set([0]);
        const pending = [0];
        for (let cursor = 0; cursor < pending.length; cursor += 1) {
          for (const id of topology.cells[pending[cursor]].neighbors) {
            if (!reached.has(id)) {
              reached.add(id);
              pending.push(id);
            }
          }
        }
        assert.equal(reached.size, topology.cellCount);
      }
    }
  }
});

test("regular cubes have the usual corner graph and zero irregularity removes every cut", () => {
  const baseline = createSurface({ resolution: 6, shape: "cube" });
  assert.equal(baseline.maxDegree, 8);
  assert.equal(
    baseline.cells.filter((cell) => cell.neighbors.length === 7).length,
    24,
  );
  for (const shape of ["cube", "stepped", "terrace"]) {
    for (const seed of [1, 42, 14864]) {
      const topology = createSurface({
        resolution: 6,
        shape,
        irregularity: shape === "cube" ? 1 : 0,
        seed,
      });
      assert.deepEqual(topology.cells, baseline.cells);
    }
  }
});

test("seed and relief change the block layout deterministically while keeping exact tile sizes and area", () => {
  const options = {
    resolution: 8,
    shape: "terrace",
    irregularity: 0.6,
    seed: 381,
  };
  const baseline = createSurface(options);
  assert.deepEqual(createSurface(options), baseline);
  for (const variation of [
    { seed: 382 },
    { irregularity: 0 },
    { irregularity: 1 },
    { shape: "cube" },
    { shape: "stepped" },
  ]) {
    const changed = createSurface({ ...options, ...variation });
    assert.notDeepEqual(
      changed.cells.map((cell) => cell.center),
      baseline.cells.map((cell) => cell.center),
    );
    assert.equal(changed.surfaceArea, baseline.surfaceArea);
    assert.equal(changed.cellCount, baseline.cellCount);
  }
  const cut = baseline.cells.filter((cell) => {
    const axis = cell.normal.findIndex((value) => value !== 0);
    return Math.abs(cell.center[axis]) < options.resolution / 2;
  });
  assert(cut.length > 0);
  assert(cut.every((cell) => dot(cell.normal, baseline.viewDirection) > 0));
  assert(baseline.cells.some((cell) => cell.neighbors.length > 8));
  const smaller = createSurface({ resolution: 4, shape: "cube" });
  const larger = createSurface({ resolution: 12, shape: "cube" });
  assert.equal(larger.surfaceArea / smaller.surfaceArea, 9);
  assert(Math.abs(larger.radius / smaller.radius - 3) < 1e-12);
});

test("surface geometry is recursively frozen and does not contain answer fields", () => {
  const topology = createSurface();
  assert(Object.isFrozen(topology));
  assert(Object.isFrozen(topology.cells));
  assert(Object.isFrozen(topology.cells[0].patch[0]));
  assert(Object.isFrozen(topology.cells[0].neighbors));
  assert.throws(() => {
    topology.cells[0].center[0] = 999;
  }, TypeError);
  assert.throws(() => {
    topology.cells[0].neighbors.push(999);
  }, TypeError);
  for (const cell of topology.cells) {
    assert(!("mine" in cell));
    assert(!("adjacent" in cell));
    assert(!("revealed" in cell));
  }
});

test("surface mine limits reserve the largest first-click neighborhood and validate the map", () => {
  const topology = createSurface({ resolution: 4 });
  const limit = topology.cellCount - topology.maxDegree - 1;
  assert.equal(new Minefield({ topology, mines: limit }).cells.length, 96);
  for (const mines of [0, limit + 1, 2.5, "10", NaN]) {
    assert.throws(() => new Minefield({ topology, mines }), RangeError);
  }
  for (const mutate of [
    (copy) => {
      copy.cells[0].id = 1;
    },
    (copy) => {
      copy.cells[0].neighbors.push(0);
    },
    (copy) => {
      copy.cells[0].neighbors.push(copy.cells[0].neighbors[0]);
    },
    (copy) => {
      copy.cells[0].neighbors.push(999);
    },
    (copy) => {
      copy.cells[0].neighbors.pop();
    },
    (copy) => {
      copy.cells[0].center[0] = NaN;
    },
    (copy) => {
      copy.viewDirection[0] = NaN;
    },
    (copy) => {
      copy.width = 5;
    },
    (copy) => {
      for (const cell of copy.cells) {
        cell.neighbors = cell.neighbors.filter(
          (id) => copy.cells[id].face === cell.face,
        );
      }
    },
  ]) {
    const copy = structuredClone(topology);
    mutate(copy);
    assert.throws(() => new Minefield({ topology: copy }), TypeError);
  }
});

test("first reveals at corners, seams, and face interiors exclude all surface neighbors", () => {
  const topology = createSurface({ resolution: 4 });
  const widest = topology.cells.find(
    (cell) => cell.neighbors.length === topology.maxDegree,
  ).id;
  for (const first of [0, 1, 5, 15, 16, 31, 33, 48, 64, 95, widest]) {
    const field = new Minefield({
      topology,
      mines: topology.cellCount - topology.maxDegree - 1,
      random: randomSource(first + 1),
    });
    const result = field.reveal(first);
    assert(result.changed.includes(first));
    assert.equal(
      field.cells.filter((cell) => cell.mine).length,
      topology.cellCount - topology.maxDegree - 1,
    );
    assert.equal(field.cells[first].adjacent, 0);
    for (const id of [first, ...field.neighbors(first)])
      assert.equal(field.cells[id].mine, false);
    for (const cell of field.cells.filter((cell) => !cell.mine)) {
      assert.equal(
        cell.adjacent,
        field.neighbors(cell.id).filter((id) => field.cells[id].mine).length,
      );
    }
    assert.notEqual(field.status, "lost");
  }
});

test("concave cells support nine adjacent mines and preserve marking and win rules", () => {
  const topology = createSurface({
    resolution: 6,
    shape: "terrace",
    irregularity: 1,
  });
  const anchor = topology.cells.find((cell) => cell.neighbors.length === 9);
  assert(anchor);
  const field = preparedSurface({
    topology,
    mineIds: anchor.neighbors,
    revealedIds: [anchor.id],
  });
  assert.equal(field.cells[anchor.id].adjacent, 9);
  assert.equal(field.snapshot().cells[anchor.id].adjacent, 9);
  assert.equal(field.snapshot().topology.maxDegree, topology.maxDegree);
  for (const id of anchor.neighbors)
    assert.equal(field.toggleFlag(id).action, "flag");
  assert.equal(field.chord(anchor.id).action, "noop");
  for (const cell of field.cells) {
    if (!cell.mine && !cell.revealed) field.reveal(cell.id);
  }
  assert.equal(field.status, "won");
  assert.equal(field.flagCount, 9);
});

test("flood expansion crosses face seams, protects flags, and wins after the last safe flag opens", () => {
  const topology = createSurface({ resolution: 4 });
  const field = preparedSurface({ topology, mineIds: [10], flaggedIds: [1] });
  const result = field.reveal(0);
  assert.equal(result.action, "reveal");
  assert.equal(field.cells[1].revealed, false);
  assert.equal(field.cells[10].revealed, false);
  assert(
    field.cells.filter((cell) => cell.revealed).some((cell) => cell.face !== 0),
  );
  assert.equal(field.revealedCount, 94);
  assert.equal(field.toggleFlag(1).action, "unflag");
  assert.equal(field.reveal(1).action, "win");
  assert.equal(field.revealedCount, 95);
  assert.equal(field.cells[10].flagged, true);
  assert.equal(field.flagCount, 1);
  assert.equal(field.toggleFlag(10).action, "noop");
});

test("a correctly flagged cross-face chord reveals remaining neighbors", () => {
  const topology = createSurface({ resolution: 4 });
  const anchor = topology.cells[0];
  const across = anchor.neighbors.find(
    (id) => topology.cells[id].face !== anchor.face,
  );
  const field = preparedSurface({
    topology,
    mineIds: [across, 10, 26, 42, 58, 74, 90],
    revealedIds: [0],
  });
  const adjacentMines = field.neighbors(0).filter((id) => field.cells[id].mine);
  assert(adjacentMines.includes(across));
  assert.equal(field.chord(0).action, "noop");
  for (const id of adjacentMines) field.toggleFlag(id);
  const result = field.chord(0);
  assert(["chord", "win"].includes(result.action));
  for (const id of field.neighbors(0)) {
    assert.equal(
      field.cells[id].mine ? field.cells[id].flagged : field.cells[id].revealed,
      true,
    );
  }
});

test("an incorrect cross-face chord loses, identifies the hit, and exposes wrong flags", () => {
  const topology = createSurface({ resolution: 4 });
  const across = topology.cells[0].neighbors.find(
    (id) => topology.cells[id].face !== 0,
  );
  const wrong = topology.cells[0].neighbors.find(
    (id) => topology.cells[id].face === 0,
  );
  const field = preparedSurface({
    topology,
    mineIds: [across],
    revealedIds: [0],
    flaggedIds: [wrong],
  });
  const result = field.chord(0);
  assert.equal(result.action, "lose");
  assert.equal(field.cells[across].exploded, true);
  assert.equal(field.cells[across].revealed, true);
  assert.equal(field.cells[wrong].wrongFlag, true);
  assert.equal(field.reveal(5).action, "noop");
});

test("surface snapshots mask answers and isolate state from input geometry and adjacency mutations", () => {
  const original = structuredClone(createSurface({ resolution: 4 }));
  original.mine = "answer";
  original.cells[0].mine = true;
  original.cells[0].adjacent = 8;
  const field = new Minefield({
    topology: original,
    mines: 12,
    random: randomSource(),
  });
  assert.equal(field.toggleFlag(0).action, "noop");
  original.cells[0].neighbors.length = 0;
  original.cells[0].center[0] = 999;
  assert.equal(field.neighbors(0).length, 7);
  assert.notEqual(field.topology.cells[0].center[0], 999);
  const neighbors = field.neighbors(0);
  neighbors.length = 0;
  assert.equal(field.neighbors(0).length, 7);
  field.reveal(0);
  const snapshot = field.snapshot();
  assert.equal(snapshot.topology, field.topology);
  assert.deepEqual(snapshot.topology.viewDirection, original.viewDirection);
  assert(Object.isFrozen(snapshot.topology.viewDirection));
  assert(Object.isFrozen(snapshot.topology.cells[0].neighbors));
  assert(!("mine" in snapshot.topology));
  assert(!("mine" in snapshot.topology.cells[0]));
  assert(!("adjacent" in snapshot.topology.cells[0]));
  assert.equal(snapshot.cells[0].face, 0);
  for (const cell of snapshot.cells.filter((cell) => !cell.revealed)) {
    assert.equal(cell.mine, null);
    assert.equal(cell.adjacent, null);
  }
  snapshot.cells[0].face = 5;
  assert.equal(field.cells[0].face, 0);
  for (const id of [-1, 96, 0.5, NaN, "0", undefined]) {
    const before = field.snapshot();
    assert.deepEqual(field.neighbors(id), []);
    for (const method of ["reveal", "toggleFlag", "chord"])
      assert.equal(field[method](id).action, "noop");
    assert.deepEqual(field.snapshot(), before);
  }
});

test("surface games recover cleanly from invalid random output before the first reveal", () => {
  const field = new Minefield({
    topology: createSurface({ resolution: 4 }),
    random: () => Infinity,
  });
  const before = field.snapshot();
  assert.throws(() => field.reveal(0), RangeError);
  assert.deepEqual(field.snapshot(), before);
  assert(field.cells.every((cell) => !cell.mine));
});
