import assert from "node:assert/strict";
import { Quaternion, Vector3 } from "three";

// 仅计算真实鼠标手势；相机位置、朝向、up 和目标均通过测试接口只读获取。
export function planOrbitGesture(state, target) {
  const direction = new Vector3()
    .fromArray(state.position)
    .sub(new Vector3().fromArray(state.target))
    .normalize();
  const desired = new Vector3().fromArray(target).normalize();
  const orientation = new Quaternion().fromArray(state.quaternion);
  const right = new Vector3(1, 0, 0).applyQuaternion(orientation);
  const up = new Vector3(0, 1, 0).applyQuaternion(orientation);
  const cosine = Math.max(-1, Math.min(1, direction.dot(desired)));
  const angle = Math.acos(cosine);
  const axis = new Vector3().crossVectors(direction, desired);
  // 对跖方向没有唯一最短路径，选当前屏幕的上轴，避免引入世界极角。
  if (axis.lengthSq() < 1e-16) axis.copy(up);
  else axis.normalize();
  const pixels = state.rect.height / (2 * Math.PI * state.rotateSpeed);
  let dx = -axis.dot(up) * angle * pixels;
  let dy = -axis.dot(right) * angle * pixels;
  const left = Math.max(0, state.rect.left);
  const top = Math.max(0, state.rect.top);
  const width = Math.min(state.viewport.width, state.rect.right) - left;
  const height = Math.min(state.viewport.height, state.rect.bottom) - top;
  assert.ok(width > 40 && height > 40, "The orbit canvas must be visible");
  const fraction = Math.min(
    1,
    (width * 0.75) / (Math.abs(dx) || 1),
    (height * 0.75) / (Math.abs(dy) || 1),
  );
  dx *= fraction;
  dy *= fraction;
  const expected = direction.clone().applyAxisAngle(axis, angle * fraction);
  return {
    x: left + width / 2 - dx / 2,
    y: top + height / 2 - dy / 2,
    dx,
    dy,
    expected: expected.toArray(),
    cosine,
  };
}

/**
 * 用屏幕局部轴上的最短旋转抵达指定视线方向，保留自由相机已有的滚转。
 * 参数 direction 是从 controls.target 指向相机的世界方向；返回实际手势证据。
 */
export async function orbitToDirection(
  page,
  direction,
  { minDot = 0.9999995, steps = 16, stepDelay = 0 } = {},
) {
  assert.ok(direction.length === 3 && direction.every(Number.isFinite));
  assert.ok(Math.hypot(...direction) > 0);
  await page.locator("#scene-stage canvas").scrollIntoViewIfNeeded();
  await waitForCameraRest(page);
  const gestures = [];
  for (let attempt = 0; attempt < 8; attempt++) {
    const state = await page.evaluate(() => {
      const scene = window.__surveyTest.getScene();
      const rect = scene.renderer.domElement.getBoundingClientRect();
      return {
        position: scene.camera.position.toArray(),
        target: scene.controls.target.toArray(),
        quaternion: scene.camera.quaternion.toArray(),
        up: scene.camera.up.toArray(),
        rotateSpeed: scene.controls.rotateSpeed,
        rect: {
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        },
        viewport: { width: innerWidth, height: innerHeight },
      };
    });
    const gesture = planOrbitGesture(state, direction);
    if (gesture.cosine >= minDot) break;
    const length = Math.hypot(gesture.dx, gesture.dy);
    assert.ok(length > 0, "An unfinished orbit must have a nonzero gesture");
    await page.mouse.move(gesture.x, gesture.y);
    await page.mouse.down();
    try {
      // 微调也先越过点击容差再沿原路收回，避免一次补偿手势误开格子。
      if (length < 8) {
        await page.mouse.move(
          gesture.x + (gesture.dx * 8) / length,
          gesture.y + (gesture.dy * 8) / length,
        );
      }
      if (stepDelay > 0 && length >= 8) {
        for (let step = 1; step <= steps; step++) {
          await page.mouse.move(
            gesture.x + (gesture.dx * step) / steps,
            gesture.y + (gesture.dy * step) / steps,
          );
          await page.waitForTimeout(stepDelay);
        }
      } else {
        await page.mouse.move(gesture.x + gesture.dx, gesture.y + gesture.dy, {
          steps: length < 8 ? 1 : steps,
        });
      }
    } finally {
      await page.mouse.up();
    }
    gestures.push(gesture);
    // 等真实惯性抵达本次手势的预期方向，不等待任何固定的欧拉角。
    await page.waitForFunction(
      (expected) => {
        const scene = window.__surveyTest.getScene();
        const current = scene.camera.position
          .clone()
          .sub(scene.controls.target)
          .normalize();
        return current.dot(current.clone().fromArray(expected)) > 1 - 1e-10;
      },
      gesture.expected,
      { timeout: 15000 },
    );
    await waitForCameraRest(page);
  }
  await page.waitForFunction(
    ({ target, minimum }) => {
      const scene = window.__surveyTest.getScene();
      const current = scene.camera.position
        .clone()
        .sub(scene.controls.target)
        .normalize();
      return (
        current.dot(current.clone().fromArray(target).normalize()) >= minimum
      );
    },
    { target: direction, minimum: minDot },
    { timeout: 15000 },
  );
  return {
    dx: gestures.reduce((sum, gesture) => sum + gesture.dx, 0),
    dy: gestures.reduce((sum, gesture) => sum + gesture.dy, 0),
    gestures,
  };
}

async function waitForCameraRest(page) {
  await page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const scene = window.__surveyTest.getScene();
        let previous = scene.camera.quaternion.clone();
        let position = scene.camera.position.clone();
        let stable = 0;
        const started = performance.now();
        const sample = () => {
          const rotation = 1 - Math.abs(previous.dot(scene.camera.quaternion));
          const movement = position.distanceToSquared(scene.camera.position);
          stable = rotation < 1e-15 && movement < 1e-12 ? stable + 1 : 0;
          previous.copy(scene.camera.quaternion);
          position.copy(scene.camera.position);
          if (stable >= 3) return resolve();
          if (performance.now() - started > 12000)
            return reject(
              new Error("Camera inertia did not settle after real orbit input"),
            );
          requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      }),
  );
}
