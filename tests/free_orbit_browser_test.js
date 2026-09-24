import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { verifyInputCancellation } from "./input_cancel_checks.js";

const BASE_URL = process.env.SURVEY_TEST_URL || "http://127.0.0.1:8765";
const checks = [];
const errors = [];
const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);

async function settle(page) {
  await page.evaluate(async () => {
    let stable = 0;
    let previous = null;
    for (let frame = 0; frame < 240; frame++) {
      await new Promise(requestAnimationFrame);
      const camera = window.__surveyTest.getScene().camera;
      const current = [
        ...camera.position.toArray(),
        ...camera.up.toArray(),
        camera.zoom,
      ];
      if (
        previous &&
        current.every((value, i) => Math.abs(value - previous[i]) < 1e-7)
      )
        stable++;
      else stable = 0;
      if (stable >= 5) return;
      previous = current;
    }
    throw new Error("Camera did not settle");
  });
}

async function pose(page) {
  return page.evaluate(() => {
    const scene = window.__surveyTest.getScene();
    return {
      direction: scene.camera.position
        .clone()
        .sub(scene.controls.target)
        .normalize()
        .toArray(),
      up: scene.camera.up.toArray(),
      quaternion: scene.camera.quaternion.toArray(),
      sky: scene.cosmos.skyCamera.quaternion.toArray(),
      target: scene.controls.target.toArray(),
      zoom: scene.camera.zoom,
      cells: JSON.stringify(window.__surveyTest.getGame().cells),
    };
  });
}

async function open(page) {
  page.on("pageerror", (error) => errors.push(error.message));
  page.setDefaultTimeout(15000);
  await page.goto(`${BASE_URL}/?test=1`);
  await page.waitForFunction(() => window.__surveyTest?.getScene()?.renderer);
  if (!(await page.locator("#board-mode").isVisible()))
    await page.locator("#settings-btn").click();
  assert.deepEqual(
    await page
      .locator("#board-mode option")
      .evaluateAll((options) => options.map((option) => option.value)),
    ["plane", "surface"],
    "Only planar ruins and faceted solids may be selected",
  );
  await page.locator("#board-mode").selectOption("surface");
  await page.waitForFunction(
    () => document.body.dataset.boardMode === "surface",
  );
  await settle(page);
}

async function drag(page, axis, sign = 1) {
  const r = await page.locator("#scene-stage canvas").boundingBox();
  const distance = Math.min(r.height * 0.26, r.width * 0.3) * sign;
  const dx = axis === "horizontal" ? distance : 0;
  const dy = axis === "vertical" ? distance : 0;
  const x = r.x + r.width * 0.5 - dx / 2;
  const y = r.y + r.height * 0.5 - dy / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 18 });
  await page.mouse.up();
  await settle(page);
  return pose(page);
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  await mkdir("artifacts", { recursive: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await open(page);
  const initial = await pose(page);
  for (const axis of ["vertical", "horizontal"]) {
    let previous = await pose(page);
    let total = 0;
    const path = [];
    for (let step = 0; step < 10; step++) {
      const current = await drag(page, axis);
      const angle = Math.acos(
        Math.max(-1, Math.min(1, dot(previous.direction, current.direction))),
      );
      assert.ok(
        angle > 0.2,
        `surface ${axis} rotation stopped at gesture ${step}`,
      );
      total += angle;
      assert.equal(
        current.cells,
        initial.cells,
        "Dragging must not reveal or flag cells",
      );
      assert.ok(
        Math.abs(dot(current.up, current.direction)) < 1e-6,
        "Camera up remains perpendicular to view",
      );
      assert.ok(
        Math.abs(dot(current.quaternion, current.sky)) > 0.99999,
        "Background follows the complete camera orientation",
      );
      path.push(current.direction);
      previous = current;
    }
    assert.ok(
      total > Math.PI * 2,
      "Rotation must continue beyond a full revolution",
    );
    checks.push({
      mode: "surface",
      axis,
      revolutions: total / (Math.PI * 2),
      path,
    });
  }
  await page.locator("#reset-camera").click();
  await settle(page);
  const reset = await pose(page);
  assert.ok(dot(reset.direction, initial.direction) > 0.999999);
  assert.ok(
    dot(reset.up, initial.up) > 0.999999,
    "Reset clears the previous roll",
  );
  await page.locator("#top-view").click();
  await settle(page);
  const top = await pose(page);
  const afterTop = await drag(page, "vertical");
  assert.ok(
    dot(top.direction, afterTop.direction) < 0.95,
    "Top view remains freely rotatable",
  );
  await page.screenshot({ path: "artifacts/free_orbit_surface.png" });
  await page.close();

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const mobile = await context.newPage();
  await open(mobile);
  const cdp = await context.newCDPSession(mobile);
  const rect = await mobile.locator("#scene-stage canvas").boundingBox();
  const x = rect.x + rect.width / 2,
    y = rect.y + rect.height / 2;
  const start = await pose(mobile);
  let previous = start;
  let total = 0;
  for (let gesture = 0; gesture < 9; gesture++) {
    const distance = Math.min(150, rect.height * 0.3);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y: y - distance / 2, id: 1 }],
    });
    for (let step = 1; step <= 12; step++) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [
          { x, y: y - distance / 2 + (distance * step) / 12, id: 1 },
        ],
      });
    }
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await settle(mobile);
    const current = await pose(mobile);
    const angle = Math.acos(
      Math.max(-1, Math.min(1, dot(previous.direction, current.direction))),
    );
    assert.ok(angle > 0.2, "Touch rotation must not stop at a pole");
    total += angle;
    previous = current;
  }
  assert.ok(total > Math.PI * 2);
  assert.equal(previous.cells, start.cells);
  const touchPair = (offset, spread) => [
    { x: x - spread, y: y + offset, id: 1 },
    { x: x + spread, y: y + offset, id: 2 },
  ];
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: touchPair(-40, 35),
  });
  for (let step = 1; step <= 12; step++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: touchPair(-40 + step * 6, 35 + step * 3),
    });
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await settle(mobile);
  const pinched = await pose(mobile);
  assert.ok(
    dot(pinched.direction, previous.direction) < 0.99,
    "Two fingers still orbit",
  );
  assert.ok(pinched.zoom > previous.zoom * 1.2, "Pinching still zooms");
  assert.deepEqual(
    pinched.target,
    start.target,
    "Two-finger gestures must not pan the body out of view",
  );
  assert.equal(pinched.cells, start.cells);
  checks.push({
    mode: "surface",
    input: "touch",
    revolutions: total / (Math.PI * 2),
    zoom: pinched.zoom,
  });
  await mobile.screenshot({ path: "artifacts/free_orbit_mobile.png" });
  await verifyInputCancellation(mobile, cdp);
  checks.push({
    input: "touch",
    cancellation: "pointercancel and lostpointercapture",
  });
  await context.close();
  assert.deepEqual(errors, []);
  await writeFile(
    "artifacts/free_orbit_metrics.json",
    JSON.stringify({ checks, errors }, null, 2) + "\n",
  );
  console.log(
    `PASS ${checks.length} continuous rotation checks (mouse, touch, poles, reset, background, pinch)`,
  );
} finally {
  await browser.close();
}
