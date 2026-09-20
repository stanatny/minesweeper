import { FlameJets } from "./flame_jets.js";

/**
 * SurveyEffects 提供局部扫描、信标和胜负反馈。
 * 所有效果使用固定对象池，数值信息上方不叠加不透明全屏特效。
 */
export class SurveyEffects {
  /**
   * 创建场景效果池。
   * @param {object} THREE 当前应用使用的 Three.js 模块。
   * @param {object} scene 效果所在的三维场景。
   * @param {object} options reducedMotion 返回当前是否减少动态效果。
   * @returns {SurveyEffects} 可重复触发与清理的效果控制器。
   */
  constructor(THREE, scene, { reducedMotion = () => false } = {}) {
    this.THREE = THREE;
    this.reducedMotion = reducedMotion;
    this.disposed = false;
    this.nextParticle = 0;
    this.root = new THREE.Group();
    this.root.name = "survey-effects";
    scene.add(this.root);
    this.flames = new FlameJets(THREE, this.root);

    this.colors = {
      reveal: new THREE.Color("#8aefff").multiplyScalar(1.5),
      chord: new THREE.Color("#71e8ff").multiplyScalar(1.65),
      flag: new THREE.Color("#ffbf69").multiplyScalar(1.75),
      lose: new THREE.Color("#ff632d").multiplyScalar(1.95),
      win: new THREE.Color("#69ffc1").multiplyScalar(1.8),
    };

    this.particles = Array.from({ length: 384 }, () => ({
      life: 0,
      age: 0,
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      gravity: 0,
      red: 0,
      green: 0,
      blue: 0,
      size: 0,
      trail: false,
    }));
    this.positions = new Float32Array(this.particles.length * 3);
    this.particleColors = new Float32Array(this.particles.length * 3);
    this.opacities = new Float32Array(this.particles.length);
    this.sizes = new Float32Array(this.particles.length);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.positions, 3).setUsage(
        THREE.DynamicDrawUsage,
      ),
    );
    geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(this.particleColors, 3).setUsage(
        THREE.DynamicDrawUsage,
      ),
    );
    geometry.setAttribute(
      "particleOpacity",
      new THREE.BufferAttribute(this.opacities, 1).setUsage(
        THREE.DynamicDrawUsage,
      ),
    );
    geometry.setAttribute(
      "particleSize",
      new THREE.BufferAttribute(this.sizes, 1).setUsage(THREE.DynamicDrawUsage),
    );
    geometry.setDrawRange(0, 0);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: true,
      toneMapped: false,
      blending: THREE.AdditiveBlending,
      vertexShader: PARTICLE_VERTEX,
      fragmentShader: PARTICLE_FRAGMENT,
    });
    this.points = new THREE.Points(geometry, material);
    this.points.frustumCulled = false;
    this.points.visible = false;
    this.root.add(this.points);

    // 火星的拖尾沿真实速度方向延伸，使用同一固定粒子池与一次绘制。
    this.trailPositions = new Float32Array(this.particles.length * 6);
    this.trailColors = new Float32Array(this.particles.length * 8);
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
        toneMapped: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    this.trails.frustumCulled = false;
    this.trails.visible = false;
    this.root.add(this.trails);

    this.ringGeometry = new THREE.RingGeometry(0.965, 1, 72);
    this.columnGeometry = new THREE.CylinderGeometry(
      0.045,
      0.09,
      1,
      12,
      1,
      true,
    );
    this.shellGeometry = new THREE.SphereGeometry(1, 32, 20);
    this.rings = Array.from({ length: 6 }, () =>
      this.createMeshSlot("ring", this.ringGeometry),
    );
    this.columns = Array.from({ length: 2 }, () =>
      this.createMeshSlot("column", this.columnGeometry),
    );
    this.shells = Array.from({ length: 6 }, () =>
      this.createMeshSlot("shell", this.shellGeometry),
    );
    this.fireballs = Array.from({ length: 6 }, () =>
      this.createMeshSlot("fireball", this.shellGeometry),
    );
    this.meshSlots = [
      ...this.rings,
      ...this.columns,
      ...this.shells,
      ...this.fireballs,
    ];
  }

  /**
   * 在一个格子或指定场景坐标触发效果。
   * @param {string} action reveal、chord、flag、lose 或 win。
   * @param {object} position 场景坐标 { x, z, y? }，默认高度为格子顶面。
   * @returns {void} 不改变游戏状态，也不响应未定义的动作。
   */
  trigger(action, position) {
    if (this.disposed || this.reducedMotion() || !this.colors[action]) return;
    if (!Number.isFinite(position?.x) || !Number.isFinite(position?.z)) return;
    const origin = {
      x: position.x,
      y: Number.isFinite(position.y) ? position.y : 0.38,
      z: position.z,
    };
    const color = this.colors[action];
    if (action === "lose") {
      this.flames.trigger(origin);
      this.startMesh(this.fireballs, origin, color, {
        life: 0.18,
        radius: 0.22,
        opacity: 0.65,
      });
      this.startMesh(this.shells, origin, color, {
        life: 0.36,
        radius: 1.1,
        opacity: 0.3,
      });
      this.startMesh(this.rings, origin, color, {
        life: 0.55,
        radius: 1.6,
        opacity: 0.5,
      });
      this.emitParticles(origin, color, 40, "debris");
    } else if (action === "win") {
      this.startMesh(this.rings, origin, color, {
        life: 1.45,
        radius: 4.3,
        opacity: 0.68,
      });
      this.startMesh(this.shells, origin, color, {
        life: 1.2,
        radius: 2.1,
        opacity: 0.22,
      });
      this.emitParticles(origin, color, 44, "celebrate");
    } else if (action === "flag") {
      this.startMesh(this.columns, origin, color, {
        life: 0.65,
        radius: 1.65,
        opacity: 0.6,
      });
      this.startMesh(this.rings, origin, color, {
        life: 0.62,
        radius: 0.8,
        opacity: 0.58,
      });
      this.emitParticles(origin, color, 12, "beacon");
    } else {
      this.startMesh(this.rings, origin, color, {
        life: 0.72,
        radius: action === "chord" ? 1.8 : 1.25,
        opacity: 0.62,
      });
      this.emitParticles(origin, color, 10, "scan");
    }
    this.writeParticles();
  }

  /**
   * 更新对象池的运动、衰减与上传缓冲。
   * @param {number} delta 距上一帧的可见秒数；运动积分限幅，效果寿命按真实时间结束。
   * @param {number} time 场景总时间，保留供场景统一调用，效果寿命仅依赖 delta。
   * @returns {void} 寿命结束后自动隐藏效果。
   */
  update(delta, time) {
    if (this.disposed) return;
    if (this.reducedMotion()) {
      if (
        this.points.visible ||
        this.flames.activeCount ||
        this.meshSlots.some((slot) => slot.active)
      )
        this.clear();
      return;
    }
    const elapsed = Number.isFinite(delta) ? Math.max(delta, 0) : 0;
    const step = Math.min(elapsed, 0.1);
    this.flames.update(elapsed);
    const drag = Math.exp(-step * 0.65);
    for (const particle of this.particles) {
      if (particle.life <= 0) continue;
      particle.age += elapsed;
      if (particle.age >= particle.life) {
        particle.life = 0;
        continue;
      }
      particle.vx *= drag;
      particle.vz *= drag;
      particle.vy -= particle.gravity * step;
      particle.x += particle.vx * step;
      particle.y += particle.vy * step;
      particle.z += particle.vz * step;
    }
    for (const slot of this.meshSlots) {
      if (!slot.active) continue;
      slot.age += elapsed;
      if (slot.age >= slot.life) {
        slot.active = false;
        slot.mesh.visible = false;
        continue;
      }
      this.updateMesh(slot);
    }
    if (this.points.visible) this.writeParticles();
  }

  /**
   * 清空当前效果，供重开棋局或减少动态效果时调用。
   * @returns {void} 保留可复用的 GPU 资源与对象池。
   */
  clear() {
    if (this.disposed) return;
    for (const particle of this.particles) particle.life = 0;
    for (const slot of this.meshSlots) {
      slot.active = false;
      slot.mesh.visible = false;
    }
    this.points.geometry.setDrawRange(0, 0);
    this.points.visible = false;
    this.nextParticle = 0;
    this.flames.clear();
    this.trails.geometry.setDrawRange(0, 0);
    this.trails.visible = false;
  }

  /**
   * 从场景移除效果并释放资源，可安全重复调用。
   * @returns {void} 释放后不再接收触发与更新。
   */
  dispose() {
    if (this.disposed) return;
    this.clear();
    this.disposed = true;
    this.root.removeFromParent();
    this.points.geometry.dispose();
    this.points.material.dispose();
    this.flames.dispose();
    this.trails.geometry.dispose();
    this.trails.material.dispose();
    this.ringGeometry.dispose();
    this.columnGeometry.dispose();
    this.shellGeometry.dispose();
    for (const slot of this.meshSlots) slot.mesh.material.dispose();
    this.root.clear();
  }

  /*********************************************
   * Private Helper Functions
   ********************************************/

  createMeshSlot(kind, geometry) {
    const THREE = this.THREE;
    const material =
      kind === "shell" || kind === "fireball"
        ? new THREE.ShaderMaterial({
            uniforms: {
              effectColor: { value: new THREE.Color() },
              effectOpacity: { value: 0 },
              effectAge: { value: 0 },
            },
            vertexShader: kind === "fireball" ? FIRE_VERTEX : SHELL_VERTEX,
            fragmentShader:
              kind === "fireball" ? FIRE_FRAGMENT : SHELL_FRAGMENT,
            transparent: true,
            depthWrite: false,
            depthTest: true,
            toneMapped: false,
            blending:
              kind === "fireball"
                ? THREE.NormalBlending
                : THREE.AdditiveBlending,
            side: THREE.FrontSide,
          })
        : new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            depthWrite: false,
            depthTest: true,
            toneMapped: false,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
          });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.visible = false;
    if (kind === "ring") mesh.rotation.x = -Math.PI / 2;
    this.root.add(mesh);
    return {
      kind,
      mesh,
      active: false,
      age: 0,
      life: 0,
      radius: 0,
      opacity: 0,
      baseY: 0,
    };
  }

  startMesh(pool, origin, color, configuration) {
    const slot =
      pool.find((entry) => !entry.active) ||
      pool.reduce((oldest, entry) => (entry.age > oldest.age ? entry : oldest));
    Object.assign(slot, configuration, {
      active: true,
      age: 0,
      baseY: origin.y,
    });
    slot.mesh.position.set(origin.x, origin.y, origin.z);
    slot.mesh.visible = true;
    if (slot.kind === "shell" || slot.kind === "fireball")
      slot.mesh.material.uniforms.effectColor.value.copy(color);
    else slot.mesh.material.color.copy(color);
    this.updateMesh(slot);
  }

  updateMesh(slot) {
    const progress = slot.age / slot.life;
    const ease = 1 - (1 - progress) ** 2.5;
    const opacity = slot.opacity * (1 - progress) ** 1.35;
    if (slot.kind === "column") {
      const height = 0.2 + slot.radius * Math.sin(Math.PI * progress);
      slot.mesh.scale.set(1 - progress * 0.55, height, 1 - progress * 0.55);
      slot.mesh.position.y = slot.baseY + height / 2;
      slot.mesh.material.opacity = opacity;
    } else if (slot.kind === "fireball") {
      const scale = 0.13 + slot.radius * (1 - Math.exp(-progress * 9));
      slot.mesh.scale.set(scale, scale * (1 + progress * 0.65), scale);
      slot.mesh.position.y = slot.baseY + progress * 0.75;
      slot.mesh.material.uniforms.effectAge.value = progress;
      slot.mesh.material.uniforms.effectOpacity.value =
        slot.opacity * (1 - progress ** 1.7);
    } else {
      slot.mesh.scale.setScalar(0.12 + slot.radius * ease);
      if (slot.kind === "shell")
        slot.mesh.material.uniforms.effectOpacity.value = opacity;
      else slot.mesh.material.opacity = opacity;
    }
  }

  emitParticles(origin, color, count, kind) {
    for (let index = 0; index < count; index += 1) {
      const particle = this.particles[this.nextParticle];
      this.nextParticle = (this.nextParticle + 1) % this.particles.length;
      const angle = Math.random() * Math.PI * 2;
      const spread =
        kind === "debris"
          ? 0.8 + Math.random() * 2.2
          : kind === "celebrate"
            ? 0.7 + Math.random() * 1.1
            : 0.12 + Math.random() * 0.5;
      const initialRadius = kind === "beacon" ? 0.1 : Math.random() * 0.22;
      particle.life =
        kind === "debris"
          ? 0.55 + Math.random() * 0.35
          : kind === "celebrate"
            ? 1.15 + Math.random() * 0.45
            : 0.55 + Math.random() * 0.35;
      particle.age = 0;
      particle.x = origin.x + Math.cos(angle) * initialRadius;
      particle.y = origin.y + 0.04;
      particle.z = origin.z + Math.sin(angle) * initialRadius;
      particle.vx = Math.cos(angle) * spread;
      particle.vz = Math.sin(angle) * spread;
      particle.vy =
        kind === "debris"
          ? 2.4 + Math.random() * 5.2
          : kind === "celebrate"
            ? 2 + Math.random() * 2.1
            : 0.7 + Math.random() * 1.4;
      particle.gravity =
        kind === "debris" ? 8 : kind === "celebrate" ? 1.7 : 0.45;
      particle.trail = kind === "debris";
      particle.red = color.r;
      particle.green = color.g;
      particle.blue = color.b;
      particle.size =
        kind === "debris" ? 1.5 + Math.random() * 2 : 2 + Math.random() * 2.8;
    }
    this.points.visible = true;
  }

  writeParticles() {
    let count = 0;
    let trailCount = 0;
    for (const particle of this.particles) {
      if (particle.life <= 0) continue;
      const offset = count * 3;
      this.positions[offset] = particle.x;
      this.positions[offset + 1] = particle.y;
      this.positions[offset + 2] = particle.z;
      this.particleColors[offset] = particle.red;
      this.particleColors[offset + 1] = particle.green;
      this.particleColors[offset + 2] = particle.blue;
      this.opacities[count] = Math.pow(1 - particle.age / particle.life, 1.45);
      this.sizes[count] = particle.size;
      if (particle.trail) {
        const positionOffset = trailCount * 6;
        const colorOffset = trailCount * 8;
        const length = 0.035 + particle.age * 0.04;
        this.trailPositions.set(
          [
            particle.x,
            particle.y,
            particle.z,
            particle.x - particle.vx * length,
            particle.y - particle.vy * length,
            particle.z - particle.vz * length,
          ],
          positionOffset,
        );
        const fade = this.opacities[count];
        this.trailColors.set(
          [
            particle.red * 1.15,
            particle.green * 1.6,
            particle.blue,
            fade * 0.9,
            particle.red * 0.65,
            particle.green * 0.25,
            0,
            0,
          ],
          colorOffset,
        );
        trailCount++;
      }
      count += 1;
    }
    this.points.geometry.setDrawRange(0, count);
    this.points.visible = count > 0;
    this.trails.visible = trailCount > 0;
    this.trails.geometry.setDrawRange(0, trailCount * 2);
    if (trailCount)
      for (const attribute of Object.values(this.trails.geometry.attributes))
        attribute.needsUpdate = true;
    if (!count) return;
    for (const attribute of Object.values(this.points.geometry.attributes))
      attribute.needsUpdate = true;
  }
}

// 小尺寸菱形碎光兼具亮芯与柔边，避免方形点精灵破坏材质。
const PARTICLE_VERTEX = `
  attribute vec3 color;
  attribute float particleOpacity;
  attribute float particleSize;
  varying vec3 effectColor;
  varying float effectOpacity;
  void main() {
    effectColor = color;
    effectOpacity = particleOpacity;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = particleSize;
  }
`;

const PARTICLE_FRAGMENT = `
  varying vec3 effectColor;
  varying float effectOpacity;
  void main() {
    vec2 p = abs(gl_PointCoord - vec2(0.5)) * 2.0;
    float shape = 1.0 - smoothstep(0.4, 1.0, p.x + p.y);
    float alpha = shape * effectOpacity;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(effectColor, alpha);
  }
`;

// 球形冲击波只绘制视角边缘，中心透明，保留数字和旗标的辨识度。
const SHELL_VERTEX = `
  varying vec3 effectNormal;
  varying vec3 effectView;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    effectNormal = normalize(normalMatrix * normal);
    effectView = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const SHELL_FRAGMENT = `
  uniform vec3 effectColor;
  uniform float effectOpacity;
  varying vec3 effectNormal;
  varying vec3 effectView;
  void main() {
    float rim = pow(1.0 - abs(dot(normalize(effectNormal), normalize(effectView))), 7.0);
    float alpha = rim * effectOpacity;
    if (alpha < 0.008) discard;
    gl_FragColor = vec4(effectColor, alpha);
  }
`;

// 有体积的热团先闪亮，再卷成暗烟；局限在雷附近，避免整盘白闪。
const FIRE_VERTEX = `
  uniform float effectAge;
  varying vec3 firePosition;
  varying vec3 fireNormal;
  varying vec3 fireView;
  void main() {
    firePosition = position;
    float turbulence = sin(position.x * 12.0 + effectAge * 9.0) *
      sin(position.y * 9.0 - effectAge * 7.0) * sin(position.z * 11.0);
    vec4 viewPosition = modelViewMatrix * vec4(position * (0.93 + turbulence * 0.09), 1.0);
    fireNormal = normalize(normalMatrix * normal);
    fireView = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const FIRE_FRAGMENT = `
  uniform float effectAge;
  uniform float effectOpacity;
  varying vec3 firePosition;
  varying vec3 fireNormal;
  varying vec3 fireView;
  void main() {
    vec3 p = firePosition * 8.0;
    float turbulence = 0.5 + 0.5 * sin(p.x + sin(p.y * 1.4 + effectAge * 8.0)) *
      sin(p.z * 1.3 - p.y + effectAge * 11.0);
    float facing = abs(dot(normalize(fireNormal), normalize(fireView)));
    float heat = clamp(1.25 - effectAge * 1.65 + turbulence * 0.26 + facing * 0.18, 0.0, 1.0);
    vec3 smoke = vec3(0.035, 0.022, 0.019) * (0.7 + turbulence * 1.3);
    vec3 ember = vec3(1.7, 0.08, 0.008);
    vec3 flame = vec3(3.2, 0.9, 0.08);
    vec3 core = vec3(4.0, 2.5, 0.95);
    vec3 color = mix(smoke, ember, smoothstep(0.2, 0.5, heat));
    color = mix(color, flame, smoothstep(0.55, 0.82, heat));
    color = mix(color, core, smoothstep(0.83, 1.0, heat));
    float alpha = effectOpacity * smoothstep(0.0, 0.36, facing) * (0.72 + turbulence * 0.28);
    gl_FragColor = vec4(color, alpha);
  }
`;
