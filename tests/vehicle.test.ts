import { test } from "node:test";
import assert from "node:assert/strict";
import { newVehicle, stepVehicle, idleInput } from "../src/game/vehicle";
import { trackAt, obstacles, nearest, LENGTH } from "../src/game/track";
const forward = { ...idleInput, up: true };
function stepStraight(
  v: ReturnType<typeof newVehicle>,
  input = forward,
  seconds = 1,
) {
  for (let i = 0; i < seconds * 120; i++) {
    const p = trackAt(0);
    v.x = p.x;
    v.z = p.z;
    stepVehicle(v, input, 1 / 120);
  }
}
test("accelerates immediately, brakes and reverses", () => {
  const v = newVehicle();
  stepStraight(v, forward, 1);
  assert(v.speed > 10, "must accelerate promptly");
  stepStraight(v, { ...idleInput, down: true }, 2);
  assert(v.speed < 0, "braking becomes reverse");
  assert(v.speed >= -13);
});
test("boost increases speed and consumes rechargeable nitro", () => {
  const normal = newVehicle(),
    boost = newVehicle();
  stepStraight(normal, forward, 3);
  stepStraight(boost, { ...forward, boost: true }, 3);
  assert(boost.speed > normal.speed + 10);
  assert(boost.nitro < 50);
  assert(boost.nitroUsed > 40);
  const before = boost.nitro;
  stepStraight(boost, forward, 1);
  assert(boost.nitro > before);
});
test("drift loosens heading relative to velocity", () => {
  const v = newVehicle();
  stepStraight(v, forward, 2);
  stepStraight(v, { ...forward, left: true, drift: true }, 0.3);
  assert(v.drifting);
  assert(Math.abs(v.yaw - Math.atan2(v.vx, v.vz)) > 0.1);
});
test("barriers recover position and apply collision cooldown", () => {
  const v = newVehicle();
  v.x = 1000;
  v.z = 1000;
  stepVehicle(v, idleInput, 1 / 120);
  assert.equal(v.collisions, 1);
  assert(v.impact > 0);
  assert(Math.abs(v.x) < 200);
  stepVehicle(v, idleInput, 1 / 120);
  assert.equal(v.collisions, 1);
});
test("road obstacles collide", () => {
  const v = newVehicle();
  v.x = obstacles[0].x + 0.1;
  v.z = obstacles[0].z;
  stepVehicle(v, idleInput, 1 / 120);
  assert.equal(v.collisions, 1);
});
test("ordered checkpoints prevent shortcuts and finish exactly two laps", () => {
  const v = newVehicle();
  const moveTo = (n: number) => {
    const p = trackAt(n / 8);
    v.x = p.x;
    v.z = p.z;
    v.yaw = p.yaw;
    v.vx = Math.sin(p.yaw) * 10;
    v.vz = Math.cos(p.yaw) * 10;
    stepVehicle(v, forward, 1 / 120);
  };
  moveTo(3);
  assert.equal(v.nextGate, 1);
  for (let n = 1; n <= 16; n++) {
    moveTo(n % 8);
    if (n < 16) assert(!v.finished);
  }
  assert(v.finished);
  assert.equal(v.lap, 3);
  assert.equal(v.nextGate, 17);
});
test("fixed-step integration is deterministic and bounded", () => {
  const a = newVehicle(),
    b = newVehicle();
  stepStraight(a, forward, 3);
  stepStraight(b, forward, 3);
  assert.deepEqual(a, b);
  assert(a.nitro >= 0 && a.nitro <= 100);
  assert(Number.isFinite(a.x));
});
test("entire circuit is drivable to completion within the race limit", () => {
  const v = newVehicle();
  for (let frame = 0; frame < 360 * 120 && !v.finished; frame++) {
    const near = nearest(v.x, v.z),
      target = trackAt(near.t + (8 + Math.abs(v.speed) * 0.3) / LENGTH);
    let error = Math.atan2(target.x - v.x, target.z - v.z) - v.yaw;
    error = Math.atan2(Math.sin(error), Math.cos(error));
    const brake = Math.abs(error) > 0.32 && v.speed > 17;
    stepVehicle(
      v,
      {
        ...idleInput,
        up: !brake,
        down: brake,
        left: error > 0.025,
        right: error < -0.025,
      },
      1 / 120,
    );
  }
  assert(
    v.finished,
    `did not finish: gate ${v.nextGate}, collisions ${v.collisions}`,
  );
  assert(v.elapsed < 360);
});
