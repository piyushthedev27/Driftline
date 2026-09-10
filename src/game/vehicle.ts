import { nearest, trackAt, LENGTH } from "./track";
import { resolveCollisions } from "./collision";
export type Input = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  drift: boolean;
  boost: boolean;
};
export const idleInput: Input = {
  up: false,
  down: false,
  left: false,
  right: false,
  drift: false,
  boost: false,
};
export function newVehicle() {
  const p = trackAt(0);
  return {
    ...p,
    vx: 0,
    vz: 0,
    speed: 0,
    nitro: 100,
    boosting: false,
    drifting: false,
    distance: 0,
    topSpeed: 0,
    nitroUsed: 0,
    collisions: 0,
    impact: 0,
    cooldown: 0,
    elapsed: 0,
    nextGate: 1,
    lap: 1,
    finished: false,
    gateFlash: 0,
    steer: 0,
  };
}
export type Vehicle = ReturnType<typeof newVehicle>;
export function stepVehicle(v: Vehicle, k: Input, dt: number) {
  const near = nearest(v.x, v.z),
    offroad = near.distance > 7.5;
  v.cooldown = Math.max(0, v.cooldown - dt);
  v.impact = Math.max(0, v.impact - dt * 2);
  v.gateFlash = Math.max(0, v.gateFlash - dt);
  const forward = v.vx * Math.sin(v.yaw) + v.vz * Math.cos(v.yaw);
  v.boosting = k.boost && v.nitro > 0.8 && k.up && forward > 2;
  v.drifting = k.drift && Math.abs(forward) > 7;
  const used = v.boosting ? Math.min(v.nitro, 25 * dt) : 0;
  v.nitro = Math.min(100, v.nitro - used + (v.boosting ? 0 : 9 * dt));
  v.nitroUsed += used;
  let acceleration = k.up
    ? 24 * (1 - Math.max(0, forward) / (v.boosting ? 76 : 54))
    : k.down
      ? forward > 1
        ? -40
        : -12
      : 0;
  if (v.boosting) acceleration += 21;
  const drag = offroad ? 1.7 : v.drifting ? 0.55 : 0.19;
  let longitudinal = forward + acceleration * dt - forward * drag * dt;
  longitudinal = Math.max(-13, Math.min(v.boosting ? 76 : 56, longitudinal));
  const delta = longitudinal - forward;
  v.vx += Math.sin(v.yaw) * delta;
  v.vz += Math.cos(v.yaw) * delta;
  v.steer += (Number(k.left) - Number(k.right) - v.steer) * Math.min(1, dt * 9);
  v.yaw +=
    ((v.steer * longitudinal * 0.035) / (1 + Math.abs(longitudinal) * 0.018)) *
    dt *
    (v.drifting ? 1.5 : 1);
  const targetX = Math.sin(v.yaw) * longitudinal,
    targetZ = Math.cos(v.yaw) * longitudinal,
    grip = 1 - Math.exp(-(v.drifting ? 2.1 : 11) * dt);
  v.vx += (targetX - v.vx) * grip;
  v.vz += (targetZ - v.vz) * grip;
  v.x += v.vx * dt;
  v.z += v.vz * dt;
  const hit = (_nx: number, _nz: number, closingSpeed: number) => {
    if (v.cooldown <= 0) {
      v.vx *= 0.82;
      v.vz *= 0.82;
      v.collisions++;
      v.impact = Math.min(1, 0.3 + closingSpeed / 24);
      v.cooldown = 0.8;
    }
  };
  resolveCollisions(v, hit);
  v.speed = Math.hypot(v.vx, v.vz) * Math.sign(longitudinal || 1);
  v.distance += Math.abs(v.speed) * dt;
  v.topSpeed = Math.max(v.topSpeed, Math.abs(v.speed) * 3.6);
  v.elapsed += dt;
  const expected = (v.nextGate % 8) / 8,
    g = trackAt(expected);
  if (Math.hypot(v.x - g.x, v.z - g.z) < 11 && forward > 0) {
    v.nextGate++;
    v.gateFlash = 1.6;
    v.nitro = Math.min(100, v.nitro + 12);
    if ((v.nextGate - 1) % 8 === 0) {
      v.lap++;
      if (v.lap > 2) v.finished = true;
    }
  }
  return {
    offroad,
    progress: Math.min(1, (v.nextGate - 1) / 16),
    length: LENGTH,
  };
}
