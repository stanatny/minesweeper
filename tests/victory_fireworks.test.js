import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { VictoryFireworks } from "../js/victory_fireworks.js";

function celebration(options = {}) {
  const scene = new THREE.Scene();
  const launches = [];
  const bursts = [];
  const effect = new VictoryFireworks(THREE, scene, {
    ...options,
    onLaunch: (event) => launches.push({ ...event, time: effect.elapsed }),
    onBurst: (event) => bursts.push({ ...event, time: effect.elapsed }),
  });
  return { scene, effect, launches, bursts };
}

function assertFinished({ effect, launches, bursts }) {
  assert.equal(effect.active, false);
  assert.equal(effect.activeCount, 0);
  assert.equal(effect.launchCount, 9);
  assert.equal(effect.burstCount, 9);
  assert.equal(launches.length, 9);
  assert.equal(bursts.length, 9);
  assert.equal(effect.points.visible, false);
  assert.equal(effect.trails.visible, false);
  assert.equal(effect.points.geometry.drawRange.count, 0);
  assert.equal(effect.trails.geometry.drawRange.count, 0);
  assert(effect.particles.every((particle) => particle.life === 0));
  assert(
    effect.rockets.every((rocket) => !rocket.active && rocket.core === null),
  );
  for (let index = 0; index < 9; index += 1) {
    assert(bursts[index].time > launches[index].time);
  }
  for (const event of [...launches, ...bursts]) {
    assert(event.strength >= 0 && event.strength <= 1);
    assert(event.pan >= -1 && event.pan <= 1);
  }
}

test("fireworks finish within the visible-time budget at 60 fps, slow frames, and mixed frame times", () => {
  for (const deltas of [[1 / 60], [0.2], [0.5], [1 / 60, 0.13, 0.04, 0.32]]) {
    const state = celebration();
    state.effect.start({ width: 9, height: 9 });
    let wallTime = 0;
    let frame = 0;
    let peak = 0;
    while (state.effect.active && frame < 400) {
      const delta = deltas[frame % deltas.length];
      state.effect.update(delta);
      wallTime += delta;
      frame += 1;
      peak = Math.max(peak, state.effect.activeCount);
      assert(state.effect.elapsed <= state.effect.duration);
      assert(state.effect.positions.every(Number.isFinite));
    }
    assertFinished(state);
    assert(
      wallTime >= 4.5,
      "The celebration must retain its full choreography",
    );
    assert(wallTime <= state.effect.duration + Math.max(...deltas) + 1e-10);
    assert(peak > 100 && peak <= 960);
    state.effect.dispose();
  }
});

test("slow frames consume all visible time while keeping launch and burst timing near the normal sequence", () => {
  const regular = celebration();
  const slow = celebration();
  regular.effect.start({ width: 30, height: 16 });
  slow.effect.start({ width: 30, height: 16 });
  for (let index = 0; index < 324; index += 1) regular.effect.update(1 / 60);
  for (let index = 0; index < 27; index += 1) slow.effect.update(0.2);
  assertFinished(regular);
  assertFinished(slow);
  for (let index = 0; index < 9; index += 1) {
    assert(
      Math.abs(regular.launches[index].time - slow.launches[index].time) <=
        0.08,
    );
    assert(
      Math.abs(regular.bursts[index].time - slow.bursts[index].time) <= 0.16,
    );
  }
  regular.effect.dispose();
  slow.effect.dispose();
});

test("a huge delta is bounded to the remaining show and still dispatches each of the nine events once", () => {
  for (const initialElapsed of [0, 2.3]) {
    const state = celebration();
    state.effect.start({ width: 50, height: 30 });
    if (initialElapsed) state.effect.update(initialElapsed);
    const remaining = state.effect.duration - state.effect.elapsed;
    let steps = 0;
    let largestStep = 0;
    let bufferUploads = 0;
    const advance = state.effect.advance.bind(state.effect);
    state.effect.advance = (step) => {
      steps += 1;
      largestStep = Math.max(largestStep, step);
      advance(step);
    };
    const syncBuffers = state.effect.syncBuffers.bind(state.effect);
    state.effect.syncBuffers = () => {
      bufferUploads += 1;
      syncBuffers();
    };
    state.effect.update(Number.MAX_VALUE);
    assertFinished(state);
    assert.equal(state.effect.elapsed, state.effect.duration);
    assert(steps <= Math.ceil(remaining / 0.08) + 1);
    assert(largestStep <= 0.08);
    assert.equal(bufferUploads, 1);
    state.effect.update(Number.MAX_VALUE);
    assertFinished(state);
    assert.equal(bufferUploads, 1);
    state.effect.dispose();
  }
});

test("zero and invalid deltas do not advance or corrupt an active celebration", () => {
  const state = celebration();
  state.effect.start({ width: 9, height: 9 });
  for (const delta of [
    0,
    -1,
    NaN,
    Infinity,
    -Infinity,
    undefined,
    null,
    "0.2",
  ]) {
    state.effect.update(delta);
    assert.equal(state.effect.elapsed, 0);
    assert.equal(state.effect.active, true);
    assert.equal(state.effect.activeCount, 1);
    assert.equal(state.effect.launchCount, 1);
    assert.equal(state.effect.burstCount, 0);
  }
  state.effect.update(0.37);
  assert.equal(state.effect.elapsed, 0.37);
  assert.equal(state.effect.launchCount, 1);
  state.effect.dispose();
});

test("reduced motion clears immediately and reset or disposal cannot replay pending events", () => {
  let reducedMotion = true;
  const state = celebration({ reducedMotion: () => reducedMotion });
  state.effect.start({ width: 9, height: 9 });
  state.effect.update(10);
  assert.equal(state.effect.active, false);
  assert.equal(state.launches.length, 0);
  assert.equal(state.bursts.length, 0);
  reducedMotion = false;
  state.effect.start({ width: 9, height: 9 });
  state.effect.update(1.2);
  assert(state.effect.activeCount > 0);
  reducedMotion = true;
  const eventCount = state.launches.length + state.bursts.length;
  state.effect.update(10);
  assert.equal(state.effect.active, false);
  assert.equal(state.effect.activeCount, 0);
  assert.equal(state.launches.length + state.bursts.length, eventCount);
  reducedMotion = false;
  state.effect.start({ width: 9, height: 9 });
  state.effect.update(0.8);
  state.effect.clear();
  assert.equal(state.effect.elapsed, 0);
  assert.equal(state.effect.launchCount, 0);
  assert.equal(state.effect.burstCount, 0);
  const clearedEventCount = state.launches.length + state.bursts.length;
  state.effect.update(10);
  assert.equal(state.launches.length + state.bursts.length, clearedEventCount);
  state.effect.dispose();
  state.effect.dispose();
  state.effect.start({ width: 9, height: 9 });
  state.effect.update(10);
  assert.equal(state.effect.active, false);
  assert.equal(state.scene.children.length, 0);
  assert.equal(state.launches.length + state.bursts.length, clearedEventCount);
});
