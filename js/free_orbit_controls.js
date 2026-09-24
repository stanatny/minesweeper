import { EventDispatcher, Quaternion, Vector2, Vector3 } from "three";

const ROTATION_EPSILON = 1e-7;

/**
 * 绕固定目标自由旋转正交相机，同时旋转 camera.up，允许连续穿越两极。
 * @param {Camera} camera 由宿主管理的相机。
 * @param {HTMLElement} canvas 接收鼠标、触控与滚轮输入的画布。
 * change 事件在控制器实际改变相机时发出；空闲 update 不重写宿主的相机设置。
 */
export class FreeOrbitControls extends EventDispatcher {
  constructor(camera, canvas) {
    super();
    this.object = camera;
    this.domElement = canvas;
    this.target = new Vector3();
    this.enabled = true;
    this.enableRotate = true;
    this.enableDamping = true;
    this.dampingFactor = 0.1;
    this.rotateSpeed = 0.7;
    this.zoomSpeed = 0.8;
    this.minZoom = 0.65;
    this.maxZoom = 4;

    this._pointers = new Map();
    this._gesture = null;
    this._rotation = new Vector2();
    this._zoomDelta = 0;
    this._offset = new Vector3();
    this._forward = new Vector3();
    this._up = new Vector3();
    this._right = new Vector3();
    this._axis = new Vector3();
    this._quaternion = new Quaternion();
    this._disposed = false;
    this._previousTouchAction = canvas.style.touchAction;
    canvas.style.touchAction = "none";
    this._handlers = {
      pointerdown: (event) => this._pointerDown(event),
      pointermove: (event) => this._pointerMove(event),
      pointerup: (event) => this._pointerEnd(event),
      pointercancel: () => this.cancel(),
      lostpointercapture: (event) => {
        if (this._pointers.has(event.pointerId)) this.cancel();
      },
      wheel: (event) => this._wheel(event),
    };
    for (const [type, handler] of Object.entries(this._handlers))
      canvas.addEventListener(type, handler, { passive: false });
    this._view = canvas.ownerDocument?.defaultView ?? globalThis.window;
    this._onBlur = () => this.cancel();
    this._view?.addEventListener("blur", this._onBlur);
  }

  /** 消耗输入及旋转惯性，返回本次是否改变了相机。 */
  update() {
    if (this._disposed) return false;
    if (!this.enabled) {
      this.stop();
      return false;
    }
    let changed = false;
    if (!this.enableRotate) this._rotation.set(0, 0);
    if (this._rotation.length() > ROTATION_EPSILON) {
      const factor =
        this.enableDamping &&
        Number.isFinite(this.dampingFactor) &&
        this.dampingFactor > 0
          ? Math.min(1, this.dampingFactor)
          : 1;
      const horizontal = this._rotation.x * factor;
      const vertical = this._rotation.y * factor;
      this._rotation.multiplyScalar(1 - factor);
      changed = this._rotate(horizontal, vertical);
    } else {
      this._rotation.set(0, 0);
    }
    if (this._zoomDelta !== 0) {
      const previous = this.object.zoom;
      const desired =
        previous * Math.exp(Math.max(-50, Math.min(50, this._zoomDelta)));
      this.object.zoom = Math.max(
        this.minZoom,
        Math.min(this.maxZoom, desired),
      );
      this._zoomDelta = 0;
      if (this.object.zoom !== previous) {
        this.object.updateProjectionMatrix();
        changed = true;
      }
    }
    if (changed) {
      this.object.updateMatrixWorld();
      this.dispatchEvent({ type: "change" });
    }
    return changed;
  }

  /** 清除待处理输入和惯性，并从当前手指位置重新建立基线，供 reset/focus 调用。 */
  stop() {
    this._rotation.set(0, 0);
    this._zoomDelta = 0;
    this._gesture = this._readGesture();
  }

  /** 取消全部手势及惯性并释放捕获，通知宿主取消点击/长按；可用于页面隐藏。 */
  cancel() {
    if (this._disposed) return;
    this._cancelGestures();
    this.dispatchEvent({ type: "cancel" });
  }

  /** 解除事件与指针捕获；可重复调用，不影响宿主相机及目标位置。 */
  dispose() {
    if (this._disposed) return;
    this._disposed = true;
    for (const [type, handler] of Object.entries(this._handlers))
      this.domElement.removeEventListener(type, handler);
    this._view?.removeEventListener("blur", this._onBlur);
    this._cancelGestures();
    if (this.domElement.style.touchAction === "none")
      this.domElement.style.touchAction = this._previousTouchAction;
  }

  _rotate(horizontal, vertical) {
    const camera = this.object;
    this._offset.copy(camera.position).sub(this.target);
    if (this._offset.lengthSq() < 1e-16) return false;
    this._forward.copy(this._offset).normalize();
    this._up.copy(camera.up).normalize();
    this._right.crossVectors(this._up, this._forward);
    if (this._right.lengthSq() < 1e-12) {
      // 外部预设可能让 up 与视线平行，选取非平行基轴后再正交化。
      this._up.set(0, 1, 0);
      if (Math.abs(this._forward.y) > 0.9) this._up.set(0, 0, 1);
      this._right.crossVectors(this._up, this._forward);
    }
    this._right.normalize();
    this._up.crossVectors(this._forward, this._right).normalize();
    this._axis
      .copy(this._right)
      .multiplyScalar(-vertical)
      .addScaledVector(this._up, -horizontal)
      .normalize();
    this._quaternion.setFromAxisAngle(
      this._axis,
      Math.hypot(horizontal, vertical),
    );
    this._offset.applyQuaternion(this._quaternion);
    camera.position.copy(this.target).add(this._offset);
    camera.up.copy(this._up).applyQuaternion(this._quaternion).normalize();
    camera.lookAt(this.target);
    return true;
  }

  _pointerDown(event) {
    if (!this.enabled || this._disposed) return;
    if (
      event.pointerType !== "touch" &&
      event.button !== 0 &&
      event.button !== 1
    )
      return;
    if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY))
      return;
    if (event.button === 1) event.preventDefault();
    this._pointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
      button: event.pointerType === "touch" ? 0 : event.button,
    });
    this.stop();
    try {
      this.domElement.setPointerCapture(event.pointerId);
    } catch {
      // 脱离文档或已失效的指针不能捕获；原有画布事件仍可正常结束手势。
    }
  }

  _pointerMove(event) {
    const pointer = this._pointers.get(event.pointerId);
    if (
      !pointer ||
      !Number.isFinite(event.clientX) ||
      !Number.isFinite(event.clientY)
    )
      return;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    if (!this.enabled) {
      this.stop();
      return;
    }
    const previous = this._gesture;
    const current = this._readGesture();
    this._gesture = current;
    if (!previous || previous.mode !== current.mode) return;
    const height = this.domElement.getBoundingClientRect().height;
    if (!Number.isFinite(height) || height <= 0) return;
    const dx = current.x - previous.x;
    const dy = current.y - previous.y;
    if (current.mode === "zoom") {
      this._zoomDelta -= (dy / height) * 4 * this.zoomSpeed;
      return;
    }
    if (this.enableRotate) {
      const scale = (Math.PI * 2 * this.rotateSpeed) / height;
      this._rotation.x += dx * scale;
      this._rotation.y += dy * scale;
    }
    if (
      current.mode === "pinch" &&
      previous.distance > 0.01 &&
      current.distance > 0.01
    )
      this._zoomDelta +=
        Math.log(current.distance / previous.distance) * this.zoomSpeed;
  }

  _pointerEnd(event) {
    if (!this._pointers.delete(event.pointerId)) return;
    this._release(event.pointerId);
    // 双指变单指时不继承旧中心/距离；最后一指正常松手仍保留旋转惯性。
    if (this._pointers.size > 0) this.stop();
    else this._gesture = null;
  }

  _readGesture() {
    const pointers = [...this._pointers.values()];
    if (!pointers.length) return null;
    const [first, second] = pointers;
    if (second)
      return {
        mode: "pinch",
        x: (first.x + second.x) / 2,
        y: (first.y + second.y) / 2,
        distance: Math.hypot(second.x - first.x, second.y - first.y),
      };
    return {
      mode: first.button === 1 ? "zoom" : "rotate",
      x: first.x,
      y: first.y,
    };
  }

  _cancelGestures() {
    const ids = [...this._pointers.keys()];
    this._pointers.clear();
    this.stop();
    for (const id of ids) this._release(id);
  }

  _wheel(event) {
    if (!this.enabled || this._disposed || !Number.isFinite(event.deltaY))
      return;
    event.preventDefault();
    const unit =
      event.deltaMode === 1
        ? 16
        : event.deltaMode === 2
          ? this.domElement.getBoundingClientRect().height
          : 1;
    if (Number.isFinite(unit) && unit > 0)
      this._zoomDelta -= event.deltaY * unit * 0.001 * this.zoomSpeed;
  }

  _release(id) {
    try {
      if (this.domElement.hasPointerCapture(id))
        this.domElement.releasePointerCapture(id);
    } catch {
      // 指针结束或画布移除后，浏览器可能已经主动释放捕获。
    }
  }
}
