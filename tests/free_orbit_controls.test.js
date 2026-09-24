import test from "node:test";
import assert from "node:assert/strict";
import { OrthographicCamera, Quaternion, Vector3 } from "three";
import { FreeOrbitControls } from "../js/free_orbit_controls.js";

// 用事件与原生捕获的最小替身驱动公开接口，不直接改控制器内部状态。
class EventSurface {
  constructor() {
    this.listeners = new Map();
  }
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
  }
  removeEventListener(type, listener) {
    this.listeners.get(type)?.delete(listener);
  }
  emit(type, properties = {}) {
    const event = {
      type,
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
      clientX: 300,
      clientY: 300,
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
      ...properties,
    };
    for (const listener of [...(this.listeners.get(type) || [])])
      listener(event);
    return event;
  }
  get listenerCount() {
    return [...this.listeners.values()].reduce(
      (sum, listeners) => sum + listeners.size,
      0,
    );
  }
}

class Canvas extends EventSurface {
  constructor() {
    super();
    this.style = { touchAction: "pan-y" };
    this.ownerDocument = { defaultView: new EventSurface() };
    this.captured = new Set();
    this.height = 600;
  }
  getBoundingClientRect() {
    return { left: 0, top: 0, width: 900, height: this.height };
  }
  setPointerCapture(id) {
    this.captured.add(id);
  }
  hasPointerCapture(id) {
    return this.captured.has(id);
  }
  releasePointerCapture(id) {
    if (!this.captured.delete(id)) return;
    this.emit("lostpointercapture", { pointerId: id });
  }
}

function fixture({ damping = false } = {}) {
  const canvas = new Canvas();
  const camera = new OrthographicCamera(-9, 9, 6, -6, 0.1, 240);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);
  const controls = new FreeOrbitControls(camera, canvas);
  controls.enableDamping = damping;
  return { canvas, camera, controls };
}

function closeVector(actual, expected, tolerance = 1e-10) {
  assert(
    actual.distanceTo(expected) < tolerance,
    `${actual.toArray()} != ${expected.toArray()}`,
  );
}

function pose(camera) {
  return {
    position: camera.position.toArray(),
    up: camera.up.toArray(),
    quaternion: camera.quaternion.toArray(),
    zoom: camera.zoom,
  };
}

test("vertical dragging continues over both poles repeatedly while preserving orbit distance and orthogonal up", () => {
  const { canvas, camera, controls } = fixture();
  const stepAngle = Math.PI / 12;
  const stepPixels =
    (stepAngle * canvas.height) / (Math.PI * 2 * controls.rotateSpeed);
  const target = new Vector3(3, -2, 1);
  controls.target.copy(target);
  camera.position.add(target);
  camera.lookAt(target);
  const down = canvas.emit("pointerdown");
  assert.equal(down.defaultPrevented, false);
  assert(canvas.hasPointerCapture(1));
  let inverted = false;
  let south = false;
  for (let step = 1; step <= 125; step += 1) {
    canvas.emit("pointermove", { clientY: 300 + step * stepPixels });
    assert.equal(controls.update(), true);
    const offset = camera.position.clone().sub(target);
    assert(Math.abs(offset.length() - 10) < 1e-10);
    assert(Math.abs(camera.up.length() - 1) < 1e-12);
    assert(Math.abs(camera.up.dot(offset)) < 1e-10);
    inverted ||= camera.up.y < -0.99;
    south ||= offset.y < -9.99;
  }
  const rotation = new Quaternion().setFromAxisAngle(
    new Vector3(1, 0, 0),
    -125 * stepAngle,
  );
  closeVector(
    camera.position,
    new Vector3(0, 0, 10).applyQuaternion(rotation).add(target),
  );
  closeVector(camera.up, new Vector3(0, 1, 0).applyQuaternion(rotation));
  closeVector(controls.target, target);
  assert(inverted && south);
  canvas.emit("pointerup");
  assert.equal(canvas.captured.size, 0);
  controls.dispose();
});

test("rightward and downward motion follows screen-local axes without translating the target", () => {
  const { canvas, camera, controls } = fixture();
  let changes = 0;
  controls.addEventListener("change", () => (changes += 1));
  const dx = 60;
  const dy = 40;
  const rotation = new Quaternion().setFromAxisAngle(
    new Vector3(-dy, -dx, 0).normalize(),
    (Math.PI * 2 * controls.rotateSpeed * Math.hypot(dx, dy)) / canvas.height,
  );
  canvas.emit("pointerdown");
  canvas.emit("pointermove", { clientX: 300 + dx, clientY: 300 + dy });
  controls.update();
  closeVector(camera.position, new Vector3(0, 0, 10).applyQuaternion(rotation));
  assert(camera.position.x < 0 && camera.position.y > 0);
  closeVector(controls.target, new Vector3());
  assert.equal(changes, 1);
  canvas.emit("pointerup");
  assert.equal(controls.update(), false);
  controls.dispose();
});

test("damping completes only the submitted drag, and stop lets external camera presets remain untouched", () => {
  const { canvas, camera, controls } = fixture({ damping: true });
  let cancellations = 0;
  controls.addEventListener("cancel", () => (cancellations += 1));
  const angle = (Math.PI * 2 * controls.rotateSpeed * 100) / canvas.height;
  canvas.emit("pointerdown");
  canvas.emit("pointermove", { clientX: 400 });
  controls.update();
  const firstRotation = new Quaternion().setFromAxisAngle(
    new Vector3(0, 1, 0),
    -angle * controls.dampingFactor,
  );
  closeVector(
    camera.position,
    new Vector3(0, 0, 10).applyQuaternion(firstRotation),
  );
  canvas.emit("pointerup");
  assert.equal(canvas.captured.size, 0);
  assert.equal(cancellations, 0);
  for (let frame = 0; frame < 250; frame += 1) controls.update();
  const completed = new Quaternion().setFromAxisAngle(
    new Vector3(0, 1, 0),
    -angle,
  );
  closeVector(
    camera.position,
    new Vector3(0, 0, 10).applyQuaternion(completed),
    1e-5,
  );
  assert.equal(controls.update(), false);

  canvas.emit("pointerdown");
  canvas.emit("pointermove", { clientY: 450 });
  controls.update();
  controls.stop();
  assert.equal(cancellations, 0);
  controls.target.set(2, 3, 4);
  camera.position.set(-8, 9, 12);
  camera.up.set(0, 0, 1);
  camera.lookAt(controls.target);
  const reset = pose(camera);
  for (let frame = 0; frame < 50; frame += 1)
    assert.equal(controls.update(), false);
  assert.deepEqual(pose(camera), reset);
  controls.dispose();
});

test("two fingers rotate by their center and pinch zoom, with seamless one/two-pointer transitions", () => {
  const { canvas, camera, controls } = fixture();
  const touch = (type, pointerId, x, y) =>
    canvas.emit(type, {
      pointerId,
      pointerType: "touch",
      clientX: x,
      clientY: y,
    });
  touch("pointerdown", 11, 200, 200);
  touch("pointerdown", 12, 400, 200);
  touch("pointermove", 11, 150, 200);
  touch("pointermove", 12, 450, 200);
  controls.update();
  closeVector(camera.position, new Vector3(0, 0, 10));
  assert(Math.abs(camera.zoom - 1.5 ** controls.zoomSpeed) < 1e-12);

  const beforeZoom = camera.zoom;
  touch("pointermove", 11, 170, 230);
  touch("pointermove", 12, 470, 230);
  controls.update();
  const expected = new Quaternion().setFromAxisAngle(
    new Vector3(-30, -20, 0).normalize(),
    (Math.PI * 2 * controls.rotateSpeed * Math.hypot(20, 30)) / canvas.height,
  );
  closeVector(camera.position, new Vector3(0, 0, 10).applyQuaternion(expected));
  assert(Math.abs(camera.zoom - beforeZoom) < 1e-12);
  closeVector(controls.target, new Vector3());
  const beforeTransition = pose(camera);
  touch("pointerup", 11, 170, 230);
  controls.update();
  touch("pointermove", 12, 470, 230);
  controls.update();
  assert.deepEqual(pose(camera), beforeTransition);
  touch("pointermove", 12, 472, 230);
  controls.update();
  assert(
    camera.position.distanceTo(
      new Vector3().fromArray(beforeTransition.position),
    ) < 0.2,
  );
  controls.dispose();
});

test("right clicks remain available to the game, wheel and middle dragging respect orthographic zoom limits", () => {
  const { canvas, camera, controls } = fixture();
  const before = pose(camera);
  canvas.emit("pointerdown", { button: 2 });
  canvas.emit("pointermove", { button: 2, clientX: 500 });
  canvas.emit("pointerup", { button: 2 });
  assert.equal(canvas.captured.size, 0);
  assert.equal(controls.update(), false);
  assert.deepEqual(pose(camera), before);
  assert.equal(
    canvas.emit("wheel", { deltaY: -100000, deltaMode: 0 }).defaultPrevented,
    true,
  );
  controls.update();
  assert.equal(camera.zoom, 4);
  canvas.emit("wheel", { deltaY: 100000, deltaMode: 0 });
  controls.update();
  assert.equal(camera.zoom, 0.65);
  closeVector(camera.position, new Vector3(0, 0, 10));
  canvas.emit("pointerdown", { button: 1 });
  canvas.emit("pointermove", { button: 1, clientY: 100 });
  controls.update();
  assert(camera.zoom > 0.65 && camera.zoom < 4);
  closeVector(camera.position, new Vector3(0, 0, 10));
  closeVector(controls.target, new Vector3());
  controls.dispose();
});

test("cancel, pointer cancellation, lost capture, and blur clear all gestures and emit one cancellation", () => {
  for (const end of ["cancel", "pointercancel", "lostpointercapture", "blur"]) {
    const { canvas, camera, controls } = fixture({ damping: true });
    let cancellations = 0;
    controls.addEventListener("cancel", () => (cancellations += 1));
    canvas.emit("pointerdown");
    canvas.emit("pointerdown", { pointerId: 2, clientX: 450 });
    canvas.emit("pointermove", { clientY: 500 });
    controls.update();
    if (end === "cancel") controls.cancel();
    else if (end === "blur") canvas.ownerDocument.defaultView.emit("blur");
    else if (end === "lostpointercapture") canvas.releasePointerCapture(1);
    else canvas.emit(end);
    const stopped = pose(camera);
    canvas.emit("pointermove", { clientY: 800 });
    for (let frame = 0; frame < 20; frame += 1)
      assert.equal(controls.update(), false);
    assert.deepEqual(pose(camera), stopped);
    assert.equal(canvas.captured.size, 0);
    assert.equal(cancellations, 1);
    canvas.emit("pointerup");
    canvas.emit("pointerup", { pointerId: 2 });
    assert.equal(cancellations, 1);
    controls.dispose();
    assert.equal(cancellations, 1);
  }
  // 右键由游戏处理，不进入控制器指针表；失焦仍需通知宿主取消长按或点击。
  const { canvas, controls } = fixture();
  let idleCancellations = 0;
  controls.addEventListener("cancel", () => (idleCancellations += 1));
  canvas.emit("pointerdown", { button: 2 });
  canvas.ownerDocument.defaultView.emit("blur");
  assert.equal(idleCancellations, 1);
  controls.dispose();
});

test("disabled input, empty viewports, and near-pole presets cannot create invalid camera state", () => {
  const { canvas, camera, controls } = fixture();
  controls.enabled = false;
  canvas.emit("pointerdown");
  canvas.emit("pointermove", { clientX: 500 });
  canvas.emit("wheel", { deltaY: 200 });
  assert.equal(controls.update(), false);
  controls.enabled = true;
  canvas.height = 0;
  canvas.emit("pointerdown");
  canvas.emit("pointermove", { clientY: 500 });
  assert.equal(controls.update(), false);
  canvas.height = 600;
  camera.position.set(0, 10, 0);
  camera.up.set(0, 1, 0);
  canvas.emit("pointermove", { clientY: 510 });
  assert.equal(controls.update(), true);
  assert(
    [
      ...camera.position.toArray(),
      ...camera.up.toArray(),
      ...camera.quaternion.toArray(),
    ].every(Number.isFinite),
  );
  assert(Math.abs(camera.up.dot(camera.position)) < 1e-10);
  const before = pose(camera);
  controls.enableRotate = false;
  canvas.emit("pointermove", { clientY: 800 });
  assert.equal(controls.update(), false);
  assert.deepEqual(pose(camera), before);
  controls.dispose();
});

test("dispose releases all capture and listeners once, restores touch handling, and leaves the camera unchanged", () => {
  const { canvas, camera, controls } = fixture({ damping: true });
  assert.equal(canvas.style.touchAction, "none");
  assert.equal(canvas.ownerDocument.defaultView.listenerCount, 1);
  canvas.emit("pointerdown");
  canvas.emit("pointermove", { clientX: 450 });
  const before = pose(camera);
  controls.dispose();
  controls.dispose();
  assert.equal(canvas.listenerCount, 0);
  assert.equal(canvas.ownerDocument.defaultView.listenerCount, 0);
  assert.equal(canvas.captured.size, 0);
  assert.equal(canvas.style.touchAction, "pan-y");
  canvas.emit("pointerdown");
  canvas.emit("wheel", { deltaY: -100 });
  assert.equal(controls.update(), false);
  assert.deepEqual(pose(camera), before);
});
