/**
 * VictoryFireworks launches a short celebration above the survey perimeter.
 * A fixed particle pool shares two draw calls: soft points and fading streaks.
 */
export class VictoryFireworks {
  /**
   * @param {object} THREE The application's Three.js module.
   * @param {object} scene Parent scene or group; its camera is never changed.
   * @param {object} options Motion preference and synchronized sound callbacks.
   * @returns {VictoryFireworks} A reusable, explicitly updated effect controller.
   */
  constructor(
    THREE,
    scene,
    {
      reducedMotion = () => false,
      onLaunch = () => {},
      onBurst = () => {},
    } = {},
  ) {
    this.reducedMotion = reducedMotion;
    this.onLaunch = onLaunch;
    this.onBurst = onBurst;
    this.active = false;
    this.activeCount = 0;
    this.launchCount = 0;
    this.burstCount = 0;
    this.disposed = false;
    this.elapsed = 0;
    this.nextLaunch = 0;
    this.nextParticle = 0;
    this.duration = 5.4;
    this.root = new THREE.Group();
    this.root.name = "victory-fireworks";
    scene.add(this.root);

    this.palette = [
      new THREE.Color("#66eaff").multiplyScalar(1.65),
      new THREE.Color("#ffd782").multiplyScalar(1.8),
      new THREE.Color("#b692ff").multiplyScalar(1.75),
    ];
    this.gold = this.palette[1];
    this.particles = Array.from({ length: POOL_SIZE }, () => ({
      life: 0,
      age: 0,
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      gravity: 0,
      drag: 0,
      red: 0,
      green: 0,
      blue: 0,
      size: 0,
      kind: 0,
      twinkle: 0,
    }));
    this.rockets = Array.from({ length: LAUNCH_TIMES.length }, () => ({
      active: false,
      core: null,
      age: 0,
      trailClock: 0,
      originX: 0,
      originZ: 0,
      targetX: 0,
      targetY: 0,
      targetZ: 0,
      flight: 0,
      radius: 0,
      colorIndex: 0,
      pan: 0,
      finale: false,
    }));

    this.positions = new Float32Array(POOL_SIZE * 3);
    this.colors = new Float32Array(POOL_SIZE * 3);
    this.opacities = new Float32Array(POOL_SIZE);
    this.sizes = new Float32Array(POOL_SIZE);
    const geometry = new THREE.BufferGeometry();
    for (const [name, array, itemSize] of [
      ["position", this.positions, 3],
      ["color", this.colors, 3],
      ["particleOpacity", this.opacities, 1],
      ["particleSize", this.sizes, 1],
    ]) {
      geometry.setAttribute(
        name,
        new THREE.BufferAttribute(array, itemSize).setUsage(
          THREE.DynamicDrawUsage,
        ),
      );
    }
    geometry.setDrawRange(0, 0);
    this.points = new THREE.Points(
      geometry,
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: true,
        toneMapped: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          pixelRatio: {
            value: Math.min(2, globalThis.devicePixelRatio || 1),
          },
        },
        vertexShader: PARTICLE_VERTEX,
        fragmentShader: PARTICLE_FRAGMENT,
      }),
    );
    this.points.name = "victory-firework-particles";
    this.points.frustumCulled = false;
    this.points.visible = false;
    this.root.add(this.points);

    this.trailPositions = new Float32Array(POOL_SIZE * 6);
    this.trailColors = new Float32Array(POOL_SIZE * 8);
    const trailGeometry = new THREE.BufferGeometry();
    trailGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.trailPositions, 3).setUsage(
        THREE.DynamicDrawUsage,
      ),
    );
    trailGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(this.trailColors, 4).setUsage(
        THREE.DynamicDrawUsage,
      ),
    );
    trailGeometry.setDrawRange(0, 0);
    this.trails = new THREE.LineSegments(
      trailGeometry,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        toneMapped: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    this.trails.name = "victory-firework-streaks";
    this.trails.frustumCulled = false;
    this.trails.visible = false;
    this.root.add(this.trails);
  }

  /**
   * Start nine rockets, replacing any previous celebration.
   * @param {object} dimensions Board dimensions in cells, normally 9×9 to 50×30.
   * @returns {void} Reduced motion and disposed controllers remain inactive.
   */
  start({ width = 9, height = 9 } = {}) {
    if (this.disposed) return;
    this.clear();
    if (this.reducedMotion()) return;
    const boardWidth = Number.isFinite(width)
      ? Math.max(5, Math.min(50, width))
      : 9;
    const boardHeight = Number.isFinite(height)
      ? Math.max(5, Math.min(30, height))
      : 9;
    const halfWidth = ((boardWidth - 1) * 1.06) / 2;
    const halfDepth = ((boardHeight - 1) * 1.06) / 2;
    const scale = Math.max(
      0.8,
      Math.min(2.25, Math.min(boardWidth, boardHeight) / 9),
    );

    for (let index = 0; index < this.rockets.length; index += 1) {
      const rocket = this.rockets[index];
      const [side, depth, lift] = LAUNCH_POSITIONS[index];
      rocket.originX = side * halfWidth * 0.91;
      rocket.originZ = depth * halfDepth * 0.83;
      // The inward arc keeps each blossom inside the board's usual camera margins.
      rocket.targetX = side * halfWidth * 0.67;
      rocket.targetZ = depth * halfDepth * 0.6;
      rocket.targetY = (2.9 + lift * 0.85) * scale;
      rocket.flight = 0.68 + lift * 0.12;
      rocket.radius = (1.4 + lift * 0.28) * scale;
      rocket.colorIndex = index % this.palette.length;
      rocket.pan = Math.max(-1, Math.min(1, side * 0.8));
      rocket.finale = index >= 6;
    }
    this.active = true;
    this.launch(this.rockets[this.nextLaunch++]);
    this.syncBuffers();
  }

  /**
   * Advance only while the host scene is visible.
   * @param {number} delta Seconds since the previous visible frame.
   * @returns {void} Pauses catch-up beyond 80 ms so stalls cannot bunch the show.
   */
  update(delta) {
    if (this.disposed || !this.active) return;
    if (this.reducedMotion()) {
      this.clear();
      return;
    }
    if (!Number.isFinite(delta) || delta <= 0) return;
    const step = Math.min(delta, 0.08);
    this.elapsed += step;
    for (const particle of this.particles) {
      if (particle.life <= 0 || particle.kind === 2) continue;
      particle.age += step;
      if (particle.age >= particle.life) {
        particle.life = 0;
        continue;
      }
      const drag = Math.exp(-particle.drag * step);
      particle.vx *= drag;
      particle.vz *= drag;
      particle.vy = particle.vy * drag - particle.gravity * step;
      particle.x += particle.vx * step;
      particle.y += particle.vy * step;
      particle.z += particle.vz * step;
    }
    for (const rocket of this.rockets) {
      if (!rocket.active) continue;
      rocket.age += step;
      const progress = Math.min(1, rocket.age / rocket.flight);
      const core = rocket.core;
      const lift = Math.sin((progress * Math.PI) / 2);
      core.x = rocket.originX + (rocket.targetX - rocket.originX) * progress;
      core.y = 0.48 + (rocket.targetY - 0.48) * lift;
      core.z = rocket.originZ + (rocket.targetZ - rocket.originZ) * progress;
      core.vx = (rocket.targetX - rocket.originX) / rocket.flight;
      core.vy =
        ((rocket.targetY - 0.48) *
          Math.PI *
          Math.cos((progress * Math.PI) / 2)) /
        (2 * rocket.flight);
      core.vz = (rocket.targetZ - rocket.originZ) / rocket.flight;
      rocket.trailClock += step;
      // Bounded emission produces the same gold ascent at both 30 and 60 fps.
      const trailCount = Math.min(4, Math.floor(rocket.trailClock / 0.022));
      rocket.trailClock %= 0.022;
      for (let index = 0; index < trailCount; index += 1) {
        const ember = this.allocate();
        if (!ember) break;
        this.paint(ember, this.gold, 2.1 + Math.random() * 1.3);
        const behind = Math.random() * step;
        ember.x = core.x - core.vx * behind;
        ember.y = core.y - core.vy * behind;
        ember.z = core.z - core.vz * behind;
        ember.vx = (Math.random() - 0.5) * 0.22;
        ember.vy = -0.35 - Math.random() * 0.45;
        ember.vz = (Math.random() - 0.5) * 0.22;
        ember.gravity = 1.05;
        ember.drag = 0.45;
        ember.life = 0.22 + Math.random() * 0.2;
      }
      if (progress === 1) this.burst(rocket);
    }
    // Even after a long frame, only one pending launch may begin per update.
    if (
      this.nextLaunch < this.rockets.length &&
      this.elapsed >= LAUNCH_TIMES[this.nextLaunch]
    ) {
      this.launch(this.rockets[this.nextLaunch++]);
    }
    this.syncBuffers();
    if (
      this.elapsed >= this.duration ||
      (this.nextLaunch === this.rockets.length && this.activeCount === 0)
    ) {
      this.finish();
    }
  }

  /**
   * Stop the celebration immediately and reset its public event counters.
   * @returns {void} Safe before start, between surveys, and after disposal.
   */
  clear() {
    this.finish();
    this.elapsed = 0;
    this.nextLaunch = 0;
    this.nextParticle = 0;
    this.launchCount = 0;
    this.burstCount = 0;
  }

  /**
   * Detach all resources and release both geometries and materials exactly once.
   * @returns {void} Subsequent lifecycle calls are harmless.
   */
  dispose() {
    if (this.disposed) return;
    this.clear();
    this.disposed = true;
    this.root.removeFromParent();
    this.points.geometry.dispose();
    this.points.material.dispose();
    this.trails.geometry.dispose();
    this.trails.material.dispose();
    this.root.clear();
    this.onLaunch = () => {};
    this.onBurst = () => {};
  }

  launch(rocket) {
    const core = this.allocate();
    if (!core) return;
    this.paint(core, this.gold, 6.5);
    core.kind = 2;
    core.life = 1;
    core.x = rocket.originX;
    core.y = 0.48;
    core.z = rocket.originZ;
    core.vy = 4;
    rocket.core = core;
    rocket.active = true;
    rocket.age = 0;
    rocket.trailClock = 0;
    this.launchCount += 1;
    this.onLaunch({ strength: rocket.finale ? 0.48 : 0.58, pan: rocket.pan });
  }

  burst(rocket) {
    rocket.active = false;
    rocket.core.life = 0;
    rocket.core = null;
    const count = rocket.finale ? 88 : 96;
    const color = this.palette[rocket.colorIndex];
    const rotation = Math.random() * Math.PI * 2;
    for (let index = 0; index < count; index += 1) {
      const spark = this.allocate();
      if (!spark) break;
      // A Fibonacci sphere spreads sparks evenly without a bright solid center.
      const vertical = 1 - (2 * (index + 0.5)) / count;
      const horizontal = Math.sqrt(1 - vertical * vertical);
      const angle = index * GOLDEN_ANGLE + rotation;
      const inner = index % 5 === 0;
      const speed = rocket.radius * (inner ? 1.2 : 2.05 + Math.random() * 0.3);
      this.paint(
        spark,
        index % 9 === 0 ? this.gold : color,
        inner ? 2.5 : 3.1 + Math.random() * 1.4,
      );
      spark.kind = 1;
      spark.x = rocket.targetX;
      spark.y = rocket.targetY;
      spark.z = rocket.targetZ;
      spark.vx = Math.cos(angle) * horizontal * speed;
      spark.vy = vertical * speed + rocket.radius * 0.28;
      spark.vz = Math.sin(angle) * horizontal * speed;
      spark.gravity = 1.05 * Math.sqrt(rocket.radius);
      spark.drag = 1.2;
      spark.life = 1.08 + Math.random() * 0.46;
      spark.twinkle = index % 7 === 0 ? 1 : 0;
    }
    this.burstCount += 1;
    this.onBurst({ strength: rocket.finale ? 0.7 : 0.86, pan: rocket.pan });
  }

  allocate() {
    for (let offset = 0; offset < POOL_SIZE; offset += 1) {
      const index = (this.nextParticle + offset) % POOL_SIZE;
      const particle = this.particles[index];
      if (particle.life > 0) continue;
      this.nextParticle = (index + 1) % POOL_SIZE;
      particle.age = 0;
      particle.vx = 0;
      particle.vy = 0;
      particle.vz = 0;
      particle.gravity = 0;
      particle.drag = 0;
      particle.kind = 0;
      particle.twinkle = 0;
      return particle;
    }
    return null;
  }

  paint(particle, color, size) {
    particle.red = color.r;
    particle.green = color.g;
    particle.blue = color.b;
    particle.size = size;
  }

  syncBuffers() {
    let count = 0;
    let trailCount = 0;
    for (const particle of this.particles) {
      if (particle.life <= 0) continue;
      const remaining = 1 - particle.age / particle.life;
      const fade = particle.kind === 2 ? 1 : Math.pow(remaining, 1.15);
      const twinkle = particle.twinkle
        ? 0.82 + 0.18 * Math.sin(particle.age * 26 + particle.x * 3)
        : 1;
      const opacity = fade * twinkle;
      const positionOffset = count * 3;
      this.positions[positionOffset] = particle.x;
      this.positions[positionOffset + 1] = particle.y;
      this.positions[positionOffset + 2] = particle.z;
      this.colors[positionOffset] = particle.red;
      this.colors[positionOffset + 1] = particle.green;
      this.colors[positionOffset + 2] = particle.blue;
      this.opacities[count] = opacity;
      this.sizes[count] = particle.size * (0.7 + remaining * 0.3);
      count += 1;

      const length = particle.kind === 2 ? 0.12 : 0.1 + remaining * 0.075;
      const offset = trailCount * 6;
      this.trailPositions[offset] = particle.x;
      this.trailPositions[offset + 1] = particle.y;
      this.trailPositions[offset + 2] = particle.z;
      this.trailPositions[offset + 3] = particle.x - particle.vx * length;
      this.trailPositions[offset + 4] = particle.y - particle.vy * length;
      this.trailPositions[offset + 5] = particle.z - particle.vz * length;
      const colorOffset = trailCount * 8;
      this.trailColors[colorOffset] = particle.red;
      this.trailColors[colorOffset + 1] = particle.green;
      this.trailColors[colorOffset + 2] = particle.blue;
      this.trailColors[colorOffset + 3] = opacity * 0.68;
      this.trailColors[colorOffset + 4] = particle.red;
      this.trailColors[colorOffset + 5] = particle.green;
      this.trailColors[colorOffset + 6] = particle.blue;
      this.trailColors[colorOffset + 7] = 0;
      trailCount += 1;
    }
    this.activeCount = count;
    this.points.visible = count > 0;
    this.trails.visible = trailCount > 0;
    this.points.geometry.setDrawRange(0, count);
    this.trails.geometry.setDrawRange(0, trailCount * 2);
    for (const attribute of Object.values(this.points.geometry.attributes)) {
      attribute.needsUpdate = true;
    }
    for (const attribute of Object.values(this.trails.geometry.attributes)) {
      attribute.needsUpdate = true;
    }
  }

  finish() {
    this.active = false;
    this.activeCount = 0;
    for (const particle of this.particles) particle.life = 0;
    for (const rocket of this.rockets) {
      rocket.active = false;
      rocket.core = null;
    }
    this.points.visible = false;
    this.trails.visible = false;
    this.points.geometry.setDrawRange(0, 0);
    this.trails.geometry.setDrawRange(0, 0);
  }
}

const POOL_SIZE = 960;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const LAUNCH_TIMES = [0, 0.4, 0.84, 1.29, 1.75, 2.19, 2.84, 2.94, 3.04];
// Side, depth, and height variation; the last three launches form a small volley.
const LAUNCH_POSITIONS = [
  [-1, 0.4, 0.5],
  [1, -0.28, 0.85],
  [-0.64, -1, 0.25],
  [0.75, 1, 0.65],
  [-1, -0.22, 1],
  [1, 0.65, 0.35],
  [-0.74, 0.8, 0.6],
  [0.04, -0.85, 0.95],
  [0.76, 0.42, 0.5],
];

const PARTICLE_VERTEX = /* glsl */ `
  attribute vec3 color;
  attribute float particleOpacity;
  attribute float particleSize;
  uniform float pixelRatio;
  varying vec3 sparkColor;
  varying float sparkOpacity;
  void main() {
    sparkColor = color;
    sparkOpacity = particleOpacity;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = particleSize * pixelRatio;
  }
`;

const PARTICLE_FRAGMENT = /* glsl */ `
  varying vec3 sparkColor;
  varying float sparkOpacity;
  void main() {
    float radius = length(gl_PointCoord - vec2(0.5)) * 2.0;
    float halo = 1.0 - smoothstep(0.12, 1.0, radius);
    float core = 1.0 - smoothstep(0.0, 0.38, radius);
    float alpha = (halo * 0.72 + core * 0.28) * sparkOpacity;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(sparkColor, alpha);
  }
`;
