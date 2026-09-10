import * as THREE from "three";
export const curve = new THREE.CatmullRomCurve3(
  [
    [-80, 0, 85],
    [-115, 0, 30],
    [-110, 0, -55],
    [-65, 0, -110],
    [10, 0, -115],
    [75, 0, -80],
    [112, 0, -20],
    [94, 0, 40],
    [45, 0, 64],
    [20, 0, 112],
    [-35, 0, 125],
  ].map((p) => new THREE.Vector3(...(p as [number, number, number]))),
  true,
  "catmullrom",
  0.35,
);
export const LENGTH = curve.getLength();
export const ROAD_WIDTH = 15;
export const points = curve.getSpacedPoints(600).slice(0, 600);
export function trackAt(t: number, offset = 0) {
  const p = curve.getPointAt(((t % 1) + 1) % 1);
  const d = curve.getTangentAt(((t % 1) + 1) % 1);
  return {
    x: p.x + d.z * offset,
    z: p.z - d.x * offset,
    yaw: Math.atan2(d.x, d.z),
  };
}
export function nearest(x: number, z: number) {
  let best = Infinity,
    index = 0,
    fraction = 0,
    px = 0,
    pz = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length];
    const dx = b.x - a.x,
      dz = b.z - a.z;
    const f = Math.max(
      0,
      Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz)),
    );
    const sx = a.x + dx * f,
      sz = a.z + dz * f;
    const d = (sx - x) ** 2 + (sz - z) ** 2;
    if (d < best) {
      best = d;
      index = i;
      fraction = f;
      px = sx;
      pz = sz;
    }
  }
  return {
    distance: Math.sqrt(best),
    t: (index + fraction) / points.length,
    p: { x: px, z: pz },
  };
}
export const obstacles = [0.105, 0.235, 0.405, 0.57, 0.715, 0.865].map(
  (t, i) => ({ ...trackAt(t, i % 2 ? 4.8 : -4.8), radius: 1.05 }),
);
export const mapPath =
  points
    .filter((_, i) => i % 5 === 0)
    .map((p, i) => `${i ? "L" : "M"}${(p.x + 140) * 0.6},${(p.z + 145) * 0.6}`)
    .join(" ") + " Z";
