const BODY_KINDS = Object.freeze([
  "sun",
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
]);

/**
 * 创建太阳、八大行星与冥王星的程序化球面材质工厂。
 * 参数：THREE 为宿主 Three.js；noise 为共享的 128×128 平滑噪声纹理；
 * sharedUniforms 为投影共享参数；vertexShader 必须输出 vUv。
 * 返回：按英文 kind 创建独立材质的方法，以及释放已创建材质的方法。
 * 噪声纹理由调用方持有，本工厂不会释放它；环与日冕由宿主另行绘制。
 */
export function createCelestialMaterials(
  THREE,
  { noise, sharedUniforms = {}, vertexShader },
) {
  if (!noise?.isTexture)
    throw new TypeError("A shared noise texture is required");
  if (typeof vertexShader !== "string" || !vertexShader.trim())
    throw new TypeError("A vertex shader providing vUv is required");
  const materials = new Set();
  let disposed = false;

  // 投影矩阵保留共享引用；球体朝向、切向基与自转相位按星体独立。
  const independent = (name, fallback) => {
    const value = sharedUniforms[name]?.value ?? fallback;
    return { value: value?.clone ? value.clone() : value };
  };

  return {
    createBodyMaterial(kind) {
      if (disposed) throw new Error("Celestial materials have been disposed");
      const index = BODY_KINDS.indexOf(kind);
      if (index < 0)
        throw new RangeError(`Unknown celestial body: ${String(kind)}`);
      const material = new THREE.ShaderMaterial({
        name: `celestial-${kind}-surface`,
        defines: { BODY_KIND: index },
        uniforms: {
          ...sharedUniforms,
          uNoise: { value: noise },
          uWorldToBody: independent("uWorldToBody", new THREE.Matrix3()),
          uViewRight: independent("uViewRight", new THREE.Vector3(1, 0, 0)),
          uViewUp: independent("uViewUp", new THREE.Vector3(0, 1, 0)),
          uViewForward: independent("uViewForward", new THREE.Vector3(0, 0, 1)),
          uSunDirection: independent(
            "uSunDirection",
            new THREE.Vector3(-0.65, 0.48, 0.58).normalize(),
          ),
          uPhase: independent("uPhase", 0),
        },
        vertexShader,
        fragmentShader: BODY_FRAGMENT,
        transparent: true,
        depthTest: true,
        depthWrite: true,
        toneMapped: false,
      });
      material.userData.celestialKind = kind;
      materials.add(material);
      return material;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const material of materials) material.dispose();
      materials.clear();
    },
  };
}

// 星体在球面坐标中采样三维方向，绕经度一圈仍连续，不产生贴图接缝。
const BODY_FRAGMENT = /* glsl */ `
  uniform sampler2D uNoise;
  uniform mat3 uWorldToBody;
  uniform vec3 uViewRight;
  uniform vec3 uViewUp;
  uniform vec3 uViewForward;
  uniform vec3 uSunDirection;
  uniform float uPhase;
  varying vec2 vUv;

  float square(float x) { return x * x; }
  float noise2(vec2 p) {
    vec2 cell = floor(p);
    vec2 fraction = fract(p);
    fraction = fraction * fraction * (3.0 - 2.0 * fraction);
    return texture2D(uNoise, (cell + 0.5 + fraction) / 128.0).r;
  }
  float fbm(vec2 p) {
    return noise2(p) * 0.55
      + noise2(p * 2.03 + 11.7) * 0.27
      + noise2(p * 4.11 + 27.1) * 0.12
      + noise2(p * 8.17 + 5.4) * 0.06;
  }
  float surfaceNoise(vec3 p) {
    return fbm(p.xy + vec2(p.z * 0.73, p.z * 1.37)) * 0.6
      + fbm(p.yz + vec2(p.x * 1.19, p.x * 0.41)) * 0.4;
  }
  float wrappedLongitude(float longitude) {
    return atan(sin(longitude), cos(longitude));
  }
  float oval(vec2 uv, vec2 center, vec2 radii) {
    vec2 delta = uv - center;
    delta.x = wrappedLongitude(delta.x);
    delta /= radii;
    return 1.0 - smoothstep(0.72, 1.13, dot(delta, delta));
  }
  float craterRelief(vec3 p) {
    float relief = 0.0;
    for (int i = 0; i < 12; i++) {
      float index = float(i) + 1.0;
      vec3 center = normalize(vec3(
        sin(index * 12.71), sin(index * 4.13 + 1.0), cos(index * 8.31)
      ));
      float radius = 0.07 + fract(sin(index * 17.23) * 431.7) * 0.17;
      float distanceToRim = length(p - center) / radius;
      float bowl = 1.0 - smoothstep(0.42, 0.9, distanceToRim);
      float rim = exp(-square((distanceToRim - 1.02) * 8.5));
      relief += rim * 0.12 - bowl * 0.19;
    }
    return relief;
  }

  void main() {
    vec2 disc = vUv * 2.0 - 1.0;
    float radiusSquared = dot(disc, disc);
    if (radiusSquared >= 1.0) discard;
    float facing = sqrt(max(0.0, 1.0 - radiusSquared));
    vec3 normalWorld = normalize(
      disc.x * uViewRight + disc.y * uViewUp + facing * uViewForward
    );
    vec3 body = normalize(uWorldToBody * normalWorld);
    float sine = sin(uPhase), cosine = cos(uPhase);
    body.xz = mat2(cosine, -sine, sine, cosine) * body.xz;
    vec2 uv = vec2(atan(body.x, body.z), asin(clamp(body.y, -1.0, 1.0)));
    vec3 surface;
    vec3 atmosphere = vec3(0.0);
    float fill = 0.31;

    #if BODY_KIND == 0
      // 太阳：赭金颗粒、暗色太阳黑子与温和临边变暗，避免纯白光饼。
      float granules = surfaceNoise(body * 31.0);
      float cells = surfaceNoise(body * 70.0);
      float broad = surfaceNoise(body * 5.0);
      surface = mix(vec3(0.48, 0.14, 0.018), vec3(0.88, 0.49, 0.105), granules);
      surface *= 0.86 + cells * 0.23 + broad * 0.11;
      float spots = oval(uv, vec2(-0.33, 0.18), vec2(0.06, 0.045))
        + oval(uv, vec2(-0.25, 0.22), vec2(0.037, 0.028));
      surface *= 1.0 - clamp(spots, 0.0, 1.0) * 0.62;
      surface *= 0.61 + 0.39 * pow(facing, 0.45);

    #elif BODY_KIND == 1
      // 水星：灰褐岩面、大小不同的撞击坑与细碎明暗。
      float terrain = surfaceNoise(body * 9.0);
      surface = mix(vec3(0.22, 0.205, 0.175), vec3(0.47, 0.435, 0.365), terrain);
      surface += craterRelief(body);
      surface *= 0.9 + surfaceNoise(body * 43.0) * 0.2;
      fill = 0.34;

    #elif BODY_KIND == 2
      // 金星：完全覆盖表面的淡金云层，宽云带与细涡纹并存。
      float turbulence = surfaceNoise(body * vec3(4.0, 10.0, 4.0));
      float flow = uv.y * 13.0 + sin(uv.x * 3.0) * 0.8 + turbulence * 4.7;
      float clouds = 0.5 + 0.5 * sin(flow);
      surface = mix(vec3(0.51, 0.35, 0.16), vec3(0.81, 0.69, 0.43), clouds * 0.53 + turbulence * 0.47);
      surface *= 0.94 + surfaceNoise(body * 24.0) * 0.12;
      atmosphere = vec3(0.045, 0.032, 0.012);

    #elif BODY_KIND == 3
      // 地球：蓝海、可辨识的大陆分布、极地与独立白云层。
      float terrain = surfaceNoise(body * 11.0);
      float broad = surfaceNoise(body * 4.0);
      vec2 coast = uv + vec2(terrain - 0.5, broad - 0.5) * 0.17;
      float land = oval(coast, vec2(-1.68, 0.65), vec2(0.68, 0.38));
      land = max(land, oval(coast, vec2(-1.04, -0.38), vec2(0.30, 0.63)));
      land = max(land, oval(coast, vec2(0.14, 0.02), vec2(0.39, 0.59)));
      land = max(land, oval(coast, vec2(0.3, 0.68), vec2(0.60, 0.27)));
      land = max(land, oval(coast, vec2(1.13, 0.56), vec2(0.87, 0.40)));
      land = max(land, oval(coast, vec2(2.21, -0.51), vec2(0.40, 0.24)));
      land = smoothstep(0.38, 0.64, land + (terrain - 0.5) * 0.17);
      vec3 ocean = mix(vec3(0.025, 0.095, 0.23), vec3(0.045, 0.20, 0.37), broad);
      float desert = oval(uv, vec2(0.30, 0.25), vec2(0.46, 0.23));
      vec3 ground = mix(vec3(0.10, 0.25, 0.14), vec3(0.39, 0.33, 0.18), terrain);
      ground = mix(ground, vec3(0.53, 0.42, 0.23), desert * 0.76);
      surface = mix(ocean, ground, land);
      float ice = smoothstep(1.01, 1.24, abs(uv.y));
      surface = mix(surface, vec3(0.78, 0.83, 0.81), ice);
      float cloudNoise = surfaceNoise(body * vec3(10.0, 15.0, 10.0));
      float clouds = smoothstep(0.54, 0.69, cloudNoise + sin(uv.y * 19.0 + broad * 5.0) * 0.055);
      surface = mix(surface, vec3(0.82, 0.85, 0.83), clouds * 0.82);
      atmosphere = vec3(0.015, 0.065, 0.11);
      fill = 0.34;

    #elif BODY_KIND == 4
      // 火星：铁锈红地貌、暗色峡谷与小面积极冠。
      float terrain = surfaceNoise(body * 8.0);
      surface = mix(vec3(0.27, 0.09, 0.044), vec3(0.66, 0.30, 0.12), terrain);
      float canyon = exp(-square((uv.y + 0.13 + sin(uv.x * 4.0) * 0.035) / 0.024));
      canyon *= oval(uv, vec2(0.06, -0.13), vec2(0.63, 0.23));
      surface *= 1.0 - canyon * 0.36;
      surface += craterRelief(body) * 0.32;
      surface *= 0.93 + surfaceNoise(body * 39.0) * 0.14;
      float ice = smoothstep(1.20, 1.36, abs(uv.y) + (terrain - 0.5) * 0.1);
      surface = mix(surface, vec3(0.65, 0.62, 0.52), ice);
      atmosphere = vec3(0.028, 0.008, 0.003);

    #elif BODY_KIND == 5
      // 木星：周期连续的赤道云带与南半球椭圆大红斑。
      float turbulence = surfaceNoise(body * vec3(4.0, 11.0, 4.0));
      float flow = uv.y + (turbulence - 0.5) * 0.07 + sin(uv.x * 5.0 + uv.y * 13.0) * 0.01;
      float northBelt = exp(-square((flow - 0.24) / 0.09));
      float southBelt = exp(-square((flow + 0.22) / 0.10));
      float bandWave = 0.5 + 0.5 * sin(flow * 18.0 + 0.8);
      float belts = clamp(northBelt * 0.9 + southBelt * 0.82 + bandWave * bandWave * bandWave * 0.42, 0.0, 1.0);
      surface = mix(vec3(0.67, 0.57, 0.42), vec3(0.33, 0.18, 0.083), belts);
      surface *= 0.91 + sin(flow * 38.0 + turbulence * 2.5) * 0.045 + turbulence * 0.15;
      surface *= 0.95 + surfaceNoise(body * vec3(48.0, 100.0, 48.0)) * 0.10;
      vec2 spot = vec2(wrappedLongitude(uv.x + 0.35) / 0.235, (uv.y + 0.34) / 0.112);
      float radius = length(spot);
      float swirl = sin(atan(spot.y, spot.x) * 2.0 + radius * 13.0 - turbulence * 2.0);
      float edge = 1.0 - smoothstep(0.8, 1.16, radius + swirl * 0.055);
      float rim = exp(-square((radius - 1.02) / 0.18));
      surface = mix(surface, vec3(0.76, 0.60, 0.38), rim * 0.32);
      vec3 redSpot = mix(vec3(0.35, 0.09, 0.035), vec3(0.62, 0.26, 0.11), 0.4 + swirl * 0.17 + turbulence * 0.25);
      surface = mix(surface, redSpot, edge * 0.95);
      atmosphere = vec3(0.022, 0.018, 0.010);

    #elif BODY_KIND == 6
      // 土星：低对比的暖浅金云带，辨识重点由宿主独立绘制的环承担。
      float turbulence = surfaceNoise(body * vec3(3.0, 9.0, 3.0));
      float bands = 0.5 + 0.5 * sin(uv.y * 28.0 + turbulence * 2.2);
      surface = mix(vec3(0.59, 0.47, 0.27), vec3(0.82, 0.72, 0.47), bands * 0.42 + turbulence * 0.38);
      float equator = exp(-square(uv.y / 0.28));
      surface = mix(surface, vec3(0.76, 0.67, 0.45), equator * 0.24);
      atmosphere = vec3(0.032, 0.025, 0.012);

    #elif BODY_KIND == 7
      // 天王星：柔和青瓷色与极弱云带，避免与海王星同为深蓝。
      float turbulence = surfaceNoise(body * vec3(3.0, 7.0, 3.0));
      surface = mix(vec3(0.24, 0.48, 0.49), vec3(0.43, 0.68, 0.65), turbulence);
      surface *= 0.98 + sin(uv.y * 17.0 + turbulence) * 0.022;
      atmosphere = vec3(0.016, 0.055, 0.061);
      fill = 0.34;

    #elif BODY_KIND == 8
      // 海王星：饱和钴蓝、深色风暴与少量明亮高云。
      float turbulence = surfaceNoise(body * vec3(5.0, 9.0, 5.0));
      float bands = 0.5 + 0.5 * sin(uv.y * 16.0 + turbulence * 2.2);
      surface = mix(vec3(0.034, 0.085, 0.29), vec3(0.095, 0.27, 0.61), bands * 0.38 + turbulence * 0.50);
      float storm = oval(uv, vec2(-0.27, -0.22), vec2(0.27, 0.105));
      surface = mix(surface, vec3(0.035, 0.073, 0.18), storm * 0.77);
      float cloud = exp(-square((uv.y + 0.38 + sin(uv.x * 3.0) * 0.018) / 0.014));
      cloud *= oval(uv, vec2(0.1, -0.38), vec2(0.44, 0.08));
      surface = mix(surface, vec3(0.60, 0.72, 0.79), cloud * 0.58);
      atmosphere = vec3(0.008, 0.023, 0.082);
      fill = 0.39;

    #else
      // 冥王星：冷暖斑驳地貌与浅色心形区域，区别于小型岩质水星。
      float terrain = surfaceNoise(body * 8.0);
      surface = mix(vec3(0.22, 0.12, 0.095), vec3(0.63, 0.47, 0.33), terrain);
      surface *= 0.92 + surfaceNoise(body * 28.0) * 0.15;
      vec2 heart = vec2(wrappedLongitude(uv.x - 0.03) / 0.43, (uv.y + 0.08) / 0.37);
      float base = dot(heart, heart) - 1.0;
      float shape = base * base * base - heart.x * heart.x * heart.y * heart.y * heart.y;
      float ice = 1.0 - smoothstep(-0.07, 0.07, shape + (terrain - 0.5) * 0.10);
      surface = mix(surface, vec3(0.79, 0.74, 0.62), ice * 0.95);
      fill = 0.37;
    #endif

    #if BODY_KIND != 0
      // 保留不同相位与立体光照，同时用柔和填充避免背光面融入背景。
      float sun = dot(normalWorld, normalize(uSunDirection));
      float terminator = smoothstep(-0.18, 0.16, sun);
      float lighting = fill + terminator * (0.13 + max(0.0, sun) * 0.53);
      float limb = 0.69 + 0.31 * pow(facing, 0.42);
      surface = max(surface, vec3(0.0)) * lighting * limb;
      float atmosphereRim = square(1.0 - facing);
      surface += atmosphere * atmosphereRim * (0.28 + terminator * 0.45);
    #endif

    // 圆盘边缘只做像素级抗锯齿，不扩大发光轮廓或制造额外光环。
    float aa = max(fwidth(radiusSquared) * 1.2, 0.0015);
    float alpha = 1.0 - smoothstep(1.0 - aa, 1.0, radiusSquared);
    if (alpha < 0.005) discard;
    gl_FragColor = vec4(clamp(surface, 0.0, 0.92), alpha);
    #include <colorspace_fragment>
  }
`;
