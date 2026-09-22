import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const BASE_URL = process.env.SURVEY_TEST_URL || "http://127.0.0.1:8765";
const errors = [];
const results = [];
await mkdir("artifacts", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });

async function orbitTo(page, direction) {
  const gesture = await page.evaluate((target) => {
    const scene = window.__surveyTest.getScene();
    const rect = scene.renderer.domElement.getBoundingClientRect();
    const theta = Math.atan2(target[0], target[2]);
    const phi = Math.acos(target[1] / Math.hypot(...target));
    const deltaTheta = Math.atan2(
      Math.sin(theta - scene.controls.getAzimuthalAngle()),
      Math.cos(theta - scene.controls.getAzimuthalAngle()),
    );
    const factor = rect.height / (2 * Math.PI * scene.controls.rotateSpeed);
    const dx = -deltaTheta * factor;
    const dy = -(phi - scene.controls.getPolarAngle()) * factor;
    return {
      x: rect.x + rect.width / 2 - dx / 2,
      y: rect.y + rect.height / 2 - dy / 2,
      dx,
      dy,
    };
  }, direction);
  if (Math.hypot(gesture.dx, gesture.dy) > 6) {
    await page.mouse.move(gesture.x, gesture.y);
    await page.mouse.down();
    for (let step = 1; step <= 24; step++) {
      await page.mouse.move(
        gesture.x + (gesture.dx * step) / 24,
        gesture.y + (gesture.dy * step) / 24,
      );
      await page.waitForTimeout(18);
    }
    await page.mouse.up();
  }
  await page.waitForFunction((target) => {
    const scene = window.__surveyTest.getScene();
    const current = scene.camera.position
      .clone()
      .sub(scene.controls.target)
      .normalize();
    return (
      current.dot(current.clone().fromArray(target).normalize()) > 0.999999
    );
  }, direction);
}

async function snapshot(page) {
  return page.evaluate(() => {
    const scene = window.__surveyTest.getScene();
    return scene.cosmos.bodies.map((body) => ({
      id: body.id,
      direction: body.direction.toArray(),
      ndc: [...body.ndc],
      radiusNdc: [...body.radiusNdc],
      visible: body.visible,
      phase: body.material.uniforms.uPhase.value,
      backgroundOnly: body.mesh.userData.backgroundOnly,
      hasRing: Boolean(body.ring),
      hasCorona: Boolean(body.corona),
    }));
  });
}

async function measureSilhouette(page, id) {
  return page.evaluate(async (bodyId) => {
    const THREE = await import("/node_modules/three/build/three.module.js");
    const scene = window.__surveyTest.getScene();
    const body = scene.cosmos.bodies.find((item) => item.id === bodyId);
    const renderer = scene.renderer;
    const dimensions = renderer.getDrawingBufferSize(new THREE.Vector2());
    const target = new THREE.WebGLRenderTarget(dimensions.x, dimensions.y);
    const isolated = new THREE.Scene();
    // 复用生产材质和世界矩阵，读取真实 GPU alpha 轮廓，不用几何尺寸冒充像素验收。
    const mesh = new THREE.Mesh(body.mesh.geometry, body.material);
    mesh.matrixAutoUpdate = false;
    mesh.matrix.copy(body.mesh.matrixWorld);
    mesh.frustumCulled = false;
    isolated.add(mesh);
    const previous = renderer.getRenderTarget();
    const clearColor = renderer.getClearColor(new THREE.Color());
    const clearAlpha = renderer.getClearAlpha();
    const pixels = new Uint8Array(dimensions.x * dimensions.y * 4);
    try {
      renderer.setRenderTarget(target);
      renderer.setClearColor(0, 0);
      renderer.clear();
      renderer.render(isolated, scene.camera);
      renderer.readRenderTargetPixels(
        target,
        0,
        0,
        dimensions.x,
        dimensions.y,
        pixels,
      );
    } finally {
      renderer.setRenderTarget(previous);
      renderer.setClearColor(clearColor, clearAlpha);
      target.dispose();
      isolated.clear();
    }
    let xMin = dimensions.x,
      yMin = dimensions.y,
      xMax = -1,
      yMax = -1,
      area = 0;
    for (let y = 0; y < dimensions.y; y++) {
      for (let x = 0; x < dimensions.x; x++) {
        if (pixels[(y * dimensions.x + x) * 4 + 3] < 128) continue;
        xMin = Math.min(xMin, x);
        xMax = Math.max(xMax, x);
        yMin = Math.min(yMin, y);
        yMax = Math.max(yMax, y);
        area++;
      }
    }
    const width = xMax - xMin + 1,
      height = yMax - yMin + 1;
    return {
      id: bodyId,
      width,
      height,
      area,
      ratio: width / height,
      discCoverage: area / ((Math.PI * width * height) / 4),
      ndc: [...body.ndc],
    };
  }, id);
}

try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(`${BASE_URL}/?test=1`, { waitUntil: "networkidle" });
  await page.locator("#board-mode").selectOption("surface");
  await page.waitForFunction(
    () => window.__surveyTest?.getScene()?.cosmos?.bodies?.length === 10,
  );
  await page.waitForTimeout(250);
  const initial = await snapshot(page);
  assert.deepEqual(
    initial.map((body) => body.id).sort(),
    [
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
    ].sort(),
  );
  assert.ok(initial.every((body) => body.backgroundOnly));
  assert.equal(initial.find((body) => body.id === "saturn").hasRing, true);
  assert.equal(initial.find((body) => body.id === "sun").hasCorona, true);
  const initialMask = await measureSilhouette(page, "jupiter");
  assert.ok(
    Math.abs(initialMask.ratio - 1) < 0.025,
    JSON.stringify(initialMask),
  );
  assert.ok(
    Math.abs(initialMask.discCoverage - 1) < 0.045,
    JSON.stringify(initialMask),
  );
  await page.screenshot({ path: "artifacts/solar_initial.png" });
  const originalGame = await page.evaluate(() =>
    JSON.stringify(window.__surveyTest.getGame().cells),
  );
  await page.evaluate(() => {
    const canvas = window.__surveyTest.getScene().renderer.domElement;
    const stream = canvas.captureStream(24);
    window.__solarChunks = [];
    window.__solarRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
      videoBitsPerSecond: 4500000,
    });
    window.__solarRecorder.ondataavailable = (event) => {
      if (event.data.size) window.__solarChunks.push(event.data);
    };
    window.__solarRecorder.start();
  });
  for (const id of [
    "jupiter",
    "earth",
    "mars",
    "neptune",
    "pluto",
    "saturn",
    "sun",
    "mercury",
    "venus",
    "uranus",
  ]) {
    const target = await page.evaluate((bodyId) => {
      const body = window.__surveyTest
        .getScene()
        .cosmos.bodies.find((item) => item.id === bodyId);
      const [x, y, z] = body.direction.toArray();
      const bearingYaw = Math.atan2(x, -z);
      const elevation = Math.asin(y);
      const aspect = window.__surveyTest.getScene().cosmos.skyCamera.aspect;
      const tanHalfFov = Math.tan(Math.PI / 6);
      const desiredY =
        (elevation >= 0 ? 1 : -1) * (Math.abs(elevation) > 1.05 ? 0.82 : 0.57);
      const ry = desiredY * tanHalfFov;
      // 把目标放在侧上方，保持真实拖拽，同时让棋盘外的完整圆轮廓可见。
      const maxRx = Math.sqrt(
        (1 + ry * ry) * Math.max(0, 1 / (y * y || 1e-9) - 1),
      );
      const rx = Math.min(0.78 * aspect * tanHalfFov, maxRx * 0.9);
      const normalization = Math.sqrt(1 + rx * rx + ry * ry);
      const qx = rx / normalization,
        qy = ry / normalization,
        qf = 1 / normalization;
      const aimElevation =
        Math.asin(y / Math.hypot(qy, qf)) - Math.atan2(qy, qf);
      const yaw =
        bearingYaw -
        Math.atan2(
          qx,
          qf * Math.cos(aimElevation) - qy * Math.sin(aimElevation),
        );
      return [
        -Math.sin(yaw) * Math.cos(aimElevation),
        -Math.sin(aimElevation),
        Math.cos(yaw) * Math.cos(aimElevation),
      ];
    }, id);
    await orbitTo(page, target);
    await page.waitForTimeout(150);
    const current = await snapshot(page);
    const body = current.find((item) => item.id === id);
    assert.equal(
      body.visible,
      true,
      `${id} must be reachable with real orbit input`,
    );
    for (const item of current) {
      const original = initial.find((candidate) => candidate.id === item.id);
      assert.ok(
        Math.hypot(
          ...item.direction.map(
            (value, index) => value - original.direction[index],
          ),
        ) < 1e-8,
      );
      assert.equal(
        item.phase,
        original.phase,
        "Reduced motion must freeze decorative surface movement",
      );
    }
    const silhouette = await measureSilhouette(page, id);
    assert.ok(
      silhouette.width > 30,
      `${id} must remain visible at real display size`,
    );
    assert.ok(
      Math.abs(silhouette.ratio - 1) < 0.035,
      JSON.stringify(silhouette),
    );
    assert.ok(
      Math.abs(silhouette.discCoverage - 1) < 0.05,
      JSON.stringify(silhouette),
    );
    assert.equal(
      await page.evaluate(() =>
        JSON.stringify(window.__surveyTest.getGame().cells),
      ),
      originalGame,
    );
    await page.screenshot({ path: `artifacts/solar_${id}.png` });
    const rect = await page.locator("#scene-stage canvas").boundingBox();
    const extent = id === "saturn" ? 2.45 : id === "sun" ? 1.75 : 1.18;
    const radius = ((body.radiusNdc[1] * rect.height) / 2) * extent;
    const cx = rect.x + ((body.ndc[0] + 1) * rect.width) / 2;
    const cy = rect.y + ((1 - body.ndc[1]) * rect.height) / 2;
    const clip = {
      x: Math.max(rect.x, cx - radius),
      y: Math.max(rect.y, cy - radius),
      width:
        Math.min(rect.x + rect.width, cx + radius) -
        Math.max(rect.x, cx - radius),
      height:
        Math.min(rect.y + rect.height, cy + radius) -
        Math.max(rect.y, cy - radius),
    };
    await page.screenshot({ path: `artifacts/solar_${id}_detail.png`, clip });
    results.push({ ...body, silhouette });
    console.log(
      `PASS ${id}: fixed bearing, real orbit, circular GPU silhouette ${silhouette.width}×${silhouette.height}`,
    );
    await page.waitForTimeout(450);
  }
  const recording = await page.evaluate(async () => {
    await new Promise((resolve) => {
      window.__solarRecorder.onstop = resolve;
      window.__solarRecorder.stop();
    });
    const blob = new Blob(window.__solarChunks, {
      type: "video/webm",
    });
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(blob);
    });
  });
  await writeFile(
    "artifacts/solar_orbit.webm",
    Buffer.from(recording, "base64"),
  );
  await page.locator("#reset-camera").click();
  await page.waitForTimeout(550);
  const returned = await snapshot(page);
  for (const body of returned) {
    const original = initial.find((item) => item.id === body.id);
    assert.ok(
      Math.hypot(
        ...body.ndc.map((value, index) => value - original.ndc[index]),
      ) < 0.005,
    );
  }
  await page
    .locator("#scene-stage canvas")
    .screenshot({ path: "artifacts/solar_video_cover.png" });
  assert.deepEqual(errors, []);
  await writeFile(
    "artifacts/celestial_bodies_metrics.json",
    JSON.stringify(
      {
        initialJupiter: initialMask,
        bodies: results,
        resetReturned: true,
        errors,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "PASS all ten bodies return to fixed bearings; no browser errors",
  );
} finally {
  await browser.close();
}
