// createCosmicEnvironment 创建全部由程序生成的远景，不依赖图片或额外渲染通道。
// 参数：THREE 为宿主使用的 Three.js 模块；返回场景组、逐帧更新及资源释放方法。
export function createCosmicEnvironment(THREE) {
  const group = new THREE.Group();
  group.name = "cosmic_environment";
  // 沿默认相机的左上方布景；压低世界坐标以避开大尺寸棋盘，同时保留可见的半球轮廓。
  const planetPosition = new THREE.Vector3(-20, -12, -19);
  const planetGeometry = new THREE.SphereGeometry(6.1, 64, 32);
  const planetMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uLight: { value: new THREE.Vector3(-0.9, 0.48, -0.25).normalize() },
    },
    vertexShader: `
      varying vec3 vLocalPosition;
      varying vec3 vWorldNormal;
      void main() {
        vLocalPosition = position;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uLight;
      varying vec3 vLocalPosition;
      varying vec3 vWorldNormal;
      float hash(vec3 p) {
        p = fract(p * 0.3183099 + vec3(0.11, 0.23, 0.37));
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }
      float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                       mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                   mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                       mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
      }
      float terrain(vec3 p) {
        return noise(p) * 0.56 + noise(p * 2.07 + 4.2) * 0.27 + noise(p * 4.11 + 8.3) * 0.12 + noise(p * 8.2) * 0.05;
      }
      void main() {
        vec3 p = normalize(vLocalPosition);
        float ground = terrain(p * 4.7);
        float fine = noise(p * 35.0);
        float basin = smoothstep(0.38, 0.64, ground);
        vec3 ocean = vec3(0.017, 0.07, 0.11);
        vec3 rock = mix(vec3(0.10, 0.16, 0.20), vec3(0.33, 0.40, 0.44), basin);
        vec3 surface = mix(ocean, rock, smoothstep(0.43, 0.53, ground));
        surface *= 0.83 + fine * 0.32;
        float clouds = smoothstep(0.57, 0.76, terrain(p * 8.5 + vec3(2.0, 1.0, 5.0)));
        surface = mix(surface, vec3(0.53, 0.66, 0.72), clouds * 0.7);
        float light = dot(normalize(vWorldNormal), uLight);
        float day = smoothstep(-0.16, 0.72, light);
        vec3 color = surface * (0.04 + day * 0.38);
        color += vec3(0.01, 0.033, 0.05) * smoothstep(-0.25, 0.12, light) * (1.0 - day);
        gl_FragColor = vec4(color, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  planet.position.copy(planetPosition);
  planet.scale.setScalar(0.85);
  planet.rotation.set(0.18, 0.45, -0.25);
  group.add(planet);

  // 共用球面几何，仅额外渲染一次大气；柔和边缘不会形成遮挡棋盘的实心光盘。
  const atmosphereMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    uniforms: {
      uLight: { value: new THREE.Vector3(-0.9, 0.48, -0.25).normalize() },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vNormal = normalize(mat3(modelMatrix) * normal);
        vView = cameraPosition - world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: `
      uniform vec3 uLight;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec3 normal = normalize(vNormal);
        float edge = pow(1.0 - abs(dot(normal, normalize(vView))), 4.0);
        float sun = smoothstep(-0.45, 0.65, dot(normal, uLight));
        vec3 color = mix(vec3(0.08, 0.15, 0.34), vec3(0.28, 0.73, 0.87), sun);
        gl_FragColor = vec4(color * 1.35, edge * (0.16 + sun * 0.44));
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const atmosphere = new THREE.Mesh(planetGeometry, atmosphereMaterial);
  atmosphere.position.copy(planetPosition);
  atmosphere.scale.setScalar(0.873);
  group.add(atmosphere);

  // 尘带与星群合并成一次透明绘制；所有点位于棋盘后方，支持正交与透视相机。
  const random = seededRandom(729401);
  const positions = [];
  const colors = [];
  const sizes = [];
  const kinds = [];
  for (let i = 0; i < 880; i++) {
    const dust = i < 220;
    let horizontal, vertical, distance;
    if (dust) {
      const along = (random() - 0.5) * 85;
      horizontal = along;
      vertical = along * 0.17 + (random() + random() - 1) * 6 + 5;
      distance = 39 + random() * 14;
    } else {
      horizontal = (random() - 0.5) * 105;
      vertical = (random() - 0.5) * 70;
      distance = 34 + random() * 60;
    }
    // 默认镜头的横纵轴布景，再沿视线后移，避免尘带落到可见范围之外。
    positions.push(
      horizontal * 0.85 - vertical * 0.332 - distance * 0.409,
      vertical * 0.777 - distance * 0.629,
      -horizontal * 0.526 - vertical * 0.536 - distance * 0.66,
    );
    const violet = random() < 0.34;
    const strength = dust
      ? 0.1 + random() * 0.12
      : 0.55 + Math.pow(random(), 5) * 1.4;
    colors.push(
      0.54 * strength,
      (violet ? 0.51 : 0.77) * strength,
      (violet ? 0.86 : 0.92) * strength,
    );
    sizes.push(dust ? 13 + random() * 32 : 1 + random() * 1.9);
    kinds.push(dust ? 1 : 0);
  }
  const starsGeometry = new THREE.BufferGeometry();
  starsGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  starsGeometry.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(colors, 3),
  );
  starsGeometry.setAttribute(
    "aSize",
    new THREE.Float32BufferAttribute(sizes, 1),
  );
  starsGeometry.setAttribute(
    "aDust",
    new THREE.Float32BufferAttribute(kinds, 1),
  );
  const starsMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(globalThis.devicePixelRatio || 1, 1.75) },
    },
    vertexShader: `
      attribute vec3 color;
      attribute float aSize;
      attribute float aDust;
      uniform float uTime;
      uniform float uPixelRatio;
      varying vec3 vColor;
      varying float vDust;
      void main() {
        float shimmer = 0.91 + 0.09 * sin(uTime * 0.55 + position.x * 1.7);
        vColor = color * mix(shimmer, 1.0, aDust);
        vDust = aDust;
        gl_PointSize = aSize * uPixelRatio;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vDust;
      void main() {
        vec2 p = gl_PointCoord * 2.0 - 1.0;
        float radius = length(p);
        if (radius > 1.0) discard;
        float alpha = mix(pow(1.0 - radius, 1.5), exp(-radius * radius * 5.5) * pow(1.0 - radius, 1.2) * 0.27, vDust);
        gl_FragColor = vec4(vColor, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const stars = new THREE.Points(starsGeometry, starsMaterial);
  stars.frustumCulled = false;
  group.add(stars);

  const fragmentGeometry = new THREE.IcosahedronGeometry(0.35, 0);
  const fragmentMaterial = new THREE.MeshStandardMaterial({
    color: "#344650",
    roughness: 0.95,
    metalness: 0.1,
  });
  const fragments = new THREE.InstancedMesh(
    fragmentGeometry,
    fragmentMaterial,
    24,
  );
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 24; i++) {
    dummy.position.set(
      (random() - 0.5) * 45,
      -4 + random() * 11,
      -17 - random() * 13,
    );
    dummy.rotation.set(random() * 6, random() * 6, random() * 6);
    const scale = 0.25 + random() * 0.7;
    dummy.scale.set(scale * 1.5, scale * 0.65, scale);
    dummy.updateMatrix();
    fragments.setMatrixAt(i, dummy.matrix);
  }
  fragments.instanceMatrix.needsUpdate = true;
  group.add(fragments);

  let disposed = false;
  return {
    group,
    // time 使用秒；减少动态效果时保持静止，同时保留完整光照与背景。
    update(time, reducedMotion = false) {
      if (disposed) return;
      const seconds = Number.isFinite(time) ? time : 0;
      starsMaterial.uniforms.uTime.value = reducedMotion ? 0 : seconds;
      planet.rotation.y = 0.45 + (reducedMotion ? 0 : seconds * 0.003);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      fragments.dispose();
      planetGeometry.dispose();
      planetMaterial.dispose();
      atmosphereMaterial.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
      fragmentGeometry.dispose();
      fragmentMaterial.dispose();
      group.removeFromParent();
      group.clear();
    },
  };
}

// 固定随机种子让重开棋局及截图比较时的远景保持一致。
function seededRandom(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
