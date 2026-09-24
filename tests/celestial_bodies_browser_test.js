import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { orbitToDirection } from "./orbit_helpers.js";
import { assertDefaultSurface } from "./board_mode_helpers.js";

const BASE_URL = process.env.SURVEY_TEST_URL || "http://127.0.0.1:8765";
const errors = [];
const results = [];
await mkdir("artifacts", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });

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
  await assertDefaultSurface(page);
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
    const direction = await page.evaluate(
      (bodyId) =>
        window.__surveyTest
          .getScene()
          .cosmos.bodies.find((body) => body.id === bodyId)
          .direction.toArray()
          .map((value) => -value),
      id,
    );
    await orbitToDirection(page, direction, {
      minDot: 0.999999,
      steps: 24,
      stepDelay: 18,
    });
    const target = await page.evaluate((bodyId) => {
      const scene = window.__surveyTest.getScene();
      const body = scene.cosmos.bodies.find((item) => item.id === bodyId);
      const extent =
        bodyId === "saturn" ? 2.45 : bodyId === "sun" ? 1.75 : 1.18;
      const desiredX = Math.min(0.72, 0.96 - body.radiusNdc[0] * extent);
      const desiredY = Math.min(0.57, 0.96 - body.radiusNdc[1] * extent);
      const tanHalfFov = Math.tan((scene.cosmos.skyCamera.fov * Math.PI) / 360);
      const offset = scene.camera.position
        .clone()
        .sub(scene.controls.target)
        .normalize();
      const right = offset
        .clone()
        .set(1, 0, 0)
        .applyQuaternion(scene.camera.quaternion);
      const up = offset
        .clone()
        .set(0, 1, 0)
        .applyQuaternion(scene.camera.quaternion);
      // 使用当前屏幕坐标偏侧取景，保留自由旋转后的滚转，不重设世界 up。
      return offset
        .addScaledVector(
          right,
          desiredX * scene.cosmos.skyCamera.aspect * tanHalfFov,
        )
        .addScaledVector(up, desiredY * tanHalfFov)
        .normalize()
        .toArray();
    }, id);
    await orbitToDirection(page, target, {
      minDot: 0.999999,
      steps: 24,
      stepDelay: 18,
    });
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
