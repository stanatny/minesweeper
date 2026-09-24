import assert from "node:assert/strict";

// 使用真实触屏输入与浏览器捕获 API，确认取消事件同步清理棋盘长按状态。
export async function verifyInputCancellation(page, cdp) {
  await page.locator("#reset-camera").click();
  const findPoint = () =>
    page.evaluate(() => {
      const scene = window.__surveyTest.getScene();
      const game = window.__surveyTest.getGame();
      const canvas = scene.renderer.domElement;
      for (const cell of game.cells) {
        if (cell.revealed || cell.flagged) continue;
        const point = scene.projectCell(cell.id);
        if (
          point.visible &&
          point.x >= 0 &&
          point.x + 2 < innerWidth &&
          point.y >= 0 &&
          point.y < innerHeight &&
          document.elementFromPoint(point.x, point.y) === canvas &&
          scene.pick({ clientX: point.x, clientY: point.y }) === cell.id
        )
          return { id: cell.id, x: point.x, y: point.y };
      }
      throw new Error("No visible closed cell for cancellation check");
    });
  const first = await findPoint();
  await page.touchscreen.tap(first.x, first.y);
  await page.waitForFunction(
    () => window.__surveyTest.getGame().status === "playing",
  );
  const evidence = [];
  await page.evaluate(() => {
    const scene = window.__surveyTest.getScene();
    const canvas = scene.renderer.domElement;
    const probe = {
      events: [],
      record(type, event) {
        probe.events.push({
          type,
          pointerId: event?.pointerId ?? null,
          trusted: event?.isTrusted ?? null,
        });
      },
    };
    const onPointer = (event) => probe.record(event.type, event);
    const onCancel = () => probe.record("cancel");
    const types = ["gotpointercapture", "lostpointercapture", "pointercancel"];
    for (const type of types) canvas.addEventListener(type, onPointer);
    scene.controls.addEventListener("cancel", onCancel);
    probe.dispose = () => {
      for (const type of types) canvas.removeEventListener(type, onPointer);
      scene.controls.removeEventListener("cancel", onCancel);
    };
    window.__inputCancelProbe = probe;
  });
  // 仅在取消夹具内控制时间，避免原生输入的调度延迟先越过 480ms 长按阈值。
  const clockStart = Date.now();
  await page.clock.install({ time: clockStart });
  await page.clock.pauseAt(clockStart + 1);
  try {
    for (const kind of ["pointercancel", "lostpointercapture"]) {
      const point = await findPoint();
      const before = await page.evaluate(() => {
        window.__inputCancelProbe.events = [];
        return window.__surveyTest
          .getGame()
          .cells.map((cell) => JSON.stringify(cell));
      });
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x: point.x, y: point.y, id: 1 }],
      });
      if (kind === "pointercancel") {
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchCancel",
          touchPoints: [],
        });
      } else {
        // hasPointerCapture 包含待处理捕获，必须先触发一次真实移动，让 got 事件确实发生。
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: point.x + 1, y: point.y, id: 1 }],
        });
        assert.equal(
          await page.evaluate(() =>
            window.__inputCancelProbe.events.some(
              (event) => event.type === "gotpointercapture" && event.trusted,
            ),
          ),
          true,
          "A real move must establish native pointer capture before release",
        );
        await page.evaluate(() => {
          const scene = window.__surveyTest.getScene();
          const id = [...scene.pointers][0];
          if (!scene.renderer.domElement.hasPointerCapture(id))
            throw new Error("The native pointer capture was not established");
          scene.renderer.domElement.releasePointerCapture(id);
        });
        // 同坐标的 CDP touchMove 可能被浏览器合并掉，另移 1px 才会处理待释放捕获。
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: point.x + 2, y: point.y, id: 1 }],
        });
      }
      const cancelled = await page.evaluate((kind) => {
        const events = window.__inputCancelProbe.events;
        const scene = window.__surveyTest.getScene();
        return (
          events.some((event) => event.type === kind && event.trusted) &&
          events.some((event) => event.type === "cancel") &&
          scene.pointers.size === 0 &&
          scene.controls._pointers.size === 0 &&
          scene.pointerState === null
        );
      }, kind);
      assert.equal(
        cancelled,
        true,
        `${kind} must dispatch cancel and immediately clear both input states`,
      );
      await page.clock.fastForward(600);
      if (kind === "lostpointercapture")
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: [],
        });
      const after = await page.evaluate(() => {
        const scene = window.__surveyTest.getScene();
        return {
          cells: window.__surveyTest
            .getGame()
            .cells.map((cell) => JSON.stringify(cell)),
          pointers: scene.pointers.size,
          controlPointers: scene.controls._pointers.size,
          active: scene.pointerState,
          events: window.__inputCancelProbe.events,
        };
      });
      const changedIds = after.cells.flatMap((cell, id) =>
        cell === before[id] ? [] : [id],
      );
      assert.deepEqual(
        changedIds,
        [],
        `${kind} must cancel long-press flags and reveal`,
      );
      assert.equal(after.pointers, 0, `${kind} must clear host pointers`);
      assert.equal(
        after.controlPointers,
        0,
        `${kind} must clear control pointers`,
      );
      assert.equal(after.active, null);
      evidence.push({ kind, changedIds, events: after.events });
    }
    const next = await findPoint();
    await page.touchscreen.tap(next.x, next.y);
    const resumed = await page.evaluate(
      (id) => ({
        revealed: window.__surveyTest.getGame().cells[id].revealed,
        pointers: window.__surveyTest.getScene().pointers.size,
      }),
      next.id,
    );
    assert.equal(
      resumed.revealed,
      true,
      "A fresh tap must reveal its target after input cancellation",
    );
    assert.equal(resumed.pointers, 0);
    return { cancellations: evidence, resumedCellId: next.id };
  } finally {
    await cdp
      .send("Input.dispatchTouchEvent", {
        type: "touchCancel",
        touchPoints: [],
      })
      .catch(() => {});
    await page.evaluate(() => {
      window.__inputCancelProbe?.dispose();
      delete window.__inputCancelProbe;
    });
    await page.clock.resume();
  }
}
