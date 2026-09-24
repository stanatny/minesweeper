import * as THREE from "three";
import { SurveyScene } from "./survey_scene.js";
import { MineModels } from "./mine_model.js";
import { FreeOrbitControls } from "./free_orbit_controls.js";

const UP = new THREE.Vector3(0, 1, 0);
const COLORS = {
  closed: new THREE.Color("#b87b51"),
  open: new THREE.Color("#6b4734"),
  flagged: new THREE.Color("#28434a"),
  mine: new THREE.Color("#95483a"),
  neighbor: new THREE.Color("#d3ad82"),
  selected: new THREE.Color("#e7bd82"),
  openNeighbor: new THREE.Color("#7b5640"),
  openSelected: new THREE.Color("#8b674b"),
  flaggedNeighbor: new THREE.Color("#34555b"),
  flaggedSelected: new THREE.Color("#43636a"),
  edge: new THREE.Color("#987756"),
  openEdge: new THREE.Color("#9b7760"),
  side: new THREE.Color("#553c2e"),
};

/**
 * Render a solid made of equal square face cells using public snapshots only.
 * Shared scene infrastructure supplies the renderer, input contracts, audio callbacks,
 * bounded effects, visibility handling, and resource disposal; no planar board is built.
 */
export class SurfaceScene extends SurveyScene {
  constructor(container, callbacks) {
    super(container, callbacks);
    this.surfaceView = true;
    this.highlightedIds = [];
    this.activeCellId = -1;
    this.renderer.toneMappingExposure = 1.2;
    this.scene.add(new THREE.AmbientLight("#acc7d8", 0.85));
    this.bloom.strength = 0.3;
    this.bloom.threshold = 1.1;
  }

  // 闭合物体允许连续跨越两极；平面棋盘仍沿用原有俯仰范围。
  createControls() {
    return new FreeOrbitControls(this.camera, this.renderer.domElement);
  }

  rebuild(snapshot) {
    if (snapshot.topology?.kind !== "surface")
      throw new TypeError("SurfaceScene requires a surface topology");
    this.detonation.reset();
    this.fireworks.clear();
    this.callbacks.onFireworksStop?.();
    this.effects.clear();
    this.mines?.dispose();
    this.disposeGroup(this.board);
    this.board.clear();
    this.textures.forEach((texture) => texture.dispose());
    this.textures = [];
    this.snapshot = null;
    this.topology = snapshot.topology;
    this.surfaceCells = this.topology.cells;
    this.width = snapshot.width;
    this.height = snapshot.height;
    this.count = this.surfaceCells.length;
    this.radius = this.topology.radius;
    this.hoverId = this.focusId = -1;
    this.drawnReveals = null;
    this.motions = new Float32Array(this.count).fill(1);
    this.maxDegree = Math.max(
      1,
      ...this.surfaceCells.map((cell) => cell.neighbors.length),
    );
    this.labels = Array.from({ length: this.maxDegree }, () => []);
    const firstCorners = this.surfaceCells[0].corners;
    this.cellSize = new THREE.Vector3()
      .fromArray(firstCorners[0])
      .distanceTo(new THREE.Vector3().fromArray(firstCorners[1]));
    this.cellFrames = this.surfaceCells.map((cell) => {
      const center = new THREE.Vector3().fromArray(cell.center);
      const normal = new THREE.Vector3().fromArray(cell.normal).normalize();
      const tangentU = new THREE.Vector3()
        .fromArray(cell.corners[1])
        .sub(new THREE.Vector3().fromArray(cell.corners[0]))
        .normalize();
      const tangentV = new THREE.Vector3()
        .crossVectors(normal, tangentU)
        .normalize();
      return {
        center,
        normal,
        tangentU,
        tangentV,
        labelRotation: new THREE.Quaternion().setFromRotationMatrix(
          new THREE.Matrix4().makeBasis(tangentU, tangentV, normal),
        ),
        rotation: new THREE.Quaternion().setFromUnitVectors(UP, normal),
        scale: this.cellSize,
      };
    });
    this.createSurfaceGeometry();
    this.createSurfaceSymbols();
    this.mines = new MineModels(THREE, Math.max(1, snapshot.mines));
    this.board.add(this.mines.group);
    this.update(snapshot);
    this.resetCamera();
  }

  createSurfaceGeometry() {
    const bodyPositions = [],
      tilePositions = [],
      triangleIds = [],
      ranges = [];
    const roles = [],
      localCoordinates = [];
    const point = new THREE.Vector3();
    for (const cell of this.surfaceCells) {
      const frame = this.cellFrames[cell.id];
      // The unbroken unit squares form the actual solid and the only picking surface.
      for (const triangle of [
        [0, 1, 2],
        [0, 2, 3],
      ]) {
        for (const index of triangle)
          bodyPositions.push(...cell.corners[index]);
        triangleIds.push(cell.id);
      }
      const start = tilePositions.length / 3;
      const ring = (half, role) => [
        [-half, -half, role],
        [half, -half, role],
        [half, half, role],
        [-half, half, role],
      ];
      const face = ring(0.442, 0),
        lip = ring(0.47, 1),
        foot = ring(0.47, 2);
      const append = (vertices) => {
        for (const [u, v, role] of vertices) {
          point
            .copy(frame.center)
            .addScaledVector(frame.tangentU, u * frame.scale)
            .addScaledVector(frame.tangentV, v * frame.scale);
          point.addScaledVector(
            frame.normal,
            (role === 0 ? 0.06 : role === 1 ? 0.032 : 0.004) * frame.scale,
          );
          tilePositions.push(point.x, point.y, point.z);
          localCoordinates.push(u, v);
          roles.push(role);
        }
      };
      append([face[0], face[1], face[2], face[0], face[2], face[3]]);
      for (let edge = 0; edge < 4; edge++) {
        const next = (edge + 1) % 4;
        // A narrow beveled lip and a vertical skirt make each 0.94-unit cover a real thin plate.
        append([
          face[edge],
          lip[edge],
          lip[next],
          face[edge],
          lip[next],
          face[next],
        ]);
        append([
          lip[edge],
          foot[edge],
          foot[next],
          lip[edge],
          foot[next],
          lip[next],
        ]);
      }
      ranges[cell.id] = { start, count: tilePositions.length / 3 - start };
    }
    this.tileRanges = ranges;
    this.tileVertexRoles = new Uint8Array(roles);
    this.tileLocalCoordinates = new Float32Array(localCoordinates);
    this.triangleCellIds = triangleIds;
    const bodyGeometry = new THREE.BufferGeometry();
    bodyGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(bodyPositions, 3),
    );
    bodyGeometry.computeVertexNormals();
    this.colliders = new THREE.Mesh(
      bodyGeometry,
      new THREE.MeshStandardMaterial({
        color: "#322c2a",
        roughness: 0.88,
        metalness: 0.25,
        flatShading: true,
      }),
    );
    this.colliders.name = "solid-unit-square-occluder";
    this.board.add(this.colliders);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(tilePositions, 3).setUsage(
        THREE.DynamicDrawUsage,
      ),
    );
    geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(
        new Float32Array(tilePositions.length),
        3,
      ).setUsage(THREE.DynamicDrawUsage),
    );
    geometry.computeVertexNormals();
    this.tiles = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        vertexColors: true,
        metalness: 0.48,
        roughness: 0.56,
        flatShading: true,
      }),
    );
    this.tiles.name = "solid-equal-square-alloy-covers";
    this.board.add(this.tiles);

    // One thin inset outline follows the selected face, including its orientation at an inner corner.
    const outline = new THREE.Shape();
    outline.moveTo(-0.478, -0.478);
    outline.lineTo(0.478, -0.478);
    outline.lineTo(0.478, 0.478);
    outline.lineTo(-0.478, 0.478);
    outline.closePath();
    const hole = new THREE.Path();
    hole.moveTo(-0.465, -0.465);
    hole.lineTo(-0.465, 0.465);
    hole.lineTo(0.465, 0.465);
    hole.lineTo(0.465, -0.465);
    hole.closePath();
    outline.holes.push(hole);
    this.selectionOutline = new THREE.Mesh(
      new THREE.ShapeGeometry(outline),
      new THREE.MeshBasicMaterial({
        color: "#ffe0a6",
        depthTest: true,
        toneMapped: false,
      }),
    );
    this.selectionOutline.name = "solid-selected-face-outline";
    this.selectionOutline.visible = false;
    this.board.add(this.selectionOutline);
  }

  createSurfaceSymbols() {
    const instances = (name, geometry, material, capacity = this.count) => {
      const mesh = new THREE.InstancedMesh(geometry, material, capacity);
      mesh.name = name;
      mesh.count = 0;
      mesh.frustumCulled = false;
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      this.board.add(mesh);
      return mesh;
    };
    this.labelMeshes = Array.from({ length: this.maxDegree }, (_, index) => {
      const texture = digitTexture(index + 1);
      this.textures.push(texture);
      const mesh = instances(
        `surface-number-${index + 1}`,
        new THREE.PlaneGeometry(0.57, 0.63),
        new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          alphaTest: 0.15,
          depthTest: true,
          depthWrite: false,
          toneMapped: false,
        }),
      );
      mesh.renderOrder = 3;
      mesh.userData.cellIds = [];
      return mesh;
    });
    this.flagPoles = instances(
      "surface-beacon-stems",
      new THREE.CylinderGeometry(0.021, 0.029, 0.44, 6),
      new THREE.MeshStandardMaterial({
        color: "#dfbd7f",
        metalness: 0.65,
        roughness: 0.38,
      }),
    );
    this.flagCrystals = instances(
      "surface-beacon-lanterns",
      new THREE.OctahedronGeometry(0.125, 0),
      new THREE.MeshStandardMaterial({
        color: "#efbc70",
        emissive: "#ae6f26",
        emissiveIntensity: 0.55,
        metalness: 0.4,
        roughness: 0.38,
      }),
    );
    this.flagRings = instances(
      "surface-beacon-footings",
      new THREE.TorusGeometry(0.16, 0.016, 5, 20).rotateX(Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: "#cca465" }),
    );
    this.wrongMarks = instances(
      "surface-wrong-flags",
      new THREE.BoxGeometry(0.5, 0.035, 0.045),
      new THREE.MeshBasicMaterial({ color: "#ed9585" }),
      this.count * 2,
    );
  }

  update(snapshot, event = { changed: [], action: "noop" }) {
    const previousStatus = this.snapshot?.status;
    this.snapshot = snapshot;
    if (!this.tiles) return;
    if (event.action === "lose") this.startSurfaceDetonation(snapshot);
    this.presentation = this.detonation.present(snapshot);
    this.drawTiles();
    this.drawSymbols();
    if (snapshot.status === "won" && previousStatus !== "won") {
      // Present the celebration in front of the body in the current camera frame.
      const direction = this.camera.position.clone().normalize();
      this.fireworks.root.position.copy(
        direction.multiplyScalar(this.radius * 0.9),
      );
      this.fireworks.root.quaternion.copy(this.camera.quaternion);
      this.fireworks.root.scale.setScalar(this.radius / 4.3);
      this.fireworks.start({ width: 8, height: 6 });
    }
  }

  drawTiles() {
    if (!this.tiles || !this.presentation) return;
    const selected = this.hoverId >= 0 ? this.hoverId : this.focusId;
    this.activeCellId = selected;
    this.highlightedIds =
      selected >= 0 ? [selected, ...this.surfaceCells[selected].neighbors] : [];
    const neighbors = new Set(this.highlightedIds);
    const positions = this.tiles.geometry.attributes.position;
    const colors = this.tiles.geometry.attributes.color;
    const point = new THREE.Vector3(),
      faceColor = new THREE.Color(),
      vertexColor = new THREE.Color();
    let geometryChanged = false;
    this.drawnReveals ??= new Uint8Array(this.count).fill(2);
    for (const cell of this.presentation.cells) {
      const frame = this.cellFrames[cell.id],
        range = this.tileRanges[cell.id];
      const base = cell.revealed
        ? cell.mine
          ? COLORS.mine
          : COLORS.open
        : cell.flagged
          ? COLORS.flagged
          : COLORS.closed;
      faceColor.copy(base);
      const openSafe = cell.revealed && !cell.mine;
      if (cell.id === selected)
        faceColor.lerp(
          openSafe
            ? COLORS.openSelected
            : cell.flagged
              ? COLORS.flaggedSelected
              : COLORS.selected,
          0.28,
        );
      else if (neighbors.has(cell.id))
        faceColor.lerp(
          openSafe
            ? COLORS.openNeighbor
            : cell.flagged
              ? COLORS.flaggedNeighbor
              : COLORS.neighbor,
          0.3,
        );
      faceColor.multiplyScalar(
        0.97 + hash(cell.id + (Number(this.topology.seed) || 1)) * 0.06,
      );
      const revealed = Number(cell.revealed);
      const needsGeometry = this.drawnReveals[cell.id] !== revealed;
      for (let i = range.start; i < range.start + range.count; i++) {
        const role = this.tileVertexRoles[i];
        if (needsGeometry) {
          const lift =
            role === 0
              ? cell.revealed
                ? 0.012
                : 0.06
              : role === 1
                ? 0.032
                : 0.004;
          point
            .copy(frame.center)
            .addScaledVector(
              frame.tangentU,
              this.tileLocalCoordinates[i * 2] * frame.scale,
            )
            .addScaledVector(
              frame.tangentV,
              this.tileLocalCoordinates[i * 2 + 1] * frame.scale,
            )
            .addScaledVector(frame.normal, lift * frame.scale);
          positions.setXYZ(i, point.x, point.y, point.z);
        }
        vertexColor.copy(
          role === 0
            ? faceColor
            : role === 1
              ? openSafe
                ? COLORS.openEdge
                : COLORS.edge
              : COLORS.side,
        );
        if (role === 1 && neighbors.has(cell.id))
          vertexColor.lerp(COLORS.selected, 0.2);
        colors.setXYZ(i, vertexColor.r, vertexColor.g, vertexColor.b);
      }
      geometryChanged ||= needsGeometry;
      this.drawnReveals[cell.id] = revealed;
    }
    colors.needsUpdate = true;
    if (geometryChanged) {
      positions.needsUpdate = true;
      this.tiles.geometry.computeVertexNormals();
      this.tiles.geometry.computeBoundingSphere();
    }
    this.refreshCursor();
  }

  refreshCursor() {
    if (!this.selectionOutline || !this.cellFrames) return;
    const id = this.hoverId >= 0 ? this.hoverId : this.focusId;
    this.selectionOutline.visible = id >= 0;
    if (id < 0) return;
    const frame = this.cellFrames[id];
    this.selectionOutline.position
      .copy(frame.center)
      .addScaledVector(frame.normal, frame.scale * 0.072);
    this.selectionOutline.quaternion.copy(frame.labelRotation);
    this.selectionOutline.scale.setScalar(frame.scale);
  }

  drawSymbols() {
    if (!this.presentation) return;
    this.labels = Array.from({ length: this.maxDegree }, () => []);
    let flags = 0,
      wrong = 0;
    for (const cell of this.presentation.cells) {
      if (cell.revealed && !cell.mine && cell.adjacent > 0)
        this.labels[cell.adjacent - 1]?.push(cell.id);
      const frame = this.cellFrames[cell.id];
      if (cell.wrongFlag) {
        for (const angle of [-Math.PI / 4, Math.PI / 4]) {
          this.placeSurface(
            this.wrongMarks,
            wrong++,
            frame,
            0.15,
            1,
            new THREE.Quaternion().setFromAxisAngle(UP, angle),
          );
        }
      } else if (cell.flagged && !cell.revealed) {
        this.placeSurface(this.flagPoles, flags, frame, 0.34);
        this.placeSurface(this.flagCrystals, flags, frame, 0.61);
        this.placeSurface(this.flagRings, flags, frame, 0.12);
        flags++;
      }
    }
    for (const mesh of [this.flagPoles, this.flagCrystals, this.flagRings]) {
      mesh.count = flags;
      mesh.instanceMatrix.needsUpdate = true;
    }
    this.wrongMarks.count = wrong;
    this.wrongMarks.instanceMatrix.needsUpdate = true;
    this.updateMineModels();
    this.updateLabels();
  }

  placeSurface(mesh, index, frame, lift, scale = 1, rotation = null) {
    this.dummy.position
      .copy(frame.center)
      .addScaledVector(frame.normal, lift * frame.scale);
    this.dummy.quaternion.copy(frame.rotation);
    if (rotation) this.dummy.quaternion.multiply(rotation);
    this.dummy.scale.setScalar(frame.scale * scale);
    this.dummy.updateMatrix();
    mesh.setMatrixAt(index, this.dummy.matrix);
  }

  updateLabels() {
    if (!this.labels || !this.cellFrames) return;
    this.camera.updateMatrixWorld();
    const towardCamera = this.camera.position
      .clone()
      .sub(this.controls.target)
      .normalize();
    this.visibleLabelIds = [];
    this.labels.forEach((ids, number) => {
      const mesh = this.labelMeshes[number];
      let count = 0;
      mesh.userData.cellIds = [];
      for (const id of ids) {
        const frame = this.cellFrames[id];
        if (frame.normal.dot(towardCamera) < 0.025) continue;
        this.dummy.position
          .copy(frame.center)
          .addScaledVector(frame.normal, 0.016 * frame.scale);
        // Printed digits belong to the square face; orbiting never rotates them toward the camera.
        this.dummy.quaternion.copy(frame.labelRotation);
        this.dummy.scale.setScalar(frame.scale);
        this.dummy.updateMatrix();
        mesh.setMatrixAt(count++, this.dummy.matrix);
        mesh.userData.cellIds.push(id);
        this.visibleLabelIds.push(id);
      }
      mesh.count = count;
      mesh.instanceMatrix.needsUpdate = true;
    });
  }

  updateMineModels() {
    const items = [];
    for (const cell of this.presentation.cells) {
      if (!cell.revealed || !cell.mine) continue;
      const frame = this.cellFrames[cell.id];
      const center = frame.center
        .clone()
        .addScaledVector(frame.normal, frame.scale * 0.3);
      items.push({
        id: cell.id,
        x: center.x,
        y: center.y,
        z: center.z,
        normal: frame.normal.toArray(),
        scale: frame.scale * 0.86,
        ...this.detonation.stage(cell.id),
      });
    }
    this.mines.update(items);
  }

  startSurfaceDetonation(snapshot) {
    const origin = snapshot.cells.find((cell) => cell.exploded)?.id;
    if (origin === undefined) return;
    // Dijkstra distance follows surface adjacency across face joins; the shared timeline stays unchanged.
    const distances = new Float64Array(this.count).fill(Infinity);
    const visited = new Uint8Array(this.count);
    distances[origin] = 0;
    for (let iteration = 0; iteration < this.count; iteration++) {
      let nearest = -1,
        distance = Infinity;
      for (let id = 0; id < this.count; id++) {
        if (!visited[id] && distances[id] < distance) {
          nearest = id;
          distance = distances[id];
        }
      }
      if (nearest < 0) break;
      visited[nearest] = 1;
      for (const neighbor of this.surfaceCells[nearest].neighbors) {
        const next =
          distance +
          this.cellFrames[nearest].center.distanceTo(
            this.cellFrames[neighbor].center,
          );
        if (next < distances[neighbor]) distances[neighbor] = next;
      }
    }
    this.detonation.start({
      ...snapshot,
      cells: snapshot.cells.map((cell) => ({
        ...cell,
        x: distances[cell.id],
        y: 0,
      })),
    });
  }

  advanceDetonation(delta) {
    if (!this.detonation.active) return;
    const events = this.detonation.advance(delta);
    if (events.revealed.length) {
      this.presentation = this.detonation.present(this.snapshot);
      this.drawTiles();
      this.drawSymbols();
    }
    for (const entry of events.explosions) {
      const frame = this.cellFrames[entry.id];
      const center = frame.center
        .clone()
        .addScaledVector(frame.normal, frame.scale * 0.24);
      if (!this.reducedMotion.matches)
        this.effects.flames.trigger({
          x: center.x,
          y: center.y,
          z: center.z,
          normal: frame.normal.toArray(),
          scale: frame.scale * 0.85,
        });
      const projected = center.project(this.camera);
      this.callbacks.onExplosion?.({
        index: entry.index,
        total: this.detonation.entries.length,
        pan: THREE.MathUtils.clamp(projected.x, -0.8, 0.8),
      });
    }
    this.updateMineModels();
    if (events.finished) this.callbacks.onChainComplete?.();
  }

  position(id) {
    const p = this.cellFrames?.[id]?.center;
    return p ? { x: p.x, y: p.y, z: p.z } : { x: 0, y: 0, z: 0 };
  }

  projectCell(id) {
    const frame = this.cellFrames?.[id];
    if (!frame) return { x: NaN, y: NaN, visible: false };
    this.camera.updateMatrixWorld();
    const p = frame.center
      .clone()
      .addScaledVector(frame.normal, 0.018 * frame.scale)
      .project(this.camera);
    const rect = this.renderer.domElement.getBoundingClientRect();
    const direction = this.camera.position
      .clone()
      .sub(this.controls.target)
      .normalize();
    const x = rect.left + ((p.x + 1) * rect.width) / 2;
    const y = rect.top + ((1 - p.y) * rect.height) / 2;
    return {
      x,
      y,
      visible:
        frame.normal.dot(direction) > 0.1 &&
        Math.abs(p.x) < 1 &&
        Math.abs(p.y) < 1 &&
        Math.abs(p.z) < 1 &&
        this.pick({ clientX: x, clientY: y }) === id,
    };
  }

  pick(event) {
    if (!this.colliders) return -1;
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return -1;
    this.pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      1 - ((event.clientY - rect.top) / rect.height) * 2,
    );
    this.camera.updateMatrixWorld();
    this.board.updateMatrixWorld(true);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObject(this.colliders, false)[0];
    if (!hit || hit.face.normal.dot(this.raycaster.ray.direction) >= 0)
      return -1;
    return this.triangleCellIds[hit.faceIndex] ?? -1;
  }

  focus(id) {
    if (!this.cellFrames?.[id]) return;
    this.hoverId = -1;
    this.focusId = id;
    const frame = this.cellFrames[id];
    const projection = this.projectCell(id);
    const direction = this.camera.position
      .clone()
      .sub(this.controls.target)
      .normalize();
    if (!projection.visible || frame.normal.dot(direction) < 0.42) {
      this.setCameraDirection(frame.normal, frame.center);
    }
    this.drawTiles();
    this.updateLabels();
  }

  focusCell(id) {
    this.focus(id);
  }

  setCameraDirection(direction, target = new THREE.Vector3()) {
    this.controls.stop();
    this.controls.target.copy(target);
    this.camera.position
      .copy(direction)
      .normalize()
      .multiplyScalar(Math.max(24, (this.radius || 4.3) * 4))
      .add(target);
    // 预设和键盘寻格清除旧滚转，并在极点采用稳定的上方向。
    const forward = this.camera.position.clone().sub(target).normalize();
    this.camera.up
      .copy(Math.abs(forward.y) > 0.98 ? new THREE.Vector3(0, 0, -1) : UP)
      .addScaledVector(forward, -this.camera.up.dot(forward))
      .normalize();
    this.camera.lookAt(target);
    this.updateLabels();
  }

  resetCamera(resetZoom = true) {
    if (resetZoom) this.camera.zoom = 1;
    this.setCameraDirection(
      this.topView
        ? new THREE.Vector3(0, 1, 0.001)
        : new THREE.Vector3().fromArray(
            this.topology?.viewDirection || [1.25, 0.9, 1.5],
          ),
    );
    this.resize();
    this.refreshCursor();
  }

  setTopView(value) {
    this.topView = Boolean(value);
    // Top view is a camera preset, never a restriction that makes the opposite faces unreachable.
    this.controls.enableRotate = true;
    this.resetCamera(false);
  }

  resize() {
    const width = this.container.clientWidth,
      height = this.container.clientHeight;
    if (!width || !height) return;
    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    const aspect = width / height;
    const extent = ((this.radius || 4.3) * 1.22) / Math.min(1, aspect);
    this.camera.left = -extent * aspect;
    this.camera.right = extent * aspect;
    this.camera.top = extent;
    this.camera.bottom = -extent;
    this.camera.updateProjectionMatrix();
  }

  bindEvents() {
    // Reuse tested pointer capture, multitouch cancellation, long press, and drag thresholds.
    super.bindEvents();
    // A release over a different cell is a drag even when its total screen displacement was small.
    this.releaseGuard = (event) => {
      if (this.pointerState && this.pointerState.id !== this.pick(event))
        this.pointerState.cancelled = true;
    };
    this.renderer.domElement.addEventListener("pointerup", this.releaseGuard, {
      capture: true,
    });
  }

  dispose() {
    if (this.disposed) return;
    this.renderer.domElement.removeEventListener(
      "pointerup",
      this.releaseGuard,
      { capture: true },
    );
    super.dispose();
  }
}

function hash(value) {
  const x = Math.sin(value * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function digitTexture(value) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d");
  context.font = `700 ${value > 9 ? 72 : 100}px ui-monospace, SFMono-Regular, Menlo, monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#fff4db";
  context.fillText(String(value), 64, 69);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
