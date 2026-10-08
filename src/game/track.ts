import * as THREE from "three";
import { MAPS, getMap, type MapId } from "./catalog";
export function buildTrack(id: MapId) {
  const spec = getMap(id);
  const curve = new THREE.CatmullRomCurve3(
    spec.points.map((p) => new THREE.Vector3(p[0], 0, p[1])),
    true,
    "catmullrom",
    0.35,
  );
  const points = curve.getSpacedPoints(600).slice(0, 600),
    length = curve.getLength();
  const at = (t: number, offset = 0) => {
    const u = ((t % 1) + 1) % 1,
      p = curve.getPointAt(u),
      d = curve.getTangentAt(u);
    return {
      x: p.x + d.z * offset,
      z: p.z - d.x * offset,
      yaw: Math.atan2(d.x, d.z),
    };
  };
  const obstacles = [0.105, 0.235, 0.405, 0.57, 0.715, 0.865].map((t, i) => ({
    ...at(t, i % 2 ? 4.8 : -4.8),
    radius: 1.05,
  }));
  const mapPath =
    points
      .filter((_, i) => i % 5 === 0)
      .map(
        (p, i) => `${i ? "L" : "M"}${(p.x + 140) * 0.6},${(p.z + 145) * 0.6}`,
      )
      .join(" ") + " Z";
  return { id, curve, points, length, at, obstacles, mapPath };
}
export const tracks = Object.fromEntries(
  MAPS.map((m) => [m.id, buildTrack(m.id)]),
) as Record<MapId, ReturnType<typeof buildTrack>>;
let active = tracks.alpine;
export let curve = active.curve,
  points = active.points,
  LENGTH = active.length,
  obstacles = active.obstacles,
  mapPath = active.mapPath;
export const ROAD_WIDTH = 15;
export function setActiveTrack(id: MapId) {
  active = tracks[id] || tracks.alpine;
  curve = active.curve;
  points = active.points;
  LENGTH = active.length;
  obstacles = active.obstacles;
  mapPath = active.mapPath;
}
export function trackAt(t: number, offset = 0) {
  return active.at(t, offset);
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
