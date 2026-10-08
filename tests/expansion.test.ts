import { test } from "node:test";
import assert from "node:assert/strict";
import { MAPS, VEHICLES } from "../src/game/catalog";
import { setActiveTrack, nearest, trackAt, LENGTH } from "../src/game/track";
import { newVehicle, stepVehicle, idleInput } from "../src/game/vehicle";
import { footprint } from "../src/game/collision";
import { sanitizeSettings, useSettings, useGame } from "../src/store";
for (const map of MAPS)
  for (const car of VEHICLES)
    test(`${map.name}: ${car.name} completes two laps and respects barriers`, () => {
      setActiveTrack(map.id);
      const v = newVehicle(car.id);
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
      assert(v.finished, `gate ${v.nextGate}, time ${v.elapsed}`);
      assert(v.elapsed < 360);
      for (const t of [0.03, 0.22, 0.47, 0.72, 0.94]) {
        Object.assign(v, trackAt(t, 9.8), { vx: 0, vz: 0 });
        v.yaw += 0.35;
        v.finished = false;
        stepVehicle(v, idleInput, 1 / 120);
        assert(
          Math.max(...footprint(v).map((p) => nearest(p.x, p.z).distance)) <=
            9.405,
        );
      }
      setActiveTrack("alpine");
    });
test("legacy saves migrate and invalid preferences fall back safely", () => {
  const s = sanitizeSettings({
    best: 123,
    mapId: "bad",
    vehicleId: "bad",
    theme: "bad",
    records: { "frost:rally": 99, "bad:key": 10, "canyon:gt": -2 },
  });
  assert.equal(s.records["alpine:gt"], 123);
  assert.equal(s.records["frost:rally"], 99);
  assert.equal(Object.keys(s.records).length, 2);
  assert.equal(s.mapId, "alpine");
  assert.equal(s.vehicleId, "gt");
});
test("records are isolated and race selections are locked until returning to menu", () => {
  useGame.getState().setPhase("MENU");
  useSettings
    .getState()
    .set({ mapId: "canyon", vehicleId: "rally", records: {} });
  useSettings.getState().saveRecord(140);
  useSettings.getState().saveRecord(160);
  assert.equal(useSettings.getState().records["canyon:rally"], 140);
  useGame.getState().restart();
  useSettings.getState().set({ mapId: "frost", vehicleId: "muscle" });
  assert.equal(useSettings.getState().mapId, "canyon");
  useGame.getState().setPhase("MENU");
  useSettings.getState().set({ mapId: "frost", vehicleId: "muscle" });
  useSettings.getState().saveRecord(150);
  useSettings.getState().reset();
  assert.equal(useSettings.getState().records["canyon:rally"], 140);
  assert.equal(useSettings.getState().records["frost:muscle"], 150);
});
