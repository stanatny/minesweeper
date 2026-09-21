// MineModels batches visible mechanical mines; callers supply only items the player is allowed to see.
// constructor accepts the host Three.js module and the maximum mine capacity.
// update accepts { id, x, z, y = 0.35, stage, progress, normal?, scale? }; the default normal is +Y and scale is 1.
export class MineModels {
  constructor(THREE, capacity) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new RangeError("Mine capacity must be a positive integer");
    }
    this.THREE = THREE;
    this.capacity = capacity;
    this.group = new THREE.Group();
    this.group.name = "mechanical_mines";
    this.dummy = new THREE.Object3D();
    this.direction = new THREE.Vector3();
    this.up = new THREE.Vector3(0, 1, 0);
    this.color = new THREE.Color();
    this.itemTransform = new THREE.Matrix4();
    this.itemTranslation = new THREE.Matrix4();
    this.outputMatrix = new THREE.Matrix4();
    this.itemOrigin = new THREE.Vector3();
    this.itemNormal = new THREE.Vector3();
    this.itemScale = new THREE.Vector3();
    this.itemRotation = new THREE.Quaternion();
    this.disposed = false;

    const armor = new THREE.MeshStandardMaterial({
      color: "#39434a",
      metalness: 0.82,
      roughness: 0.36,
      side: THREE.DoubleSide,
    });
    const hardware = new THREE.MeshStandardMaterial({
      color: "#6e777b",
      metalness: 0.9,
      roughness: 0.3,
    });
    const tips = new THREE.MeshStandardMaterial({
      color: "#c0a58b",
      metalness: 0.88,
      roughness: 0.29,
    });
    const ember = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const charred = new THREE.MeshStandardMaterial({
      color: "#14191c",
      metalness: 0.35,
      roughness: 0.93,
    });

    // Four shell segments share one curved surface; vertical gaps and polar openings reveal the separate core.
    this.parts = {
      armorPetals: this.createInstances(
        "mine_armor_petals",
        new THREE.SphereGeometry(
          0.255,
          12,
          12,
          0.085,
          Math.PI / 2 - 0.17,
          0.24,
          Math.PI - 0.48,
        ),
        armor,
        capacity * 4,
      ),
      reactorCores: this.createInstances(
        "mine_reactor_cores_and_fuse_lights",
        new THREE.SphereGeometry(0.19, 14, 10),
        ember,
        capacity * 2,
      ),
      equatorSeams: this.createInstances(
        "mine_equator_and_residual_heat",
        new THREE.TorusGeometry(0.257, 0.012, 5, 32),
        ember,
        capacity,
      ),
      sensorCollars: this.createInstances(
        "mine_sensor_collars",
        new THREE.CylinderGeometry(0.039, 0.052, 0.064, 8),
        hardware,
        capacity * 6,
      ),
      sensorTips: this.createInstances(
        "mine_short_contact_sensors",
        new THREE.ConeGeometry(0.04, 0.095, 8),
        tips,
        capacity * 6,
      ),
      fuseHousings: this.createInstances(
        "mine_top_fuse_housings",
        new THREE.CylinderGeometry(0.071, 0.092, 0.1, 10),
        hardware,
        capacity,
      ),
      spentBases: this.createInstances(
        "mine_spent_bases",
        new THREE.CylinderGeometry(0.265, 0.3, 0.065, 10),
        charred,
        capacity,
      ),
      spentFragments: this.createInstances(
        "mine_broken_armor_fragments",
        new THREE.IcosahedronGeometry(0.115, 0),
        charred,
        capacity * 4,
      ),
    };
  }

  // update replaces the entire instance batch without reading hidden board answers or retaining omitted mines from the previous update.
  update(items) {
    if (this.disposed) return;
    if (!Array.isArray(items))
      throw new TypeError("Mine items must be an array");
    if (items.length > this.capacity)
      throw new RangeError("Mine items exceed capacity");
    const counts = Object.fromEntries(
      Object.keys(this.parts).map((name) => [name, 0]),
    );
    for (const item of items) {
      const { x, z, y = 0.35, stage = "armed" } = item;
      if (![x, y, z].every(Number.isFinite))
        throw new TypeError("Mine coordinates must be finite");
      if (!["armed", "primed", "spent"].includes(stage))
        throw new RangeError("Unknown mine stage");
      const normal = item.normal ?? [0, 1, 0];
      const scale = item.scale ?? 1;
      if (
        !Array.isArray(normal) ||
        normal.length !== 3 ||
        !normal.every(Number.isFinite)
      )
        throw new TypeError(
          "Mine normal must contain three finite coordinates",
        );
      if (!Number.isFinite(scale) || scale <= 0)
        throw new RangeError("Mine scale must be positive and finite");
      this.itemNormal.fromArray(normal);
      if (this.itemNormal.lengthSq() < 1e-12)
        throw new RangeError("Mine normal must be nonzero");
      this.itemRotation.setFromUnitVectors(
        this.up,
        this.itemNormal.normalize(),
      );
      this.itemOrigin.set(x, y, z);
      this.itemScale.setScalar(scale);
      this.itemTransform.compose(
        this.itemOrigin,
        this.itemRotation,
        this.itemScale,
      );
      this.itemTransform.multiply(
        this.itemTranslation.makeTranslation(-x, -y, -z),
      );
      const progress = Number.isFinite(item.progress)
        ? Math.max(0, Math.min(1, item.progress))
        : 0;
      const primed = stage === "primed";
      const pulse = primed ? 0.5 + Math.sin(progress * Math.PI * 5) * 0.5 : 0;
      const expansion = primed ? 1 + progress * 0.05 + pulse * 0.012 : 1;

      if (stage === "spent") {
        const floor = y - 0.225;
        this.place(this.parts.spentBases, counts.spentBases++, x, floor, z);
        this.dummy.rotation.set(-Math.PI / 2, 0, 0);
        this.place(
          this.parts.equatorSeams,
          counts.equatorSeams,
          x,
          floor + 0.038,
          z,
          0.84,
          0.84,
          0.42,
          true,
        );
        this.parts.equatorSeams.setColorAt(
          counts.equatorSeams++,
          this.color.setRGB(0.38 * (1 - progress * 0.7), 0.018, 0.004),
        );
        for (let shard = 0; shard < 4; shard++) {
          const angle = (shard * Math.PI) / 2 + 0.31;
          const distance = 0.14 + (shard % 2) * 0.045;
          this.dummy.rotation.set(0.12 * shard, angle, 0.19 * (shard - 1.5));
          this.place(
            this.parts.spentFragments,
            counts.spentFragments++,
            x + Math.cos(angle) * distance,
            floor + 0.043,
            z + Math.sin(angle) * distance,
            1.05,
            0.34,
            0.78,
            true,
          );
        }
        continue;
      }

      for (let petal = 0; petal < 4; petal++) {
        this.dummy.rotation.set(0, (petal * Math.PI) / 2, 0);
        this.place(
          this.parts.armorPetals,
          counts.armorPetals++,
          x,
          y,
          z,
          expansion,
          expansion,
          expansion,
          true,
        );
      }
      const heat = primed ? 2.4 + progress * 1.9 + pulse * 0.8 : 1.4;
      this.color.setRGB(heat, heat * (primed ? 0.035 : 0.085), 0.012);
      this.place(
        this.parts.reactorCores,
        counts.reactorCores,
        x,
        y,
        z,
        expansion,
        expansion,
        expansion,
      );
      this.parts.reactorCores.setColorAt(counts.reactorCores++, this.color);
      this.place(
        this.parts.fuseHousings,
        counts.fuseHousings++,
        x,
        y + 0.257 * expansion,
        z,
      );
      this.place(
        this.parts.reactorCores,
        counts.reactorCores,
        x,
        y + 0.312 * expansion,
        z,
        0.28,
        0.055,
        0.28,
      );
      this.parts.reactorCores.setColorAt(counts.reactorCores++, this.color);

      this.dummy.rotation.set(-Math.PI / 2, 0, 0);
      this.place(
        this.parts.equatorSeams,
        counts.equatorSeams,
        x,
        y,
        z,
        expansion,
        expansion,
        expansion,
        true,
      );
      this.parts.equatorSeams.setColorAt(
        counts.equatorSeams++,
        this.color.setRGB(heat * 0.8, heat * (primed ? 0.03 : 0.075), 0.005),
      );

      // Six short contact fuses ring the equator, each with a collar and tapered tip; the overall diameter stays below 0.75.
      for (let sensor = 0; sensor < 6; sensor++) {
        const angle = (sensor * Math.PI) / 3 + Math.PI / 6;
        this.direction.set(Math.cos(angle), 0.07, Math.sin(angle)).normalize();
        this.dummy.quaternion.setFromUnitVectors(this.up, this.direction);
        const collarRadius = 0.249 * expansion;
        this.place(
          this.parts.sensorCollars,
          counts.sensorCollars++,
          x + this.direction.x * collarRadius,
          y + this.direction.y * collarRadius,
          z + this.direction.z * collarRadius,
          1,
          1,
          1,
          true,
        );
        this.dummy.quaternion.setFromUnitVectors(this.up, this.direction);
        const tipRadius = 0.3 * expansion;
        this.place(
          this.parts.sensorTips,
          counts.sensorTips++,
          x + this.direction.x * tipRadius,
          y + this.direction.y * tipRadius,
          z + this.direction.z * tipRadius,
          1,
          1,
          1,
          true,
        );
      }
    }
    for (const [name, mesh] of Object.entries(this.parts)) {
      mesh.count = counts[name];
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }

  // dispose releases instance matrices, shared materials, and geometry; repeated calls are safe.
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    const materials = new Set();
    for (const mesh of Object.values(this.parts)) {
      mesh.dispose();
      mesh.geometry.dispose();
      materials.add(mesh.material);
    }
    for (const material of materials) material.dispose();
    this.group.removeFromParent();
    this.group.clear();
  }

  // createInstances batches each part type into one draw and allocates instance capacity only during construction.
  createInstances(name, geometry, material, capacity) {
    const mesh = new this.THREE.InstancedMesh(geometry, material, capacity);
    mesh.name = name;
    mesh.count = 0;
    mesh.instanceMatrix.setUsage(this.THREE.DynamicDrawUsage);
    this.group.add(mesh);
    return mesh;
  }

  // place resets the previous part rotation unless keepRotation preserves a sensor or shell orientation.
  place(mesh, index, x, y, z, sx = 1, sy = 1, sz = 1, keepRotation = false) {
    this.dummy.position.set(x, y, z);
    if (!keepRotation) this.dummy.rotation.set(0, 0, 0);
    this.dummy.scale.set(sx, sy, sz);
    this.dummy.updateMatrix();
    // Rotate and scale every part around this mine's center, preserving the original local design.
    this.outputMatrix.multiplyMatrices(this.itemTransform, this.dummy.matrix);
    mesh.setMatrixAt(index, this.outputMatrix);
  }
}
