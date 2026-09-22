import { createCelestialMaterials } from "./celestial_materials.js";

const DISTANCE = 100;
const APPARENT_SIZE_SCALE = 1.4;
const CATALOG = Object.freeze([
  {
    id: "jupiter",
    name: "Jupiter",
    radius: 6.4,
    yaw: 30,
    elevation: 20,
    tilt: 0.03,
  },
  {
    id: "earth",
    name: "Earth",
    radius: 4.8,
    yaw: 83,
    elevation: 19,
    tilt: 0.24,
  },
  {
    id: "saturn",
    name: "Saturn",
    radius: 4.5,
    yaw: 169,
    elevation: 22,
    tilt: -0.48,
  },
  { id: "sun", name: "Sun", radius: 6.9, yaw: -111, elevation: 26, tilt: 0 },
  {
    id: "mercury",
    name: "Mercury",
    radius: 2.5,
    yaw: -76,
    elevation: -23,
    tilt: 0.04,
  },
  {
    id: "venus",
    name: "Venus",
    radius: 4,
    yaw: -25,
    elevation: -44,
    tilt: -0.12,
  },
  {
    id: "mars",
    name: "Mars",
    radius: 3.4,
    yaw: 144,
    elevation: -32,
    tilt: 0.18,
  },
  {
    id: "uranus",
    name: "Uranus",
    radius: 3.5,
    yaw: -43,
    elevation: 68,
    tilt: 1.25,
  },
  {
    id: "neptune",
    name: "Neptune",
    radius: 3.7,
    yaw: 73,
    elevation: -67,
    tilt: -0.18,
  },
  {
    id: "pluto",
    name: "Pluto",
    radius: 2.6,
    yaw: -139,
    elevation: -55,
    tilt: 0.3,
  },
]);

/** 创建固定天球方位的星体；中心服从透视投影，局部球面保持等像素圆形。 */
export function createCelestialBodies(THREE, { noise, celestial, depths }) {
  const group = new THREE.Group();
  group.name = "solar-system-scenery";
  const geometry = new THREE.PlaneGeometry(2, 2);
  const ringGeometry = new THREE.RingGeometry(1.27, 2.26, 128);
  const factory = createCelestialMaterials(THREE, {
    noise,
    sharedUniforms: celestial.uniforms,
    vertexShader: BODY_VERTEX,
  });
  const extraMaterials = [];
  const bodies = CATALOG.map((definition) => {
    // 统一放大可见直径，球面与附属的环、日冕共用同一个角半径。
    const angularRadius = Math.atan(
      Math.tan(THREE.MathUtils.degToRad(definition.radius)) *
        APPARENT_SIZE_SCALE,
    );
    const material = factory.createBodyMaterial(definition.id);
    Object.assign(material.uniforms, {
      uAngularRadius: { value: angularRadius },
      uExtent: { value: 1 },
      uFarDepth: { value: depths.planet },
    });
    material.depthTest = true;
    material.depthWrite = true;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = definition.id;
    mesh.renderOrder = -999;
    mesh.userData.farDepth = depths.planet;
    group.add(mesh);
    const body = {
      ...definition,
      mesh,
      material,
      angularRadius,
      ring: null,
      corona: null,
      direction: new THREE.Vector3(),
      light: new THREE.Vector3(),
      ndc: [0, 0],
      radiusNdc: [0, 0],
      visible: false,
    };
    if (definition.id === "saturn") {
      const ringMaterial = new THREE.ShaderMaterial({
        uniforms: material.uniforms,
        vertexShader: RING_VERTEX,
        fragmentShader: RING_FRAGMENT,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.name = "saturn-rings";
      ring.renderOrder = -997;
      ring.userData.farDepth = depths.planet;
      group.add(ring);
      extraMaterials.push(ringMaterial);
      body.ring = ring;
    }
    if (definition.id === "sun") {
      const coronaMaterial = new THREE.ShaderMaterial({
        uniforms: {
          ...material.uniforms,
          uExtent: { value: 1.8 },
          uFarDepth: { value: depths.planet + 0.000001 },
        },
        vertexShader: BODY_VERTEX,
        fragmentShader: CORONA_FRAGMENT,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: true,
        depthWrite: false,
        toneMapped: false,
      });
      const corona = new THREE.Mesh(geometry, coronaMaterial);
      corona.name = "solar-corona";
      corona.renderOrder = -997;
      corona.userData.farDepth = depths.planet + 0.000001;
      group.add(corona);
      extraMaterials.push(coronaMaterial);
      body.corona = corona;
    }
    return body;
  });
  const cameraRight = new THREE.Vector3();
  const right = new THREE.Vector3();
  const up = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const center = new THREE.Vector3();
  const viewCenter = new THREE.Vector3();
  const projected = new THREE.Vector3();
  const inverseBody = new THREE.Matrix3();
  let anchored = false;
  let disposed = false;

  group.traverse((object) => {
    object.frustumCulled = false;
    object.userData.backgroundOnly = true;
    if (object.isMesh) object.raycast = () => {};
  });

  return {
    group,
    bodies,
    anchor({ aspect, tanHalfFov }) {
      if (anchored || disposed) return;
      for (const body of bodies) {
        const yaw = THREE.MathUtils.degToRad(body.yaw);
        const elevation = THREE.MathUtils.degToRad(body.elevation);
        body.mesh.position.set(
          Math.sin(yaw) * Math.cos(elevation),
          Math.sin(elevation),
          -Math.cos(yaw) * Math.cos(elevation),
        );
        if (body.id === "jupiter")
          body.mesh.position.set(
            0.68 * aspect * tanHalfFov,
            0.66 * tanHalfFov,
            -1,
          );
        body.mesh.position.normalize().multiplyScalar(DISTANCE);
        forward.copy(body.mesh.position).negate().normalize();
        right.set(1, 0, 0).addScaledVector(forward, -forward.x).normalize();
        up.crossVectors(forward, right).normalize();
        const rotation = new THREE.Matrix4().makeBasis(right, up, forward);
        body.mesh.quaternion.setFromRotationMatrix(rotation);
        body.mesh.rotateZ(body.tilt);
        // 土星环既有倾斜，也有朝向观察者的开口，前后半环会正确遮挡球体。
        if (body.id === "saturn") body.mesh.rotateX(0.48);
        for (const ornament of [body.ring, body.corona]) {
          if (!ornament) continue;
          ornament.position.copy(body.mesh.position);
          ornament.quaternion.copy(body.mesh.quaternion);
        }
      }
      group.updateWorldMatrix(true, true);
      // 每颗星体固定侧上方补光，转动视角不会让照明贴着屏幕移动。
      for (const body of bodies)
        body.light
          .set(-0.5, 0.4, 0.7)
          .normalize()
          .applyQuaternion(
            body.mesh.getWorldQuaternion(new THREE.Quaternion()),
          );
      anchored = true;
    },
    update(time, skyCamera) {
      if (!anchored || disposed) return;
      group.updateWorldMatrix(true, true);
      cameraRight.set(1, 0, 0).applyQuaternion(skyCamera.quaternion);
      const aspect = celestial.uniforms.uSkyAspect.value;
      const tanHalfFov = celestial.uniforms.uSkyTanHalfFov.value;
      for (const body of bodies) {
        body.mesh.getWorldPosition(center);
        body.direction.copy(center).normalize();
        forward.copy(body.direction).negate();
        right
          .copy(cameraRight)
          .addScaledVector(forward, -cameraRight.dot(forward));
        if (right.lengthSq() < 0.000001)
          right.set(0, 1, 0).addScaledVector(forward, -forward.y);
        right.normalize();
        up.crossVectors(forward, right).normalize();
        const uniforms = body.material.uniforms;
        uniforms.uViewRight.value.copy(right);
        uniforms.uViewUp.value.copy(up);
        uniforms.uViewForward.value.copy(forward);
        uniforms.uWorldToBody.value.copy(
          inverseBody.setFromMatrix4(body.mesh.matrixWorld).invert(),
        );
        uniforms.uSunDirection.value.copy(body.light);
        uniforms.uPhase.value = time * (body.id === "sun" ? 0.022 : 0.0016);
        projected.copy(center).project(skyCamera);
        viewCenter.copy(center).applyMatrix4(skyCamera.matrixWorldInverse);
        const radiusY = Math.tan(body.angularRadius) / tanHalfFov;
        body.ndc[0] = projected.x;
        body.ndc[1] = projected.y;
        body.radiusNdc[0] = radiusY / aspect;
        body.radiusNdc[1] = radiusY;
        const extent = body.ring ? 2.26 : body.corona ? 1.8 : 1;
        body.visible =
          viewCenter.z < 0 &&
          Math.abs(projected.x) < 1 + (radiusY * extent) / aspect &&
          Math.abs(projected.y) < 1 + radiusY * extent;
        body.mesh.visible = body.visible;
        if (body.ring) body.ring.visible = body.visible;
        if (body.corona) body.corona.visible = body.visible;
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      factory.dispose();
      for (const material of extraMaterials) material.dispose();
      geometry.dispose();
      ringGeometry.dispose();
      group.removeFromParent();
      group.clear();
    },
  };
}

const PROJECTION = `
  uniform mat4 uSkyView;
  uniform mat4 uSkyProjection;
  uniform float uSkyAspect;
  uniform float uSkyTanHalfFov;
  uniform float uAngularRadius;
  uniform float uFarDepth;
  vec4 projectDisc(vec2 offset, float depthOffset) {
    vec4 center = uSkyView * modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    if (center.z >= -0.001) return vec4(2.0, 2.0, 2.0, 1.0);
    vec4 clip = uSkyProjection * center;
    float radius = tan(uAngularRadius) / uSkyTanHalfFov;
    vec2 point = clip.xy / clip.w + offset * radius / vec2(uSkyAspect, 1.0);
    return vec4(point, uFarDepth + depthOffset, 1.0);
  }
`;

const BODY_VERTEX = `
  ${PROJECTION}
  uniform float uExtent;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectDisc(position.xy * uExtent, 0.0);
  }
`;

const RING_VERTEX = `
  ${PROJECTION}
  uniform vec3 uViewRight;
  uniform vec3 uViewUp;
  uniform vec3 uViewForward;
  varying float vRadius;
  varying float vLight;
  void main() {
    vec3 world = mat3(modelMatrix) * vec3(position.x, 0.0, position.y);
    vec2 offset = vec2(dot(world, uViewRight), dot(world, uViewUp));
    float front = dot(world, uViewForward);
    vRadius = length(position.xy);
    vLight = 0.82 + 0.18 * smoothstep(-1.0, 1.0, position.x);
    gl_Position = projectDisc(offset, -front * 0.000002);
  }
`;

const RING_FRAGMENT = `
  varying float vRadius;
  varying float vLight;
  void main() {
    float bands = 0.72 + 0.16 * sin(vRadius * 140.0) + 0.08 * sin(vRadius * 391.0);
    float cassini = smoothstep(1.86, 1.89, vRadius) * (1.0 - smoothstep(1.93, 1.96, vRadius));
    float rim = smoothstep(1.27, 1.34, vRadius) * (1.0 - smoothstep(2.17, 2.26, vRadius));
    vec3 color = mix(vec3(0.26, 0.18, 0.095), vec3(0.54, 0.43, 0.28), bands) * vLight;
    float alpha = rim * (0.52 + bands * 0.26) * (1.0 - cassini * 0.94);
    gl_FragColor = vec4(color, alpha);
    #include <colorspace_fragment>
  }
`;

const CORONA_FRAGMENT = `
  uniform float uPhase;
  varying vec2 vUv;
  void main() {
    vec2 point = (vUv * 2.0 - 1.0) * 1.8;
    float radius = length(point);
    if (radius < 1.0 || radius > 1.8) discard;
    float angle = atan(point.y, point.x);
    float rays = 0.72 + 0.12 * sin(angle * 17.0 + uPhase) + 0.08 * sin(angle * 37.0 - uPhase);
    float alpha = exp(-(radius - 1.0) * 8.5) * (1.0 - smoothstep(1.45, 1.8, radius)) * rays * 0.38;
    gl_FragColor = vec4(vec3(0.70, 0.27, 0.055), alpha);
    #include <colorspace_fragment>
  }
`;
