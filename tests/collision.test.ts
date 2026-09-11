import { test } from "node:test";
import assert from "node:assert/strict";
import { newVehicle, stepVehicle, idleInput } from "../src/game/vehicle";
import { trackAt, nearest } from "../src/game/track";
import { footprint, RAIL_INNER_LIMIT } from "../src/game/collision";

test("entire car stays inside both rails at forward, reverse and sideways angles", () => {
  for (const t of [0, 0.07, 0.22, 0.38, 0.57, 0.72, 0.87, 0.98])
    for (const side of [-1, 1])
      for (const angle of [0, 0.4, Math.PI / 2, Math.PI]) {
        const v = newVehicle(),
          p = trackAt(t, side * 9.65);
        Object.assign(v, p, {
          yaw: p.yaw + angle,
          vx: Math.cos(p.yaw) * side * 60,
          vz: -Math.sin(p.yaw) * side * 60,
        });
        stepVehicle(v, idleInput, 1 / 120);
        for (const point of footprint(v))
          assert(
            nearest(point.x, point.z).distance <= RAIL_INNER_LIMIT + 0.002,
            `rail overlap at t=${t}, side=${side}, angle=${angle}`,
          );
      }
});
test("holding acceleration against rail cannot penetrate during feedback cooldown", () => {
  const v = newVehicle(),
    p = trackAt(0.08, 8);
  Object.assign(v, p, { yaw: p.yaw + Math.PI / 2 });
  for (let frame = 0; frame < 600; frame++) {
    stepVehicle(v, { ...idleInput, up: true, boost: true }, 1 / 120);
    for (const point of footprint(v))
      assert(nearest(point.x, point.z).distance <= RAIL_INNER_LIMIT + 0.002);
  }
});
