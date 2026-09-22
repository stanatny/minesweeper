import { createMeteorShower } from "./meteor_shower.js";
import { createCelestialBodies } from "./celestial_bodies.js";

const DEPTHS = Object.freeze({
  galaxy: 0.99998,
  stars: 0.99996,
  planet: 0.99993,
  atmosphere: 0.99992,
  meteors: 0.9999,
});
const SKY_DISTANCE = 100;
const SKY_FOV = 60;

/**
 * Create an all-direction celestial backdrop with fixed star and planet bearings.
 * A real virtual perspective camera projects the sky independently of game zoom
 * and translation. Only its orientation follows the player's camera.
 */
export function createCosmicEnvironment(THREE) {
  const group = new THREE.Group();
  group.name = "cosmic_environment";
  group.visible = false;
  const skyRoot = new THREE.Group();
  skyRoot.name = "anchored-celestial-sky";
  group.add(skyRoot);
  const skyCamera = new THREE.PerspectiveCamera(SKY_FOV, 1, 0.1, 300);
  const cameraQuaternion = new THREE.Quaternion();
  const celestial = {
    cameraQuaternion,
    uniforms: {
      uSkyView: { value: skyCamera.matrixWorldInverse },
      uSkyProjection: { value: skyCamera.projectionMatrix },
      uSkyAspect: { value: 1 },
      uSkyTanHalfFov: { value: Math.tan((SKY_FOV * Math.PI) / 360) },
    },
  };
  const random = seededRandom(729401);
  const pixels = new Uint8Array(128 * 128);
  for (let i = 0; i < pixels.length; i++)
    pixels[i] = Math.floor(random() * 256);
  const noise = new THREE.DataTexture(pixels, 128, 128, THREE.RedFormat);
  noise.wrapS = noise.wrapT = THREE.RepeatWrapping;
  noise.magFilter = noise.minFilter = THREE.LinearFilter;
  noise.generateMipmaps = false;
  noise.needsUpdate = true;

  const tanHalfFov = celestial.uniforms.uSkyTanHalfFov.value;
  const galacticNormal = new THREE.Vector3(
    -0.3,
    1,
    0.08 * tanHalfFov,
  ).normalize();
  const galacticAlong = new THREE.Vector3(1, 0.3, 0).normalize();
  const galacticForward = new THREE.Vector3()
    .crossVectors(galacticNormal, galacticAlong)
    .normalize();
  const galaxyToAnchor = new THREE.Matrix3().set(
    galacticAlong.x,
    galacticNormal.x,
    galacticForward.x,
    galacticAlong.y,
    galacticNormal.y,
    galacticForward.y,
    galacticAlong.z,
    galacticNormal.z,
    galacticForward.z,
  );
  const galaxyFromWorld = new THREE.Matrix3();
  const cameraToWorld = new THREE.Matrix3();
  const galaxyMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uNoise: { value: noise },
      uAspect: celestial.uniforms.uSkyAspect,
      uTanHalfFov: celestial.uniforms.uSkyTanHalfFov,
      uCameraToWorld: { value: cameraToWorld },
      uGalaxyFromWorld: { value: galaxyFromWorld },
    },
    depthTest: true,
    depthWrite: false,
    toneMapped: false,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, ${DEPTHS.galaxy}, 1.0);
      }
    `,
    fragmentShader: GALAXY_FRAGMENT,
  });
  const galaxy = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), galaxyMaterial);
  galaxy.name = "milky-way";
  galaxy.renderOrder = -1000;
  galaxy.userData.farDepth = DEPTHS.galaxy;
  group.add(galaxy);

  // A full sphere needs more points than a single screen, but still uses one static draw.
  const starPositions = [],
    starColors = [],
    starSizes = [];
  const direction = new THREE.Vector3();
  for (let i = 0; i < 5200; i++) {
    const longitude = random() * Math.PI * 2;
    if (i < 2000) {
      const latitude = (random() + random() + random() - 1.5) * 0.13;
      direction
        .set(
          Math.sin(longitude) * Math.cos(latitude),
          Math.sin(latitude),
          Math.cos(longitude) * Math.cos(latitude),
        )
        .applyMatrix3(galaxyToAnchor);
    } else {
      const y = random() * 2 - 1;
      const radius = Math.sqrt(1 - y * y);
      direction.set(
        Math.cos(longitude) * radius,
        y,
        Math.sin(longitude) * radius,
      );
    }
    starPositions.push(
      direction.x * SKY_DISTANCE,
      direction.y * SKY_DISTANCE,
      direction.z * SKY_DISTANCE,
    );
    const bright = 0.16 + Math.pow(random(), 5) * 0.66;
    const warm = random() > 0.74;
    starColors.push(
      bright * (warm ? 1 : 0.73),
      bright * (warm ? 0.87 : 0.84),
      bright * (warm ? 0.66 : 1),
    );
    starSizes.push(0.7 + Math.pow(random(), 2) * 1.6);
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starPositions, 3),
  );
  starGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(starColors, 3),
  );
  starGeometry.setAttribute(
    "aSize",
    new THREE.Float32BufferAttribute(starSizes, 1),
  );
  const starMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    uniforms: {
      ...celestial.uniforms,
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(globalThis.devicePixelRatio || 1, 1.75) },
    },
    vertexShader: `
      attribute vec3 color;
      attribute float aSize;
      uniform mat4 uSkyView;
      uniform mat4 uSkyProjection;
      uniform float uTime;
      uniform float uPixelRatio;
      varying vec3 vColor;
      void main() {
        vColor = color * (0.975 + 0.025 * sin(uTime * 0.4 + position.x * 0.31));
        gl_PointSize = aSize * uPixelRatio;
        gl_Position = uSkyProjection * uSkyView * modelMatrix * vec4(position, 1.0);
        gl_Position.z = gl_Position.w * ${DEPTHS.stars};
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float radius = length(gl_PointCoord * 2.0 - 1.0);
        if (radius > 1.0) discard;
        gl_FragColor = vec4(vColor, pow(1.0 - radius, 1.35));
        #include <colorspace_fragment>
      }
    `,
  });
  const stars = new THREE.Points(starGeometry, starMaterial);
  stars.name = "background-starfield";
  stars.renderOrder = -998;
  stars.userData.farDepth = DEPTHS.stars;
  skyRoot.add(stars);

  const solarSystem = createCelestialBodies(THREE, {
    noise,
    celestial,
    depths: DEPTHS,
  });
  skyRoot.add(solarSystem.group);
  const jupiter = solarSystem.bodies.find((body) => body.id === "jupiter");
  const planet = jupiter.mesh;

  const meteors = createMeteorShower(THREE, { celestial });
  group.add(meteors.group);
  group.traverse((object) => {
    object.frustumCulled = false;
    object.userData.backgroundOnly = true;
    if (object.isMesh || object.isPoints || object.isLine)
      object.raycast = () => {};
  });
  const layout = {
    aspect: 1,
    skyFov: SKY_FOV,
    distance: SKY_DISTANCE,
    anchored: false,
    planetNdc: [0, 0],
    planetDirection: [0, 0, -1],
    planetRadiusNdc: [0, 0],
    planetVisible: false,
    depths: DEPTHS,
  };
  const rotationMatrix = new THREE.Matrix4();
  let disposed = false,
    visibleTime = 0;

  return {
    group,
    skyRoot,
    skyCamera,
    planet,
    solarSystem,
    bodies: solarSystem.bodies,
    galaxy,
    stars,
    meteors,
    layout,
    setPlanetVisible(visible) {
      solarSystem.group.visible = Boolean(visible);
    },
    update(time, reducedMotion = false, camera, delta = 0) {
      if (disposed || !camera?.isCamera) return;
      camera.updateMatrixWorld();
      camera.getWorldQuaternion(cameraQuaternion);
      const aspect =
        camera.projectionMatrix.elements[5] /
        camera.projectionMatrix.elements[0];
      if (!Number.isFinite(aspect) || aspect <= 0) return;
      skyCamera.quaternion.copy(cameraQuaternion);
      if (skyCamera.aspect !== aspect) {
        skyCamera.aspect = aspect;
        skyCamera.updateProjectionMatrix();
      }
      skyCamera.updateMatrixWorld();
      celestial.uniforms.uSkyAspect.value = aspect;
      cameraToWorld.setFromMatrix4(
        rotationMatrix.makeRotationFromQuaternion(cameraQuaternion),
      );
      if (!layout.anchored) {
        // Anchor once per scene, after the host camera has its initial fitted pose.
        skyRoot.quaternion.copy(cameraQuaternion);
        galaxyFromWorld
          .copy(galaxyToAnchor)
          .invert()
          .multiply(cameraToWorld.clone().invert());
        solarSystem.anchor({ aspect, tanHalfFov });
        layout.anchored = true;
      }
      const step = Number.isFinite(delta) ? Math.max(0, delta) : 0;
      if (!reducedMotion) visibleTime += step;
      starMaterial.uniforms.uTime.value = visibleTime;
      meteors.update(step, reducedMotion);
      group.visible = true;
      group.updateMatrixWorld(true);
      solarSystem.update(visibleTime, skyCamera);
      layout.aspect = aspect;
      layout.planetNdc = [...jupiter.ndc];
      layout.planetDirection = jupiter.direction.toArray();
      layout.planetRadiusNdc = [...jupiter.radiusNdc];
      layout.planetVisible = solarSystem.group.visible && jupiter.visible;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      meteors.dispose();
      solarSystem.dispose();
      for (const geometry of [galaxy.geometry, starGeometry])
        geometry.dispose();
      for (const material of [galaxyMaterial, starMaterial]) material.dispose();
      noise.dispose();
      group.removeFromParent();
      group.clear();
    },
  };
}

const NOISE = `
  uniform sampler2D uNoise;
  float square(float value) { return value * value; }
  float noise2(vec2 p) {
    vec2 cell = floor(p), fraction = fract(p);
    fraction = fraction * fraction * (3.0 - 2.0 * fraction);
    vec2 uv = (cell + 0.5) / 128.0;
    float a = texture2D(uNoise, uv).r;
    float b = texture2D(uNoise, uv + vec2(1.0 / 128.0, 0.0)).r;
    float c = texture2D(uNoise, uv + vec2(0.0, 1.0 / 128.0)).r;
    float d = texture2D(uNoise, uv + vec2(1.0 / 128.0)).r;
    return mix(mix(a, b, fraction.x), mix(c, d, fraction.x), fraction.y);
  }
  float fbm(vec2 p) {
    float value = 0.0;
    value += noise2(p) * 0.55;
    value += noise2(p * 2.03 + 11.7) * 0.27;
    value += noise2(p * 4.11 + 27.1) * 0.12;
    value += noise2(p * 8.17 + 5.4) * 0.06;
    return value;
  }
`;

const GALAXY_FRAGMENT = `
  uniform float uAspect;
  uniform float uTanHalfFov;
  uniform mat3 uCameraToWorld;
  uniform mat3 uGalaxyFromWorld;
  varying vec2 vUv;
  ${NOISE}
  void main() {
    vec2 screen = vUv * 2.0 - 1.0;
    vec3 ray = normalize(vec3(screen.x * uAspect * uTanHalfFov, screen.y * uTanHalfFov, -1.0));
    vec3 celestial = uGalaxyFromWorld * uCameraToWorld * ray;
    float along = atan(celestial.x, celestial.z);
    float crossBand = asin(clamp(celestial.y, -1.0, 1.0)) / uTanHalfFov;
    // Circular noise coordinates meet continuously at the longitude seam behind the observer.
    float broadNoise = fbm(vec2(sin(along) * 5.5 + crossBand * 7.0, cos(along) * 5.5 - crossBand * 3.0) + 18.3);
    float knots = fbm(vec2(sin(along) * 18.0 + crossBand * 23.0, cos(along) * 18.0 - crossBand * 11.0) + 41.7);
    float warp = (broadNoise - 0.5) * 0.13;
    float haze = exp(-square((crossBand + warp) / 0.26));
    float spine = exp(-square((crossBand + warp * 0.55) / 0.115));
    float clouds = haze * (0.25 + broadNoise * 0.75) + spine * knots * 0.45;
    float dustOffset = crossBand + 0.024 + (knots - 0.5) * 0.075;
    float dust = exp(-square(dustOffset / 0.036)) * (0.35 + broadNoise * 0.65);
    vec3 base = vec3(0.0025, 0.005, 0.009);
    vec3 blue = vec3(0.028, 0.039, 0.065);
    vec3 ivory = vec3(0.072, 0.061, 0.073);
    vec3 cloudColor = mix(blue, ivory, smoothstep(0.38, 0.72, knots));
    vec3 color = base + cloudColor * clouds * (1.0 - dust * 0.86);
    color += vec3(0.005, 0.004, 0.009) * haze * (1.0 - dust);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

function seededRandom(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
