/**
 * Create occasional silent meteors in a normalized plane or a fixed celestial frame.
 * @param {object} THREE The host application's Three.js module.
 * @param {object} options Optional randomness and a celestial camera/uniform bundle supplied by the sky renderer.
 * @returns {object} A group, visible-time update, idempotent disposal, and read-only diagnostics.
 */
export function createMeteorShower(
  THREE,
  { random = Math.random, celestial = null } = {},
) {
  if (typeof random !== "function")
    throw new TypeError("Random must be a function");
  const sample = () => {
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) {
      throw new RangeError("Random must return a finite number in [0, 1)");
    }
    return value;
  };
  const group = new THREE.Group();
  group.name = "meteor-shower";
  const slots = Array.from({ length: CAPACITY }, () => ({
    live: false,
    age: 0,
    life: 0,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    x: 0,
    y: 0,
    tailLength: 0,
    width: 0,
    size: 0,
    red: 0,
    green: 0,
    blue: 0,
    launchId: 0,
    launchRotation: new THREE.Quaternion(),
    skyAspect: 1,
    skyTanHalfFov: 1,
  }));
  const palette = [
    new THREE.Color("#b7deff").multiplyScalar(1.7),
    new THREE.Color("#ffe0ad").multiplyScalar(1.6),
  ];
  let disposed = false;
  let reduced = false;
  let activeCount = 0;
  let launched = 0;
  let completed = 0;
  let groups = 0;
  let pending = 0;
  let lane = 0;
  let wait = 2 + sample() * 2;
  const projectedDirection = new THREE.Vector3();

  const headPositions = new Float32Array(CAPACITY * 3);
  const headColors = new Float32Array(CAPACITY * 3);
  const headAlphas = new Float32Array(CAPACITY);
  const headSizes = new Float32Array(CAPACITY);
  const headGeometry = new THREE.BufferGeometry();
  const dynamicAttribute = (array, size) =>
    new THREE.BufferAttribute(array, size).setUsage(THREE.DynamicDrawUsage);
  headGeometry.setAttribute("position", dynamicAttribute(headPositions, 3));
  headGeometry.setAttribute("meteorColor", dynamicAttribute(headColors, 3));
  headGeometry.setAttribute("meteorAlpha", dynamicAttribute(headAlphas, 1));
  headGeometry.setAttribute("meteorSize", dynamicAttribute(headSizes, 1));
  headGeometry.setDrawRange(0, 0);
  const heads = new THREE.Points(
    headGeometry,
    new THREE.ShaderMaterial({
      transparent: true,
      depthTest: true,
      depthWrite: false,
      toneMapped: false,
      blending: THREE.AdditiveBlending,
      defines: celestial ? { CELESTIAL_SKY: 1 } : {},
      uniforms: {
        ...celestial?.uniforms,
        pixelRatio: { value: Math.min(2, globalThis.devicePixelRatio || 1) },
      },
      vertexShader: HEAD_VERTEX,
      fragmentShader: HEAD_FRAGMENT,
    }),
  );
  heads.name = "meteor-heads";
  heads.frustumCulled = false;
  heads.renderOrder = -996;
  heads.visible = false;
  group.add(heads);

  const tailPositions = new Float32Array(CAPACITY * 12);
  const tailColors = new Float32Array(CAPACITY * 12);
  const tailAlphas = new Float32Array(CAPACITY * 4);
  const tailUVs = new Float32Array(CAPACITY * 8);
  const tailIndices = [];
  for (let index = 0; index < CAPACITY; index += 1) {
    const vertex = index * 4;
    tailIndices.push(
      vertex,
      vertex + 1,
      vertex + 2,
      vertex + 2,
      vertex + 1,
      vertex + 3,
    );
    tailUVs.set([0, 0, 0, 1, 1, 0, 1, 1], index * 8);
  }
  const tailGeometry = new THREE.BufferGeometry();
  tailGeometry.setAttribute("position", dynamicAttribute(tailPositions, 3));
  tailGeometry.setAttribute("meteorColor", dynamicAttribute(tailColors, 3));
  tailGeometry.setAttribute("meteorAlpha", dynamicAttribute(tailAlphas, 1));
  tailGeometry.setAttribute("uv", new THREE.BufferAttribute(tailUVs, 2));
  tailGeometry.setIndex(tailIndices);
  tailGeometry.setDrawRange(0, 0);
  const tails = new THREE.Mesh(
    tailGeometry,
    new THREE.ShaderMaterial({
      transparent: true,
      depthTest: true,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      defines: celestial ? { CELESTIAL_SKY: 1 } : {},
      uniforms: { ...celestial?.uniforms },
      vertexShader: TAIL_VERTEX,
      fragmentShader: TAIL_FRAGMENT,
    }),
  );
  tails.name = "meteor-trails";
  tails.frustumCulled = false;
  tails.renderOrder = -996;
  tails.visible = false;
  group.add(tails);

  function launch() {
    const slot = slots.find((candidate) => !candidate.live);
    if (!slot) return;
    const jitter = sample();
    if (lane === 0) {
      slot.startX = -0.88 + sample() * 0.26;
      slot.startY = 0.86 + jitter * 0.08;
      slot.endX = 0.1 + sample() * 0.34;
      slot.endY = 0.64 + sample() * 0.12;
    } else {
      const side = lane === 1 ? -1 : 1;
      slot.startX = side * (0.9 + jitter * 0.04);
      slot.startY = 0.62 + sample() * 0.16;
      slot.endX = side * (0.73 + sample() * 0.1);
      slot.endY = -0.06 - sample() * 0.26;
    }
    const color = palette[sample() < 0.72 ? 0 : 1];
    slot.live = true;
    slot.age = 0;
    slot.life = 0.72 + sample() * 0.36;
    slot.x = slot.startX;
    slot.y = slot.startY;
    slot.tailLength = 0.19 + sample() * 0.12;
    slot.width = 0.0036 + sample() * 0.0018;
    slot.size = 8.5 + sample() * 2;
    slot.red = color.r;
    slot.green = color.g;
    slot.blue = color.b;
    launched += 1;
    slot.launchId = launched;
    if (celestial) {
      // Freeze this flight's launch frame; user orbit changes its projection, never its world path.
      slot.launchRotation.copy(celestial.cameraQuaternion);
      slot.skyAspect = celestial.uniforms.uSkyAspect.value;
      slot.skyTanHalfFov = celestial.uniforms.uSkyTanHalfFov.value;
    }
  }

  function writePosition(slot, x, y, array, offset) {
    if (!celestial) {
      array.set([x, y, 0.02], offset);
      return;
    }
    projectedDirection
      .set(x * slot.skyAspect * slot.skyTanHalfFov, y * slot.skyTanHalfFov, -1)
      .normalize()
      .applyQuaternion(slot.launchRotation)
      .toArray(array, offset);
  }

  function directionSnapshot(slot, x, y) {
    if (!celestial) return null;
    return Object.freeze(
      projectedDirection
        .set(
          x * slot.skyAspect * slot.skyTanHalfFov,
          y * slot.skyTanHalfFov,
          -1,
        )
        .normalize()
        .applyQuaternion(slot.launchRotation)
        .toArray(),
    );
  }

  function clearActive() {
    for (const slot of slots) slot.live = false;
    activeCount = 0;
    pending = 0;
    heads.visible = false;
    tails.visible = false;
    headGeometry.setDrawRange(0, 0);
    tailGeometry.setDrawRange(0, 0);
  }

  function syncBuffers() {
    let count = 0;
    for (const slot of slots) {
      if (!slot.live) continue;
      const progress = slot.age / slot.life;
      const opacity =
        Math.min(1, slot.age / 0.075) * Math.min(1, (1 - progress) / 0.24);
      const deltaX = slot.endX - slot.startX;
      const deltaY = slot.endY - slot.startY;
      const distance = Math.hypot(deltaX, deltaY);
      const directionX = deltaX / distance;
      const directionY = deltaY / distance;
      const length = Math.min(slot.tailLength, distance * progress + 0.025);
      const widthX = -directionY * slot.width;
      const widthY = directionX * slot.width;
      writePosition(slot, slot.x, slot.y, headPositions, count * 3);
      headColors.set([slot.red, slot.green, slot.blue], count * 3);
      headAlphas[count] = opacity;
      headSizes[count] = slot.size;
      tailPositions.set(
        [
          slot.x - widthX,
          slot.y - widthY,
          0.02,
          slot.x + widthX,
          slot.y + widthY,
          0.02,
          slot.x - directionX * length - widthX * 0.22,
          slot.y - directionY * length - widthY * 0.22,
          0.02,
          slot.x - directionX * length + widthX * 0.22,
          slot.y - directionY * length + widthY * 0.22,
          0.02,
        ],
        count * 12,
      );
      if (celestial) {
        writePosition(
          slot,
          slot.x - widthX,
          slot.y - widthY,
          tailPositions,
          count * 12,
        );
        writePosition(
          slot,
          slot.x + widthX,
          slot.y + widthY,
          tailPositions,
          count * 12 + 3,
        );
        writePosition(
          slot,
          slot.x - directionX * length - widthX * 0.22,
          slot.y - directionY * length - widthY * 0.22,
          tailPositions,
          count * 12 + 6,
        );
        writePosition(
          slot,
          slot.x - directionX * length + widthX * 0.22,
          slot.y - directionY * length + widthY * 0.22,
          tailPositions,
          count * 12 + 9,
        );
      }
      for (let corner = 0; corner < 4; corner += 1) {
        tailColors.set(
          [slot.red, slot.green, slot.blue],
          count * 12 + corner * 3,
        );
        tailAlphas[count * 4 + corner] = opacity;
      }
      count += 1;
    }
    activeCount = count;
    heads.visible = tails.visible = count > 0;
    headGeometry.setDrawRange(0, count);
    tailGeometry.setDrawRange(0, count * 6);
    for (const attribute of Object.values(headGeometry.attributes))
      attribute.needsUpdate = true;
    for (const name of ["position", "meteorColor", "meteorAlpha"])
      tailGeometry.attributes[name].needsUpdate = true;
  }

  /** Advance visible seconds; a stalled frame may start only one meteor, never replay missed groups. */
  function update(delta, reducedMotion = false) {
    if (disposed) return;
    if (reducedMotion) {
      reduced = true;
      clearActive();
      return;
    }
    if (reduced) {
      reduced = false;
      wait = 2 + sample() * 2;
      return;
    }
    if (!Number.isFinite(delta) || delta <= 0) return;
    for (const slot of slots) {
      if (!slot.live) continue;
      slot.age += delta;
      if (slot.age >= slot.life) {
        slot.live = false;
        completed += 1;
        continue;
      }
      const progress = slot.age / slot.life;
      slot.x = slot.startX + (slot.endX - slot.startX) * progress;
      slot.y = slot.startY + (slot.endY - slot.startY) * progress;
    }
    wait -= delta;
    if (wait <= 0) {
      if (pending === 0) {
        groups += 1;
        pending = 1 + Math.floor(sample() * CAPACITY);
        const region = sample();
        lane = region < 0.55 ? 0 : region < 0.775 ? 1 : 2;
      }
      launch();
      pending -= 1;
      // Reset from this frame rather than retaining a negative deadline from a long suspension.
      wait = pending > 0 ? 0.12 + sample() * 0.16 : 6 + sample() * 6;
    }
    syncBuffers();
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    clearActive();
    group.removeFromParent();
    headGeometry.dispose();
    heads.material.dispose();
    tailGeometry.dispose();
    tails.material.dispose();
    group.clear();
  }

  return Object.freeze({
    group,
    update,
    dispose,
    capacity: CAPACITY,
    get activeCount() {
      return activeCount;
    },
    get launched() {
      return launched;
    },
    get launchCount() {
      return launched;
    },
    get completedCount() {
      return completed;
    },
    get groupCount() {
      return groups;
    },
    get nextIn() {
      return disposed || reduced ? null : wait;
    },
    get activeMeteors() {
      return Object.freeze(
        slots
          .filter((slot) => slot.live)
          .map((slot) =>
            Object.freeze({
              x: slot.x,
              y: slot.y,
              progress: slot.age / slot.life,
              life: slot.life,
              launchId: slot.launchId,
              direction: directionSnapshot(slot, slot.x, slot.y),
              startDirection: directionSnapshot(slot, slot.startX, slot.startY),
              endDirection: directionSnapshot(slot, slot.endX, slot.endY),
            }),
          ),
      );
    },
  });
}

const CAPACITY = 3;
const HEAD_VERTEX = /* glsl */ `
  attribute vec3 meteorColor;
  attribute float meteorAlpha;
  attribute float meteorSize;
  uniform float pixelRatio;
  #ifdef CELESTIAL_SKY
    uniform mat4 uSkyView;
    uniform mat4 uSkyProjection;
  #endif
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = meteorColor;
    vAlpha = meteorAlpha;
    #ifdef CELESTIAL_SKY
      gl_Position = uSkyProjection * uSkyView * modelMatrix * vec4(position, 1.0);
    #else
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    #endif
    gl_Position.z = gl_Position.w * 0.99990;
    gl_PointSize = meteorSize * pixelRatio;
  }
`;
const HEAD_FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float radius = length(gl_PointCoord - 0.5) * 2.0;
    float core = 1.0 - smoothstep(0.0, 0.32, radius);
    float halo = pow(max(0.0, 1.0 - radius), 2.5);
    float alpha = (core * 0.8 + halo * 0.38) * vAlpha;
    if (alpha < 0.005) discard;
    gl_FragColor = vec4(mix(vColor, vec3(2.0), core * 0.7), alpha);
  }
`;
const TAIL_VERTEX = /* glsl */ `
  attribute vec3 meteorColor;
  attribute float meteorAlpha;
  varying vec3 vColor;
  varying float vAlpha;
  varying vec2 vUv;
  #ifdef CELESTIAL_SKY
    uniform mat4 uSkyView;
    uniform mat4 uSkyProjection;
  #endif
  void main() {
    vColor = meteorColor;
    vAlpha = meteorAlpha;
    vUv = uv;
    #ifdef CELESTIAL_SKY
      gl_Position = uSkyProjection * uSkyView * modelMatrix * vec4(position, 1.0);
    #else
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    #endif
    gl_Position.z = gl_Position.w * 0.99990;
  }
`;
const TAIL_FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  varying vec2 vUv;
  void main() {
    float across = 1.0 - smoothstep(0.0, 0.5, abs(vUv.y - 0.5));
    float along = pow(1.0 - vUv.x, 1.7);
    float alpha = across * along * vAlpha * 0.85;
    if (alpha < 0.005) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;
