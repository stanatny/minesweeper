/**
 * Build a closed orthogonal solid tiled exclusively with unit squares.
 * @param {object} options Resolution 4–12, irregularity 0–1, shape, and a deterministic integer seed.
 * @returns {object} Frozen geometry with 6*n*n tiles and the same exact surface area.
 * Faces are world directions +X, -X, +Y, -Y, +Z, -Z, each with an n×n direction atlas.
 * Patches are 2×2, row-major in v/u, and corner winding points out of the solid.
 */
export function createSurface({
  resolution = 6,
  irregularity = 0.75,
  shape = "stepped",
  seed = 1,
} = {}) {
  if (!Number.isInteger(resolution) || resolution < 4 || resolution > 12) {
    throw new RangeError("Resolution must be an integer between 4 and 12");
  }
  if (!Number.isFinite(irregularity) || irregularity < 0 || irregularity > 1) {
    throw new RangeError(
      "Irregularity must be a finite number between 0 and 1",
    );
  }
  if (!["cube", "stepped", "terrace"].includes(shape)) {
    throw new RangeError("Shape must be cube, stepped, or terrace");
  }
  if (!Number.isSafeInteger(seed)) {
    throw new RangeError("Seed must be a safe integer");
  }
  const n = resolution;
  const random = seededRandom(seed);
  const { floors, ceilings } = createVerticalBounds(
    n,
    irregularity,
    shape,
    random,
  );
  const rotation = ROTATIONS[Math.floor(random() * ROTATIONS.length)];
  const view = [1.25, 0.9, 1.5];
  const viewLength = Math.hypot(...view);
  const viewDirection = rotation.axes.map(
    (axis, index) => (rotation.signs[index] * view[axis]) / viewLength,
  );
  const solid = new Uint8Array(n ** 3);
  const voxelId = (x, y, z) => x + n * (y + n * z);
  for (let z = 0; z < n; z += 1) {
    for (let x = 0; x < n; x += 1) {
      for (let y = floors[x + n * z]; y < ceilings[x + n * z]; y += 1) {
        const original = [x, y, z];
        const transformed = rotation.axes.map((axis, index) =>
          rotation.signs[index] > 0 ? original[axis] : n - 1 - original[axis],
        );
        solid[voxelId(...transformed)] = 1;
      }
    }
  }
  const occupied = (x, y, z) =>
    x >= 0 &&
    x < n &&
    y >= 0 &&
    y < n &&
    z >= 0 &&
    z < n &&
    solid[voxelId(x, y, z)] === 1;
  const cells = new Array(6 * n * n);
  const vertices = new Map();
  const vertexOwners = new Map();
  let radius = 0;

  // Keys use exact integer lattice coordinates; centered positions remain exact half-integers.
  const point = (coordinates) => {
    const key = coordinates.join(",");
    if (!vertices.has(key)) {
      const position = coordinates.map((value) => value - n / 2);
      vertices.set(key, position);
      radius = Math.max(radius, Math.hypot(...position));
    }
    return vertices.get(key);
  };
  for (let z = 0; z < n; z += 1) {
    for (let y = 0; y < n; y += 1) {
      for (let x = 0; x < n; x += 1) {
        if (!occupied(x, y, z)) continue;
        for (let face = 0; face < DIRECTIONS.length; face += 1) {
          const normal = DIRECTIONS[face];
          if (occupied(x + normal[0], y + normal[1], z + normal[2])) continue;
          const {
            u,
            v,
            corners: latticeCorners,
          } = faceSquare(face, x, y, z, n);
          const id = face * n * n + v * n + u;
          if (cells[id])
            throw new Error(
              "Surface direction atlas contains an overlapping tile",
            );
          const corners = latticeCorners.map(point);
          const center = corners[0].map(
            (value, axis) => (value + corners[2][axis]) / 2,
          );
          cells[id] = {
            id,
            x: u,
            y: face * n + v,
            face,
            u,
            v,
            center,
            normal: [...normal],
            corners,
            patch: [corners[0], corners[1], corners[3], corners[2]],
            patchSize: 2,
            neighbors: [],
          };
          for (const corner of latticeCorners) {
            const key = corner.join(",");
            if (!vertexOwners.has(key)) vertexOwners.set(key, []);
            vertexOwners.get(key).push(id);
          }
        }
      }
    }
  }
  if (cells.includes(undefined))
    throw new Error("Surface direction atlas contains a missing tile");
  const adjacency = cells.map(() => new Set());
  for (const owners of vertexOwners.values()) {
    for (const id of owners) {
      for (const neighbor of owners) {
        if (neighbor !== id) adjacency[id].add(neighbor);
      }
    }
  }
  let maxDegree = 0;
  for (const cell of cells) {
    cell.neighbors = [...adjacency[cell.id]].sort((a, b) => a - b);
    maxDegree = Math.max(maxDegree, cell.neighbors.length);
  }
  return deepFreeze({
    kind: "surface",
    resolution,
    width: n,
    height: 6 * n,
    cellCount: cells.length,
    shape,
    seed,
    irregularity,
    radius,
    surfaceArea: cells.length,
    patchSize: 2,
    maxDegree,
    viewDirection,
    cells,
  });
}

// 上方切削只占 +Z 半区，下方只占 -Z 半区；中央完整十字墙始终保留。
// 每个半区可从 X 两端切入，但不能越过中央墙，因此所有轴射线仍是非空单区间。
function createVerticalBounds(n, irregularity, shape, random) {
  const floors = new Uint8Array(n * n);
  const ceilings = new Uint8Array(n * n).fill(n);
  const result = { floors, ceilings };
  if (shape === "cube" || irregularity === 0) return result;
  const middle = Math.floor((n - 1) / 2);
  const positiveCapacity = n - middle - 1;
  const primaryDepth = Math.max(1, Math.round(irregularity * (n - 1)));
  const addRegion = (corner, depth, relief) => {
    const widthCapacity = corner[0] > 0 ? positiveCapacity : middle;
    const lengthCapacity = corner[2] > 0 ? positiveCapacity : middle;
    const cuts = createCornerCuts(
      depth,
      relief,
      shape,
      random,
      widthCapacity,
      lengthCapacity,
    );
    for (const cut of cuts) {
      for (let dz = 0; dz < cut.length; dz += 1) {
        for (let dx = 0; dx < cut.width; dx += 1) {
          const x = corner[0] > 0 ? n - 1 - dx : dx;
          const z = corner[2] > 0 ? n - 1 - dz : dz;
          const column = x + n * z;
          if (corner[1] > 0) {
            ceilings[column] -= cut.depth;
          } else {
            floors[column] += cut.depth;
          }
        }
      }
    }
  };
  addRegion([1, 1, 1], primaryDepth, irregularity);
  addRegion([-1, -1, -1], primaryDepth, irregularity);
  // 高强度末段再加入浅次角；主角最深 n-1 格，任何竖直列都至少保留一格实体。
  if (irregularity >= 0.85) {
    const progress = Math.min(1, (irregularity - 0.85) / 0.15);
    const secondaryDepth = Math.min(
      primaryDepth - 1,
      1 + Math.floor(progress * 2 + 1e-9),
    );
    addRegion([-1, 1, 1], secondaryDepth, progress);
    addRegion([1, -1, -1], secondaryDepth, progress);
  }
  return result;
}

// 深度只由强度决定；种子独立改变各角的脚印和台阶，避免 100% 随机达不到最大深度。
function createCornerCuts(
  depth,
  irregularity,
  shape,
  random,
  widthCapacity,
  lengthCapacity,
) {
  const capacity = Math.min(widthCapacity, lengthCapacity);
  const levels =
    shape === "stepped"
      ? Math.min(depth, capacity, random() < 0.6 ? 1 : 2)
      : Math.min(depth, capacity);
  const footprintSize = (capacity) =>
    Math.min(
      capacity,
      Math.max(
        capacity >= 2 && irregularity >= 0.25 ? 2 : 1,
        Math.round(
          capacity * (0.55 + irregularity * 0.4) +
            (random() - 0.5) * Math.min(2, capacity * 0.4),
        ),
      ),
    );
  const width = footprintSize(widthCapacity);
  const length = footprintSize(lengthCapacity);
  const cuts = [];
  for (let level = 0; level < levels; level += 1) {
    cuts.push({
      width: width - Math.floor((level * width) / levels),
      length: length - Math.floor((level * length) / levels),
      depth: Math.floor(depth / levels) + (level < depth % levels ? 1 : 0),
    });
  }
  return cuts;
}

// Each direction uses the previous cube atlas projection; increasing u×v points out of the solid.
function faceSquare(face, x, y, z, n) {
  switch (face) {
    case 0:
      return {
        u: n - 1 - z,
        v: y,
        corners: [
          [x + 1, y, z + 1],
          [x + 1, y, z],
          [x + 1, y + 1, z],
          [x + 1, y + 1, z + 1],
        ],
      };
    case 1:
      return {
        u: z,
        v: y,
        corners: [
          [x, y, z],
          [x, y, z + 1],
          [x, y + 1, z + 1],
          [x, y + 1, z],
        ],
      };
    case 2:
      return {
        u: x,
        v: n - 1 - z,
        corners: [
          [x, y + 1, z + 1],
          [x + 1, y + 1, z + 1],
          [x + 1, y + 1, z],
          [x, y + 1, z],
        ],
      };
    case 3:
      return {
        u: x,
        v: z,
        corners: [
          [x, y, z],
          [x + 1, y, z],
          [x + 1, y, z + 1],
          [x, y, z + 1],
        ],
      };
    case 4:
      return {
        u: x,
        v: y,
        corners: [
          [x, y, z + 1],
          [x + 1, y, z + 1],
          [x + 1, y + 1, z + 1],
          [x, y + 1, z + 1],
        ],
      };
    default:
      return {
        u: n - 1 - x,
        v: y,
        corners: [
          [x + 1, y, z],
          [x, y, z],
          [x, y + 1, z],
          [x + 1, y + 1, z],
        ],
      };
  }
}

function seededRandom(seed) {
  let state = (seed ^ Math.floor(seed / 4294967296) ^ 0x9e3779b9) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

const DIRECTIONS = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
];
// Rotate around the vertical axis only so every generated staircase remains upright.
const ROTATIONS = [
  { axes: [0, 1, 2], signs: [1, 1, 1] },
  { axes: [2, 1, 0], signs: [1, 1, -1] },
  { axes: [0, 1, 2], signs: [-1, 1, -1] },
  { axes: [2, 1, 0], signs: [-1, 1, 1] },
];
