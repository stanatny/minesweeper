import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { createCosmicEnvironment } from "./cosmic_environment.js";
import { SurveyEffects } from "./survey_effects.js";
import { MineModels } from "./mine_model.js";
import { DetonationSequence } from "./detonation_sequence.js";

const PALETTE = {
  closed: new THREE.Color("#344352"),
  open: new THREE.Color("#11363e"),
  hover: new THREE.Color("#8ab7c2"),
  flagged: new THREE.Color("#666050"),
  danger: new THREE.Color("#82453a"),
};

// SurveyScene 将规则引擎的公开快照变成可旋转的遗迹阵列，并返回真实命中的格子编号。
export class SurveyScene {
  constructor(
    container,
    {
      onReveal,
      onFlag,
      onChord,
      onHover,
      onFailure,
      onExplosion,
      onChainComplete,
    },
  ) {
    this.container = container;
    this.callbacks = {
      onReveal,
      onFlag,
      onChord,
      onHover,
      onFailure,
      onExplosion,
      onChainComplete,
    };
    this.detonation = new DetonationSequence();
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(this.renderer.domElement);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#030810");
    this.camera = new THREE.OrthographicCamera(-9, 9, 9, -9, 0.1, 240);
    this.camera.position.set(13, 18, 19);
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(
      new THREE.Vector2(800, 600),
      0.75,
      0.65,
      0.85,
    );
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.enablePan = true;
    this.controls.minPolarAngle = 0.05;
    this.controls.maxPolarAngle = Math.PI * 0.36;
    this.controls.minZoom = 0.65;
    this.controls.maxZoom = 5;
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: null,
    };
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    this.controls.rotateSpeed = 0.55;
    this.controls.zoomSpeed = 0.8;
    this.pointer = new THREE.Vector2();
    this.raycaster = new THREE.Raycaster();
    this.dummy = new THREE.Object3D();
    this.hoverId = -1;
    this.focusId = -1;
    this.mode = "reveal";
    this.topView = false;
    this.pointerState = null;
    this.pointers = new Set();
    this.board = new THREE.Group();
    this.scene.add(this.board);
    this.labelMeshes = [];
    this.motions = [];
    this.textures = [];
    this.lastTime = 0;
    this.setupLighting();
    this.setupEnvironment();
    this.cosmos = createCosmicEnvironment(THREE);
    this.scene.add(this.cosmos.group);
    this.effects = new SurveyEffects(THREE, this.scene, {
      reducedMotion: () => this.reducedMotion.matches,
    });
    this.bindEvents();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.onVisibility = () => {
      cancelAnimationFrame(this.frame);
      this.frame = null;
      if (!document.hidden) {
        this.lastTime = performance.now();
        this.frame = requestAnimationFrame((time) => this.animate(time));
      }
    };
    document.addEventListener("visibilitychange", this.onVisibility);
    this.frame = requestAnimationFrame((time) => this.animate(time));
  }

  // rebuild 参数是无隐藏雷信息的快照；重建时回收旧几何及材质，避免反复开局泄漏显存。
  rebuild(snapshot) {
    this.detonation.reset();
    this.mines?.dispose();
    this.effects.clear();
    this.disposeGroup(this.board);
    this.textures.forEach((texture) => texture.dispose());
    this.textures = [];
    this.board.clear();
    this.snapshot = snapshot;
    this.width = snapshot.width;
    this.height = snapshot.height;
    this.count = this.width * this.height;
    this.hoverId = -1;
    this.focusId = -1;
    this.motions = new Float32Array(this.count).fill(1);
    const tileGeometry = roundedTile(0.93, 0.27, 0.055);
    const tileMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.55,
      roughness: 0.28,
    });
    this.tiles = new THREE.InstancedMesh(
      tileGeometry,
      tileMaterial,
      this.count,
    );
    this.tiles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.board.add(this.tiles);
    const baseGeometry = roundedTile(1.005, 0.13, 0.025);
    this.tileBases = new THREE.InstancedMesh(
      baseGeometry,
      new THREE.MeshStandardMaterial({
        color: "#111f2b",
        metalness: 0.75,
        roughness: 0.48,
      }),
      this.count,
    );
    this.board.add(this.tileBases);
    const sigilTexture = makeSigilTexture();
    this.textures.push(sigilTexture);
    this.slits = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(0.79, 0.79),
      new THREE.MeshBasicMaterial({
        map: sigilTexture,
        color: "#8ac4c8",
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
      }),
      this.count,
    );
    this.board.add(this.slits);
    this.innerLights = new THREE.InstancedMesh(
      new THREE.RingGeometry(0.11, 0.135, 24),
      new THREE.MeshBasicMaterial({ color: "#56858c", side: THREE.DoubleSide }),
      this.count,
    );
    this.board.add(this.innerLights);
    this.colliders = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1.01, 0.45, 1.01),
      new THREE.MeshBasicMaterial({ visible: false }),
      this.count,
    );
    this.board.add(this.colliders);
    for (let id = 0; id < this.count; id++) {
      const p = this.position(id);
      this.setInstance(this.tileBases, id, p.x, -0.1, p.z);
      this.setInstance(this.colliders, id, p.x, 0.18, p.z);
    }
    this.tileBases.instanceMatrix.needsUpdate = true;
    this.colliders.instanceMatrix.needsUpdate = true;
    this.labelMeshes = Array.from({ length: 8 }, (_, i) => {
      const texture = makeDigitTexture(i + 1);
      this.textures.push(texture);
      const mesh = new THREE.InstancedMesh(
        new THREE.PlaneGeometry(0.51, 0.57),
        new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          depthWrite: false,
          alphaTest: 0.1,
        }),
        this.count,
      );
      mesh.count = 0;
      mesh.renderOrder = 4;
      this.board.add(mesh);
      return mesh;
    });
    this.flagPoles = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.016, 0.024, 0.72, 6),
      new THREE.MeshStandardMaterial({
        color: "#dfbd7f",
        metalness: 0.7,
        roughness: 0.3,
      }),
      this.count,
    );
    this.flagCrystals = new THREE.InstancedMesh(
      new THREE.OctahedronGeometry(0.17),
      new THREE.MeshStandardMaterial({
        color: "#f9bc68",
        emissive: "#b77724",
        emissiveIntensity: 0.9,
        metalness: 0.45,
        roughness: 0.25,
      }),
      this.count,
    );
    this.flagRings = new THREE.InstancedMesh(
      new THREE.TorusGeometry(0.21, 0.012, 5, 24),
      new THREE.MeshBasicMaterial({ color: "#e6b86f" }),
      this.count,
    );
    this.mines = new MineModels(THREE, snapshot.mines);
    this.board.add(this.mines.group);
    this.wrongMarks = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.55, 0.025, 0.06),
      new THREE.MeshBasicMaterial({ color: "#f1a19a" }),
      this.count * 2,
    );
    this.board.add(
      this.flagPoles,
      this.flagCrystals,
      this.flagRings,
      this.wrongMarks,
    );
    this.createFoundation();
    this.createCursor();
    this.createPulse();
    this.update(snapshot, { changed: [], action: "noop" });
    this.resetCamera();
  }

  // update 同步可见状态。首次点击前的造型仅由坐标决定，不能泄漏随机布雷信息。
  update(snapshot, event = { changed: [], action: "noop" }) {
    this.snapshot = snapshot;
    if (!this.tiles) return;
    if (event.action === "lose") this.detonation.start(snapshot);
    this.presentation = this.detonation.present(snapshot);
    for (const id of event.changed)
      this.motions[id] = this.reducedMotion.matches ? 1 : 0;
    this.drawTiles();
    this.drawSymbols();
    if (
      event.action !== "noop" &&
      event.action !== "lose" &&
      event.changed.length
    ) {
      const center = this.position(event.changed[0]);
      this.effects.trigger(event.action, { ...center, y: 0.35 });
      this.pulse.position.set(center.x, 0.34, center.z);
      this.pulse.material.color.set(
        snapshot.status === "lost" ? "#ff855b" : "#97ddd5",
      );
      this.pulseAge = this.reducedMotion.matches ? 99 : 0;
    }
    if (snapshot.status === "won") this.trimMaterial.color.set("#adf2c9");
    if (snapshot.status === "lost") this.trimMaterial.color.set("#cd7959");
  }

  setMode(mode) {
    this.mode = mode;
  }

  // focus 用同一三维投影显示键盘选择，保证键盘与鼠标落在相同的格子。
  focus(id) {
    this.hoverId = -1;
    this.focusId = id;
    this.drawTiles();
  }

  clearFocus() {
    this.focusId = -1;
    this.drawTiles();
  }

  setTopView(value) {
    this.topView = value;
    this.controls.enableRotate = !value;
    this.resetCamera(false);
  }

  resetCamera(resetZoom = true) {
    this.controls.target.set(0, -0.1, 0);
    if (this.topView) this.camera.position.set(0, 30, 0.01);
    else this.camera.position.set(13, 20, 21);
    this.camera.lookAt(this.controls.target);
    if (resetZoom) this.camera.zoom = 1;
    this.resize();
    this.controls.update();
    this.refreshCursor();
  }

  projectCell(id) {
    const p = this.position(id);
    const vector = new THREE.Vector3(p.x, 0.3, p.z).project(this.camera);
    const rect = this.renderer.domElement.getBoundingClientRect();
    return {
      x: rect.left + ((vector.x + 1) * rect.width) / 2,
      y: rect.top + ((1 - vector.y) * rect.height) / 2,
    };
  }

  resize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (!width || !height) return;
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    const aspect = width / height;
    const boardWidth = (this.width || 9) * 1.06;
    const boardDepth = (this.height || 9) * 1.06;
    const horizontal = this.topView
      ? boardWidth + 3.0
      : boardWidth * 0.87 + boardDepth * 0.5 + 3.1;
    const vertical = this.topView
      ? boardDepth + 3.2
      : boardDepth * 0.64 + boardWidth * 0.38 + 5.7;
    const extent = Math.max(vertical, horizontal / aspect) / 2;
    this.camera.left = -extent * aspect;
    this.camera.right = extent * aspect;
    this.camera.top = extent;
    this.camera.bottom = -extent;
    this.camera.updateProjectionMatrix();
  }

  setupLighting() {
    this.scene.add(new THREE.HemisphereLight("#c4e2eb", "#121622", 2.0));
    const key = new THREE.DirectionalLight("#e3edf1", 3.8);
    key.position.set(-5, 13, 9);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight("#5997b9", 2.6);
    rim.position.set(7, 4, -9);
    this.scene.add(rim);
    const warm = new THREE.DirectionalLight("#bc9270", 0.6);
    warm.position.set(-7, 1, -3);
    this.scene.add(warm);
    const underside = new THREE.DirectionalLight("#537a8d", 1.6);
    underside.position.set(4, -3, 8);
    this.scene.add(underside);
  }

  setupEnvironment() {
    const positions = [];
    const random = seededRandom(71);
    for (let i = 0; i < 280; i++)
      positions.push(
        (random() - 0.5) * 140,
        (random() - 0.5) * 100,
        (random() - 0.5) * 130,
      );
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    this.stars = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: "#a7bbc7",
        size: 0.055,
        transparent: true,
        opacity: 0.48,
        sizeAttenuation: true,
      }),
    );
    this.scene.add(this.stars);
  }

  createFoundation() {
    const w = this.width * 1.06;
    const h = this.height * 1.06;
    const span = Math.max(w, h);
    const random = seededRandom(324);
    const basalt = new THREE.MeshStandardMaterial({
      color: "#283442",
      metalness: 0.48,
      roughness: 0.72,
      flatShading: true,
    });
    const darkRock = new THREE.MeshStandardMaterial({
      color: "#1e2633",
      metalness: 0.3,
      roughness: 0.78,
      flatShading: true,
    });
    const metal = new THREE.MeshStandardMaterial({
      color: "#607d8b",
      metalness: 0.7,
      roughness: 0.34,
    });
    this.trimMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#51b7c6").multiplyScalar(1.6),
    });
    const energy = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#63e9f0").multiplyScalar(2.2),
    });

    // 每一块舱盖下方都是独立的断裂岩柱；上表面规则不变，下缘形成破碎岛屿轮廓。
    const columnGeometry = new THREE.CylinderGeometry(0.67, 0.22, 1, 4, 1);
    columnGeometry.rotateY(Math.PI / 4);
    const columns = new THREE.InstancedMesh(columnGeometry, basalt, this.count);
    const veins = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.018, 1, 0.025),
      energy,
      this.count,
    );
    for (let id = 0; id < this.count; id++) {
      const p = this.position(id);
      const radial = Math.hypot(p.x / w, p.z / h);
      const depth = 0.7 + (1 - radial) * 1.0 + random() * 0.95;
      this.setInstance(columns, id, p.x, -depth / 2 - 0.14, p.z, 1, depth, 1);
      columns.setColorAt(
        id,
        new THREE.Color().setHSL(
          0.58,
          0.17 + random() * 0.13,
          0.5 + random() * 0.22,
        ),
      );
      this.setInstance(
        veins,
        id,
        p.x + 0.33,
        -depth * 0.35,
        p.z + 0.33,
        1,
        depth * 0.57,
        1,
      );
    }
    columns.instanceMatrix.needsUpdate = true;
    veins.instanceMatrix.needsUpdate = true;
    this.board.add(columns, veins);
    const island = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1, 0),
      darkRock,
    );
    island.scale.set(w * 0.43, 1.6, h * 0.43);
    island.position.set(0, -1.75, 0);
    island.rotation.y = 0.13;
    this.board.add(island);

    // 中央能源晶体与陀螺环让遗迹拥有明显的纵向结构。
    this.core = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.75, 0),
      new THREE.MeshStandardMaterial({
        color: "#affcff",
        emissive: "#23c5e0",
        emissiveIntensity: 2.8,
        metalness: 0.42,
        roughness: 0.16,
      }),
    );
    this.core.position.set(w * 0.08, -3.5, h * 0.32);
    this.core.scale.y = 1.65;
    this.core.rotation.y = 0.4;
    this.board.add(this.core);
    const light = new THREE.PointLight("#30d3ef", 20, span * 1.4, 2);
    light.position.copy(this.core.position);
    this.board.add(light);
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(
          1.0 + i * 0.16,
          i === 0 ? 0.025 : 0.014,
          6,
          72,
          Math.PI * 1.72,
        ),
        i === 0 ? energy : metal,
      );
      ring.position.copy(this.core.position);
      ring.rotation.set(0.6 + i * 0.8, i * 1.3, i * 0.5);
      this.board.add(ring);
    }
    const glowTexture = makeGlowTexture();
    this.textures.push(glowTexture);
    const coreGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color: "#29d5fa",
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    coreGlow.position.copy(this.core.position);
    coreGlow.scale.set(5, 5, 1);
    this.board.add(coreGlow);

    // 两圈断开的导航轨道围绕遗迹慢速运动，交互棋盘本身始终稳定。
    this.orbitalRings = new THREE.Group();
    this.orbitalRings.position.y = -1.15;
    const radius = Math.hypot(w, h) * 0.57;
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(
          radius + i * 0.33,
          i === 0 ? 0.028 : 0.013,
          5,
          150,
          Math.PI * (i === 0 ? 1.85 : 1.5),
        ),
        i === 0
          ? this.trimMaterial
          : new THREE.MeshBasicMaterial({
              color: i === 1 ? "#344361" : "#526572",
              transparent: true,
              opacity: 0.6,
            }),
      );
      ring.rotation.set(Math.PI / 2 + i * 0.045, 0.08 * i, i * 2.2);
      this.orbitalRings.add(ring);
    }
    const ticks = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1, 0.02, 0.02),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
      56,
    );
    for (let i = 0; i < 56; i++) {
      const angle = (i / 56) * Math.PI * 2;
      this.dummy.position.set(
        Math.cos(angle) * (radius + 0.2),
        0,
        Math.sin(angle) * (radius + 0.2),
      );
      this.dummy.rotation.set(0, -angle, 0);
      this.dummy.scale.set(i % 7 === 0 ? 0.3 : 0.1, 1, 1);
      this.dummy.updateMatrix();
      ticks.setMatrixAt(i, this.dummy.matrix);
      ticks.setColorAt(
        i,
        i % 7 === 0 ? this.trimMaterial.color : new THREE.Color("#415766"),
      );
    }
    ticks.instanceMatrix.needsUpdate = true;
    this.orbitalRings.add(ticks);
    this.board.add(this.orbitalRings);
    const underGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(w * 2, h * 2),
      new THREE.MeshBasicMaterial({
        map: glowTexture,
        color: "#274775",
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    );
    underGlow.rotation.x = -Math.PI / 2;
    underGlow.position.y = -3.8;
    this.board.add(underGlow);

    const shards = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(1, 0),
      darkRock,
      22,
    );
    for (let i = 0; i < 22; i++) {
      const angle = random() * Math.PI * 2;
      const distance = radius * (0.95 + random() * 0.32);
      const size = 0.16 + random() * 0.38;
      this.dummy.position.set(
        Math.cos(angle) * distance,
        -1.2 - random() * 2.8,
        Math.sin(angle) * distance,
      );
      this.dummy.scale.set(
        size * 0.7,
        size * (0.7 + random() * 1.4),
        size * 1.1,
      );
      this.dummy.rotation.set(random() * 3, random() * 3, random() * 3);
      this.dummy.updateMatrix();
      shards.setMatrixAt(i, this.dummy.matrix);
    }
    shards.instanceMatrix.needsUpdate = true;
    this.board.add(shards);
    for (const sign of [-1, 1]) {
      for (const side of [-1, 1]) {
        const p = new THREE.Vector3(
          sign * (w / 2 + 0.08),
          -0.1,
          side * (h / 2 + 0.08),
        );
        const beacon = new THREE.Mesh(
          new THREE.CylinderGeometry(0.055, 0.15, 0.75, 5),
          metal,
        );
        beacon.position.copy(p).y += 0.33;
        const tip = new THREE.Mesh(new THREE.OctahedronGeometry(0.1), energy);
        tip.position.copy(p).y += 0.77;
        this.board.add(beacon, tip);
      }
    }
  }

  createCursor() {
    this.cursor = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({
      color: "#d6f3e9",
      transparent: true,
      opacity: 0.92,
    });
    for (const x of [-1, 1]) {
      for (const z of [-1, 1]) {
        const a = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.016, 0.026),
          material,
        );
        a.position.set(x * 0.42, 0, z * 0.5);
        const b = new THREE.Mesh(
          new THREE.BoxGeometry(0.026, 0.016, 0.2),
          material,
        );
        b.position.set(x * 0.5, 0, z * 0.42);
        this.cursor.add(a, b);
      }
    }
    this.cursor.visible = false;
    this.board.add(this.cursor);
  }

  createPulse() {
    this.pulse = new THREE.Mesh(
      new THREE.RingGeometry(0.92, 1, 80),
      new THREE.MeshBasicMaterial({
        color: "#91dad8",
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    this.pulse.rotation.x = -Math.PI / 2;
    this.pulseAge = 99;
    this.board.add(this.pulse);
  }

  drawTiles() {
    for (const cell of this.presentation.cells) {
      const p = this.position(cell.id);
      const progress = this.motions[cell.id];
      const ease = 1 - Math.pow(1 - progress, 3);
      const isSelected = cell.id === this.hoverId || cell.id === this.focusId;
      const level = cell.revealed
        ? 0.09 + 0.22 * (1 - ease)
        : 0.31 + (isSelected ? 0.045 : 0);
      this.setInstance(
        this.tiles,
        cell.id,
        p.x,
        -0.04,
        p.z,
        1,
        level / 0.27,
        1,
      );
      const color =
        cell.wrongFlag || cell.exploded
          ? PALETTE.danger
          : isSelected
            ? PALETTE.hover
            : cell.flagged
              ? PALETTE.flagged
              : cell.revealed
                ? PALETTE.open
                : PALETTE.closed;
      this.tiles.setColorAt(cell.id, color);
      this.dummy.position.set(p.x, level + 0.029, p.z);
      this.dummy.rotation.set(-Math.PI / 2, 0, 0);
      this.dummy.scale.setScalar(cell.revealed ? 0 : 1);
      this.dummy.updateMatrix();
      this.slits.setMatrixAt(cell.id, this.dummy.matrix);
      this.dummy.position.set(p.x, 0.13, p.z);
      this.dummy.rotation.set(-Math.PI / 2, 0, 0);
      this.dummy.scale.setScalar(
        cell.revealed && !cell.mine && cell.adjacent === 0 ? 1 : 0,
      );
      this.dummy.updateMatrix();
      this.innerLights.setMatrixAt(cell.id, this.dummy.matrix);
    }
    this.tiles.instanceMatrix.needsUpdate = true;
    this.tiles.instanceColor.needsUpdate = true;
    this.slits.instanceMatrix.needsUpdate = true;
    this.innerLights.instanceMatrix.needsUpdate = true;
    this.refreshCursor();
  }

  drawSymbols() {
    const labels = Array.from({ length: 8 }, () => []);
    let flags = 0;
    let wrongMarks = 0;
    for (const cell of this.presentation.cells) {
      const p = this.position(cell.id);
      if (cell.revealed && cell.adjacent > 0 && !cell.mine)
        labels[cell.adjacent - 1].push(p);
      if (cell.wrongFlag) {
        for (const angle of [-Math.PI / 4, Math.PI / 4]) {
          this.dummy.position.set(p.x, 0.38, p.z);
          this.dummy.rotation.set(0, angle, 0);
          this.dummy.scale.setScalar(1);
          this.dummy.updateMatrix();
          this.wrongMarks.setMatrixAt(wrongMarks++, this.dummy.matrix);
        }
      }
      if (cell.flagged && !cell.revealed && !cell.wrongFlag) {
        this.setInstance(this.flagPoles, flags, p.x, 0.59, p.z);
        this.setInstance(
          this.flagCrystals,
          flags,
          p.x,
          1.03,
          p.z,
          0.8,
          1.45,
          0.8,
        );
        this.dummy.position.set(p.x, 0.43, p.z);
        this.dummy.rotation.set(-Math.PI / 2, 0, 0);
        this.dummy.scale.setScalar(1);
        this.dummy.updateMatrix();
        this.flagRings.setMatrixAt(flags, this.dummy.matrix);
        flags++;
      }
    }
    for (const mesh of [this.flagPoles, this.flagCrystals, this.flagRings]) {
      mesh.count = flags;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
    this.updateMineModels();
    this.labels = labels;
    this.wrongMarks.count = wrongMarks;
    this.wrongMarks.instanceMatrix.needsUpdate = true;
    this.wrongMarks.computeBoundingSphere();
    this.updateLabels();
  }

  // 雷的外观随引爆时间线变化；规则引擎仍然只结算一次失败。
  updateMineModels() {
    const items = [];
    for (const cell of this.presentation.cells) {
      if (!cell.revealed || !cell.mine) continue;
      items.push({
        id: cell.id,
        ...this.position(cell.id),
        ...this.detonation.stage(cell.id),
      });
    }
    this.mines.update(items);
  }

  advanceDetonation(delta) {
    if (!this.detonation.active) return;
    const events = this.detonation.advance(delta);
    if (events.revealed.length) {
      this.presentation = this.detonation.present(this.snapshot);
      for (const id of events.revealed)
        this.motions[id] = this.reducedMotion.matches ? 1 : 0;
      this.drawTiles();
      this.drawSymbols();
    }
    for (const entry of events.explosions) {
      const position = this.position(entry.id);
      this.effects.trigger("lose", { ...position, y: 0.48 });
      const projected = new THREE.Vector3(position.x, 0.48, position.z).project(
        this.camera,
      );
      this.callbacks.onExplosion?.({
        index: entry.index,
        total: this.detonation.entries.length,
        pan: Math.max(-0.8, Math.min(0.8, projected.x)),
      });
    }
    if (!events.revealed.length) this.updateMineModels();
    if (events.finished) this.callbacks.onChainComplete?.();
  }

  updateLabels() {
    if (!this.labels) return;
    this.labels.forEach((positions, index) => {
      const mesh = this.labelMeshes[index];
      mesh.count = positions.length;
      positions.forEach((p, i) => {
        this.dummy.position.set(p.x, 0.32, p.z);
        this.dummy.quaternion.copy(this.camera.quaternion);
        this.dummy.scale.setScalar(1);
        this.dummy.updateMatrix();
        mesh.setMatrixAt(i, this.dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    });
  }

  refreshCursor() {
    if (!this.cursor) return;
    const id = this.hoverId >= 0 ? this.hoverId : this.focusId;
    this.cursor.visible = id >= 0;
    if (id >= 0) {
      const p = this.position(id);
      this.cursor.position.set(p.x, 0.42, p.z);
    }
  }

  position(id) {
    return {
      x: ((id % this.width) - (this.width - 1) / 2) * 1.06,
      z: (Math.floor(id / this.width) - (this.height - 1) / 2) * 1.06,
    };
  }

  setInstance(mesh, id, x, y, z, sx = 1, sy = 1, sz = 1) {
    this.dummy.position.set(x, y, z);
    this.dummy.rotation.set(0, 0, 0);
    this.dummy.scale.set(sx, sy, sz);
    this.dummy.updateMatrix();
    mesh.setMatrixAt(id, this.dummy.matrix);
  }

  pick(event) {
    if (!this.colliders) return -1;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      (-(event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.camera.updateMatrixWorld();
    this.board.updateMatrixWorld(true);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObject(this.colliders, false)[0];
    return hit?.instanceId ?? -1;
  }

  bindEvents() {
    const canvas = this.renderer.domElement;
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      this.callbacks.onFailure(new Error("WebGL context lost"));
    });
    canvas.addEventListener("pointerdown", (event) => {
      this.clearFocus();
      this.pointers.add(event.pointerId);
      if (this.pointers.size > 1) {
        if (this.pointerState) this.pointerState.cancelled = true;
        clearTimeout(this.longPressTimer);
        return;
      }
      const id = this.pick(event);
      this.pointerState = {
        x: event.clientX,
        y: event.clientY,
        id,
        button: event.button,
        cancelled: false,
        consumed: false,
      };
      if (event.pointerType === "touch" && id >= 0) {
        this.longPressTimer = setTimeout(() => {
          if (this.pointerState && !this.pointerState.cancelled) {
            this.pointerState.consumed = true;
            this.callbacks.onFlag(id);
          }
        }, 480);
      }
    });
    canvas.addEventListener("pointermove", (event) => {
      if (
        this.pointerState &&
        Math.hypot(
          event.clientX - this.pointerState.x,
          event.clientY - this.pointerState.y,
        ) > 6
      ) {
        this.pointerState.cancelled = true;
        clearTimeout(this.longPressTimer);
      }
      const id = this.pick(event);
      const hadKeyboardFocus = this.focusId >= 0;
      this.focusId = -1;
      if (id !== this.hoverId || hadKeyboardFocus) {
        this.hoverId = id;
        canvas.style.cursor =
          id >= 0 ? "crosshair" : this.pointerState ? "grabbing" : "grab";
        this.drawTiles();
        this.callbacks.onHover(id);
      }
    });
    canvas.addEventListener("pointerleave", () => {
      this.hoverId = -1;
      this.drawTiles();
      this.callbacks.onHover(-1);
    });
    canvas.addEventListener("pointerup", (event) => {
      const state = this.pointerState;
      if (event.pointerType !== "mouse") {
        this.hoverId = -1;
        this.focusId = -1;
        this.drawTiles();
      }
      this.pointers.delete(event.pointerId);
      clearTimeout(this.longPressTimer);
      if (this.pointers.size === 0) this.pointerState = null;
      if (state?.cancelled)
        this.suppressDoubleClickUntil = performance.now() + 450;
      if (!state || state.cancelled || state.consumed || state.id < 0) return;
      if (Math.hypot(event.clientX - state.x, event.clientY - state.y) > 6)
        return;
      if (event.button === 2 || this.mode === "flag")
        this.callbacks.onFlag(state.id);
      else if (event.button === 0) this.callbacks.onReveal(state.id);
    });
    canvas.addEventListener("pointercancel", (event) => {
      this.pointers.delete(event.pointerId);
      this.pointerState = null;
      this.hoverId = -1;
      this.focusId = -1;
      this.drawTiles();
      clearTimeout(this.longPressTimer);
    });
    canvas.addEventListener("dblclick", (event) => {
      if (performance.now() < (this.suppressDoubleClickUntil || 0)) return;
      const id = this.pick(event);
      if (id >= 0) this.callbacks.onChord(id);
    });
    this.controls.addEventListener("change", () => this.updateLabels());
  }

  animate(time) {
    this.frame = null;
    if (this.disposed || document.hidden) return;
    const elapsed = Math.max(0, (time - this.lastTime) / 1000);
    const delta = Math.min(elapsed, 0.1);
    this.lastTime = time;
    this.controls.update();
    this.cosmos.update(time / 1000, this.reducedMotion.matches);
    this.effects.update(elapsed, time / 1000);
    this.advanceDetonation(elapsed);
    let changing = false;
    for (let i = 0; i < this.motions.length; i++) {
      if (this.motions[i] < 1) {
        this.motions[i] = Math.min(1, this.motions[i] + delta * 3.8);
        changing = true;
      }
    }
    if (changing) this.drawTiles();
    if (this.pulse && this.pulseAge < 1.1) {
      this.pulseAge += delta;
      this.pulse.scale.setScalar(0.3 + this.pulseAge * 4);
      this.pulse.material.opacity = Math.max(0, (1 - this.pulseAge) * 0.35);
    }
    if (this.orbitalRings && !this.reducedMotion.matches) {
      this.orbitalRings.rotation.y = time * 0.00004;
      this.core.material.emissiveIntensity =
        2.6 + Math.sin(time * 0.0018) * 0.45;
    }
    this.composer.render();
    this.frame = requestAnimationFrame((next) => this.animate(next));
  }

  disposeGroup(group) {
    const geometries = new Set();
    const materials = new Set();
    group.traverse((object) => {
      if (object.isInstancedMesh) object.dispose();
      if (object.geometry) geometries.add(object.geometry);
      if (object.material)
        (Array.isArray(object.material)
          ? object.material
          : [object.material]
        ).forEach((material) => materials.add(material));
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    clearTimeout(this.longPressTimer);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.cosmos.dispose();
    this.effects.dispose();
    this.detonation.reset();
    this.mines?.dispose();
    this.disposeGroup(this.scene);
    this.textures.forEach((texture) => texture.dispose());
    this.renderer.dispose();
    this.bloom.dispose();
    this.composer.dispose();
    this.renderer.domElement.remove();
  }
}

// 倒角金属舱盖保留参数化源，无外部模型或贴图依赖。
function roundedTile(size, depth, radius) {
  return roundedPlate(size, size, depth, radius);
}

function roundedPlate(width, height, depth, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2,
    y = -height / 2,
    r = radius;
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: radius * 0.4,
    bevelThickness: radius * 0.4,
    curveSegments: 3,
  });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

function makeDigitTexture(value) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const colors = [
    "#b8f0ef",
    "#a9d4c0",
    "#efc390",
    "#b6b8e6",
    "#eea2a0",
    "#96ccd7",
    "#e0d6bf",
    "#f3ede4",
  ];
  ctx.font = "600 96px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(10, 24, 35, 0.9)";
  ctx.shadowBlur = 7;
  ctx.fillStyle = colors[value - 1];
  ctx.fillText(String(value), 64, 69);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,0.9)");
  gradient.addColorStop(0.42, "rgba(255,255,255,0.4)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

function makeSigilTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.strokeStyle = "#b3eff3";
  ctx.lineWidth = 1.3;
  for (const [x, y, signX, signY] of [
    [12, 12, 1, 1],
    [116, 12, -1, 1],
    [12, 116, 1, -1],
    [116, 116, -1, -1],
  ]) {
    ctx.beginPath();
    ctx.moveTo(x, y + signY * 13);
    ctx.lineTo(x, y);
    ctx.lineTo(x + signX * 13, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(179,239,243,0.7)";
  ctx.beginPath();
  ctx.moveTo(64, 57);
  ctx.lineTo(71, 64);
  ctx.lineTo(64, 71);
  ctx.lineTo(57, 64);
  ctx.closePath();
  ctx.stroke();
  return new THREE.CanvasTexture(canvas);
}

function seededRandom(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
