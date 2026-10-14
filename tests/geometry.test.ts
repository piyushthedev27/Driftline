import { test } from "node:test";
import assert from "node:assert/strict";
import {
  bodyGeometry,
  dimensions,
  WHEEL_Z,
  type V3,
} from "../src/scene/carGeometry";
for (const scale of [
  [1, 1, 1],
  [0.9, 1.03, 0.8],
  [0.98, 1, 1.04],
] as V3[])
  test(`body ${scale}: wheel openings retain circular clearance and side normals face outward`, () => {
    const g = bodyGeometry(scale),
      p = g.getAttribute("position"),
      n = g.getAttribute("normal");
    let edges = 0,
      left = 0,
      right = 0;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i),
        w = dimensions(z / scale[2]).width * scale[0];
      if (Math.abs(Math.abs(x) - (w - 0.035)) < 0.0001 && y > 0.3) {
        for (const center of WHEEL_Z.map((v) => v * scale[2]))
          if (Math.abs(z - center) < 0.5) {
            assert(Math.hypot(z - center, y - 0.455) > 0.509);
            edges++;
          }
      }
      if (x < -0.95 * scale[0] && n.getX(i) < -0.5) left++;
      if (x > 0.95 * scale[0] && n.getX(i) > 0.5) right++;
      assert(Number.isFinite(x + y + z));
    }
    assert(edges > 20);
    assert(left > 20 && right > 20);
    g.dispose();
  });
