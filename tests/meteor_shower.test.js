import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { createMeteorShower } from "../js/meteor_shower.js";

function randomSource(seed = 8713) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

test("meteors start naturally after a short delay and form small groups separated by long quiet periods", () => {
  const shower = createMeteorShower(THREE, { random: randomSource() });
  const groups = [];
  let peak = 0;
  let lastLaunch = 0;
  for (let frame = 1; frame <= 60 * 180; frame += 1) {
    shower.update(1 / 60);
    peak = Math.max(peak, shower.activeCount);
    if (shower.launched > lastLaunch) {
      assert.equal(shower.launched - lastLaunch, 1);
      lastLaunch = shower.launched;
      const group = groups[shower.groupCount - 1] || [];
      group.push(frame / 60);
      groups[shower.groupCount - 1] = group;
    }
  }
  assert(groups.length >= 10);
  assert(groups[0][0] >= 2 && groups[0][0] <= 4 + 1 / 60);
  assert(
    groups
      .slice(0, -1)
      .every((group) => group.length >= 1 && group.length <= 3),
  );
  assert(groups.some((group) => group.length > 1));
  for (let index = 1; index < groups.length; index += 1) {
    const quiet = groups[index][0] - groups[index - 1].at(-1);
    assert(quiet >= 6 && quiet <= 12 + 1 / 60);
  }
  assert(peak >= 2 && peak <= shower.capacity);
  assert.equal(shower.capacity, 3);
  assert.equal(shower.launchCount, shower.launched);
  shower.dispose();
});

test("each flight moves through a screen margin and naturally clears within its short lifetime", () => {
  const shower = createMeteorShower(THREE, { random: () => 0.1 });
  const wait = shower.nextIn;
  shower.update(wait);
  assert.equal(shower.launched, 1);
  assert.equal(shower.activeCount, 1);
  const start = shower.activeMeteors[0];
  assert(start.life >= 0.6 && start.life <= 1.2);
  shower.update(start.life / 2);
  const middle = shower.activeMeteors[0];
  assert.notEqual(middle.x, start.x);
  assert.notEqual(middle.y, start.y);
  assert(middle.progress >= 0.49 && middle.progress <= 0.51);
  shower.update(start.life / 2 + 0.001);
  assert.equal(shower.activeCount, 0);
  assert.equal(shower.completedCount, 1);
  for (const object of shower.group.children) {
    assert.equal(object.visible, false);
    assert.equal(object.geometry.drawRange.count, 0);
  }
  shower.dispose();

  const varied = createMeteorShower(THREE, { random: randomSource(9782) });
  const lanes = new Set();
  for (let frame = 0; frame < 60 * 180; frame += 1) {
    varied.update(1 / 60);
    for (const meteor of varied.activeMeteors) {
      assert(Number.isFinite(meteor.x) && Number.isFinite(meteor.y));
      assert(Math.abs(meteor.x) <= 1 && Math.abs(meteor.y) <= 1);
      assert(
        meteor.y >= 0.6 || Math.abs(meteor.x) >= 0.7,
        "A meteor must not cross the central board region",
      );
      lanes.add(
        meteor.y >= 0.8
          ? "upper"
          : meteor.x < -0.7
            ? "left"
            : meteor.x > 0.7
              ? "right"
              : "upper",
      );
    }
  }
  assert(lanes.has("upper") && lanes.has("left") && lanes.has("right"));
  varied.dispose();
});

test("reduced motion clears immediately and resumes with a fresh delay instead of catching up", () => {
  const shower = createMeteorShower(THREE, { random: () => 0.5 });
  shower.update(shower.nextIn);
  assert.equal(shower.activeCount, 1);
  shower.update(0, true);
  const launched = shower.launched;
  assert.equal(shower.activeCount, 0);
  assert.equal(shower.nextIn, null);
  shower.update(500, true);
  assert.equal(shower.launched, launched);
  shower.update(500, false);
  assert.equal(shower.launched, launched);
  assert.equal(shower.activeCount, 0);
  assert(shower.nextIn >= 2 && shower.nextIn <= 4);
  shower.update(1);
  assert.equal(shower.launched, launched);
  shower.update(shower.nextIn);
  assert.equal(shower.launched, launched + 1);
  shower.dispose();
});

test("paused or invalid time does not advance and large deltas never burst through a backlog", () => {
  const shower = createMeteorShower(THREE, { random: () => 0.99 });
  const wait = shower.nextIn;
  for (const delta of [0, -1, NaN, Infinity, -Infinity, undefined, null, "1"]) {
    shower.update(delta);
    assert.equal(shower.nextIn, wait);
    assert.equal(shower.launched, 0);
  }
  const resources = shower.group.children.map((object) => ({
    object,
    geometry: object.geometry,
    material: object.material,
  }));
  for (let call = 0; call < 20; call += 1) {
    const before = shower.launched;
    shower.update(Number.MAX_VALUE);
    assert(shower.launched - before <= 1);
    assert(shower.activeCount <= 3);
    assert(Number.isFinite(shower.nextIn) && shower.nextIn > 0);
    for (const { object, geometry, material } of resources) {
      assert.equal(object.geometry, geometry);
      assert.equal(object.material, material);
      assert(geometry.attributes.position.array.every(Number.isFinite));
    }
  }
  assert.equal(shower.group.children.length, 2);
  const liveBeforePause = shower.activeMeteors;
  shower.update(0);
  assert.deepEqual(shower.activeMeteors, liveBeforePause);
  shower.dispose();
});

test("diagnostics are read-only and disposal removes and releases every resource exactly once", () => {
  const shower = createMeteorShower(THREE, { random: randomSource() });
  const scene = new THREE.Scene();
  scene.add(shower.group);
  let releases = 0;
  for (const object of shower.group.children) {
    object.geometry.addEventListener("dispose", () => {
      releases += 1;
    });
    object.material.addEventListener("dispose", () => {
      releases += 1;
    });
    assert.equal(object.material.depthTest, true);
    assert.equal(object.material.depthWrite, false);
  }
  shower.update(shower.nextIn);
  assert.throws(() => {
    shower.launched = 100;
  }, TypeError);
  assert.throws(() => {
    shower.activeMeteors[0].x = 10;
  }, TypeError);
  const launches = shower.launched;
  shower.dispose();
  shower.dispose();
  shower.update(1000);
  assert.equal(releases, 4);
  assert.equal(shower.activeCount, 0);
  assert.equal(shower.launched, launches);
  assert.equal(shower.nextIn, null);
  assert.equal(scene.children.length, 0);
});
