// FlameJets 用固定实例池生成竖直喷焰、偏斜火舌与短烟尾，不加载外部素材。
// 参数：THREE 为宿主 Three.js 模块，parent 为挂载节点；activeCount 包含仍在消散的烟尾。
export class FlameJets {
  constructor(THREE, parent) {
    this.THREE = THREE;
    this.group = new THREE.Group();
    this.group.name = "mine_flame_jets";
    parent.add(this.group);
    this.capacity = 24;
    this.slots = Array.from({ length: this.capacity }, () => ({
      active: false,
      age: 0,
      seed: 0,
    }));
    this.activeCount = 0;
    this.disposed = false;
    this.serial = 0;
    this.matrix = new THREE.Matrix4();

    // 每个爆点三条火舌加一个地面火圈；两种造型共用同一材质和一次绘制。
    const fireGeometry = new THREE.PlaneGeometry(1, 1, 4, 12);
    fireGeometry.translate(0, 0.5, 0);
    this.fireParameters = new THREE.InstancedBufferAttribute(
      new Float32Array(this.capacity * 4 * 4),
      4,
    ).setUsage(THREE.DynamicDrawUsage);
    this.fireDirections = new THREE.InstancedBufferAttribute(
      new Float32Array(this.capacity * 4 * 3),
      3,
    );
    fireGeometry.setAttribute("jetParameters", this.fireParameters);
    fireGeometry.setAttribute("jetDirection", this.fireDirections);
    this.fireMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      toneMapped: false,
      vertexShader: FIRE_VERTEX,
      fragmentShader: FIRE_FRAGMENT,
    });
    this.fire = new THREE.InstancedMesh(
      fireGeometry,
      this.fireMaterial,
      this.capacity * 4,
    );
    this.fire.name = "three_flame_tongues_and_ground_flare";
    this.fire.frustumCulled = false;
    this.fire.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.group.add(this.fire);

    // 每处最多四片烟，最后一片在触发后 0.98 秒内消失。
    const smokeGeometry = new THREE.PlaneGeometry(1, 1);
    this.smokeParameters = new THREE.InstancedBufferAttribute(
      new Float32Array(this.capacity * 4 * 4),
      4,
    ).setUsage(THREE.DynamicDrawUsage);
    smokeGeometry.setAttribute("smokeParameters", this.smokeParameters);
    this.smokeMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
      vertexShader: SMOKE_VERTEX,
      fragmentShader: SMOKE_FRAGMENT,
    });
    this.smoke = new THREE.InstancedMesh(
      smokeGeometry,
      this.smokeMaterial,
      this.capacity * 4,
    );
    this.smoke.name = "short_bounded_smoke_tails";
    this.smoke.frustumCulled = false;
    this.smoke.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.group.add(this.smoke);
    this.clear();
  }

  // trigger 在指定三维坐标触发一次喷射；池满时替换最早的烟尾，不增加对象数量。
  trigger({ x, y = 0.48, z }) {
    if (this.disposed) return;
    if (![x, y, z].every(Number.isFinite))
      throw new TypeError("Flame coordinates must be finite");
    let index = this.slots.findIndex((slot) => !slot.active);
    if (index < 0) {
      index = this.slots.reduce(
        (oldest, slot, i) => (slot.age > this.slots[oldest].age ? i : oldest),
        0,
      );
    }
    const slot = this.slots[index];
    if (!slot.active) this.activeCount++;
    slot.active = true;
    slot.age = 0;
    slot.seed = (++this.serial * 1.6180339) % 17;
    const angle = slot.seed * 2.39996;
    for (let tongue = 0; tongue < 4; tongue++) {
      const instance = index * 4 + tongue;
      const central = tongue === 0;
      const ground = tongue === 3;
      const sideAngle = angle + (tongue === 1 ? 0 : Math.PI + 0.55);
      const height = central
        ? 1.9 + Math.sin(slot.seed) * 0.18
        : 1.2 + tongue * 0.09;
      const width = central ? 0.64 : 0.43;
      this.fireParameters.setXYZW(
        instance,
        0,
        ground ? -1 : height,
        ground ? 0.92 : width,
        slot.seed + tongue * 3.7,
      );
      this.fireDirections.setXYZ(
        instance,
        central || ground ? 0 : Math.cos(sideAngle) * 0.54,
        0,
        central || ground ? 0 : Math.sin(sideAngle) * 0.54,
      );
      this.matrix.makeTranslation(x, y + (ground ? -0.1 : 0), z);
      this.fire.setMatrixAt(instance, this.matrix);
      this.matrix.makeTranslation(x, y + 0.1, z);
      this.smoke.setMatrixAt(instance, this.matrix);
      this.smokeParameters.setXYZW(
        instance,
        0,
        tongue * 0.07 + 0.08,
        slot.seed + tongue * 5.3,
        0.56 + tongue * 0.045,
      );
    }
    this.fireDirections.needsUpdate = true;
    this.fireParameters.needsUpdate = true;
    this.smokeParameters.needsUpdate = true;
    this.fire.instanceMatrix.needsUpdate = true;
    this.smoke.instanceMatrix.needsUpdate = true;
    this.group.visible = true;
  }

  // update 参数 delta 为秒；火焰在 0.74 秒内熄灭，烟尾最多持续到 0.98 秒。
  update(delta) {
    if (this.disposed || !this.activeCount) return;
    const step = Number.isFinite(delta) ? Math.max(0, delta) : 0;
    for (let index = 0; index < this.capacity; index++) {
      const slot = this.slots[index];
      if (!slot.active) continue;
      slot.age += step;
      if (slot.age >= 0.98) {
        slot.active = false;
        this.activeCount--;
      }
      for (let part = 0; part < 4; part++) {
        const instance = index * 4 + part;
        this.fireParameters.setX(instance, slot.active ? slot.age : -1);
        this.smokeParameters.setX(instance, slot.active ? slot.age : -1);
      }
    }
    this.fireParameters.needsUpdate = true;
    this.smokeParameters.needsUpdate = true;
    this.group.visible = this.activeCount > 0;
  }

  // clear 立即清除喷焰和烟尾，保留实例池以便下一局复用。
  clear() {
    if (this.disposed) return;
    for (let index = 0; index < this.capacity; index++) {
      this.slots[index].active = false;
      for (let part = 0; part < 4; part++) {
        this.fireParameters.setX(index * 4 + part, -1);
        this.smokeParameters.setX(index * 4 + part, -1);
      }
    }
    this.activeCount = 0;
    this.fireParameters.needsUpdate = true;
    this.smokeParameters.needsUpdate = true;
    this.group.visible = false;
  }

  // dispose 回收实例缓冲、几何及材质；可以重复调用。
  dispose() {
    if (this.disposed) return;
    this.clear();
    this.disposed = true;
    for (const mesh of [this.fire, this.smoke]) {
      mesh.dispose();
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
    this.group.removeFromParent();
    this.group.clear();
  }
}

const NOISE = `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float turbulence(vec2 p) { return noise(p) * 0.59 + noise(p * 2.07 + 7.3) * 0.28 + noise(p * 4.13) * 0.13; }
`;

const FIRE_VERTEX = `
  attribute vec4 jetParameters;
  attribute vec3 jetDirection;
  varying vec2 vUv;
  varying float vAge;
  varying float vSeed;
  varying float vGround;
  void main() {
    vUv = uv;
    vAge = jetParameters.x;
    vSeed = jetParameters.w;
    vGround = jetParameters.y < 0.0 ? 1.0 : 0.0;
    if (vAge < 0.0 || vAge > 0.74) { gl_Position = vec4(2, 2, 2, 1); return; }
    vec3 origin = (modelMatrix * instanceMatrix * vec4(0, 0, 0, 1)).xyz;
    vec3 right = normalize(vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]));
    vec3 world;
    if (vGround > 0.5) {
      float radius = jetParameters.z * (0.3 + min(vAge / 0.36, 1.0) * 0.75);
      world = origin + vec3(position.x * radius, 0.012, (position.y - 0.5) * radius);
    } else {
      float rise = 0.65 + 0.35 * smoothstep(0.0, 0.15, vAge);
      float lift = max(0.0, vAge - 0.24) * 0.42;
      float bend = sin(uv.y * 5.7 - vAge * 16.0 + vSeed) * 0.065 * uv.y;
      world = origin + vec3(0, uv.y * jetParameters.y * rise + lift, 0);
      world += right * (position.x * jetParameters.z + bend);
      world += jetDirection * uv.y * uv.y;
    }
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const FIRE_FRAGMENT = `
  varying vec2 vUv;
  varying float vAge;
  varying float vSeed;
  varying float vGround;
  ${NOISE}
  void main() {
    if (vAge < 0.0 || vAge > 0.74) discard;
    float ageFade = smoothstep(-0.025, 0.035, vAge) * (1.0 - smoothstep(0.28, 0.74, vAge));
    float grain = turbulence(vec2(vUv.x * 6.0 + vSeed, vUv.y * 5.4 - vAge * 8.5));
    float density;
    float core;
    if (vGround > 0.5) {
      vec2 p = (vUv - 0.5) * 2.0;
      float radius = length(p);
      float rim = 1.0 - smoothstep(0.065, 0.2, abs(radius - 0.57 - (grain - 0.5) * 0.2));
      density = rim * (1.0 - smoothstep(0.32, 0.61, vAge));
      core = 0.0;
    } else {
      float level = vUv.y;
      float center = (vUv.x - 0.5) * 2.0;
      float outline = pow(max(0.0, sin(level * 3.14159)), 0.72) * (0.72 - level * 0.29);
      outline += 0.08 * (1.0 - level);
      float torn = outline - abs(center + (grain - 0.5) * (0.25 + level * 0.38));
      density = smoothstep(-0.04, 0.115, torn) * smoothstep(0.0, 0.07, level);
      density *= 1.0 - smoothstep(0.78 + (grain - 0.5) * 0.29, 1.0, level);
      density *= 0.65 + grain * 0.35;
      core = (1.0 - smoothstep(0.035, 0.16, abs(center))) * (1.0 - smoothstep(0.1, 0.44, level));
      core *= smoothstep(0.04, 0.14, level);
    }
    float alpha = density * ageFade;
    if (alpha < 0.015) discard;
    vec3 outer = mix(vec3(0.72, 0.025, 0.001), vec3(1.28, 0.19, 0.007), grain);
    vec3 color = mix(outer, vec3(1.55, 0.82, 0.065), core * 0.85);
    gl_FragColor = vec4(color, alpha * (vGround > 0.5 ? 0.72 : 0.87));
    #include <colorspace_fragment>
  }
`;

const SMOKE_VERTEX = `
  attribute vec4 smokeParameters;
  varying vec2 vUv;
  varying float vProgress;
  varying float vSeed;
  void main() {
    vUv = uv;
    vSeed = smokeParameters.z;
    vProgress = (smokeParameters.x - smokeParameters.y) / smokeParameters.w;
    if (smokeParameters.x < 0.0 || vProgress < 0.0 || vProgress > 1.0) { gl_Position = vec4(2, 2, 2, 1); return; }
    vec3 origin = (modelMatrix * instanceMatrix * vec4(0, 0, 0, 1)).xyz;
    vec3 right = normalize(vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]));
    vec3 up = normalize(vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]));
    float size = 0.26 + vProgress * 0.63;
    vec3 drift = vec3(sin(vSeed) * 0.18, 0.52 + vProgress * 1.18, cos(vSeed) * 0.18);
    vec3 world = origin + drift + (right * position.x + up * position.y) * size;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`;

const SMOKE_FRAGMENT = `
  varying vec2 vUv;
  varying float vProgress;
  varying float vSeed;
  ${NOISE}
  void main() {
    if (vProgress < 0.0 || vProgress > 1.0) discard;
    vec2 p = (vUv - 0.5) * 2.0;
    float grain = turbulence(p * 3.0 + vec2(vSeed, -vProgress * 1.7));
    float alpha = (1.0 - smoothstep(0.25, 1.0, length(p) + (grain - 0.5) * 0.35));
    alpha *= smoothstep(0.0, 0.15, vProgress) * (1.0 - smoothstep(0.35, 1.0, vProgress)) * 0.24;
    if (alpha < 0.008) discard;
    gl_FragColor = vec4(mix(vec3(0.025, 0.02, 0.018), vec3(0.085, 0.065, 0.05), grain), alpha);
    #include <colorspace_fragment>
  }
`;
