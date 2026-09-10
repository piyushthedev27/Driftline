import * as THREE from "three";
export type V3 = [number, number, number];
type Section = [number, number, number, number];
const sections: Section[] = [
  [-2.43, 0.99, 0.78, 0.69],
  [-2.17, 1.1, 0.94, 0.86],
  [-1.5, 1.14, 0.98, 0.91],
  [-0.8, 1.06, 0.94, 0.87],
  [0.1, 1.02, 0.9, 0.82],
  [0.85, 1.075, 0.9, 0.85],
  [1.48, 1.14, 0.94, 0.88],
  [1.98, 1.07, 0.79, 0.73],
  [2.4, 0.98, 0.66, 0.59],
  [2.48, 0.91, 0.55, 0.47],
];
export const WHEEL_Z = [-1.49, 1.47];
export function dimensions(z: number) {
  const i = Math.max(
    0,
    sections.findIndex(
      (s, i) => i < sections.length - 1 && z <= sections[i + 1][0],
    ),
  );
  const a = sections[i],
    b = sections[Math.min(i + 1, sections.length - 1)];
  const t = Math.max(0, Math.min(1, (z - a[0]) / (b[0] - a[0])));
  return {
    width: THREE.MathUtils.lerp(a[1], b[1], t),
    top: THREE.MathUtils.lerp(a[2], b[2], t),
    shoulder: THREE.MathUtils.lerp(a[3], b[3], t),
  };
}
export function polygon(vertices: V3[], indices?: number[]) {
  const data: number[] = [];
  const triangles =
    indices ||
    Array.from({ length: vertices.length - 2 }, (_, i) => [
      0,
      i + 1,
      i + 2,
    ]).flat();
  triangles.forEach((i) => data.push(...vertices[i]));
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(data, 3));
  g.computeVertexNormals();
  return g;
}
// A continuous painted shell with open wheel wells and raised fender shoulders.
export function bodyGeometry() {
  const positions: number[] = [],
    colors: number[] = [];
  const zs = Array.from(
    new Set([
      ...sections.map((s) => s[0]),
      ...Array.from({ length: 51 }, (_, i) => -2.43 + (i * 4.91) / 50),
      ...WHEEL_Z.flatMap((z) =>
        Array.from(
          { length: 17 },
          (_, i) => z + 0.51 * Math.cos((i / 16) * Math.PI),
        ),
      ),
    ]),
  ).sort((a, b) => a - b);
  const add = (a: V3, b: V3, c: V3) => {
    positions.push(...a, ...b, ...c);
    const shade = 0.97 + Math.sin(a[2] * 8 + b[0] * 3) * 0.025;
    colors.push(...Array(9).fill(shade));
  };
  const quad = (a: V3, b: V3, c: V3, d: V3) => {
    add(a, b, c);
    add(a, c, d);
  };
  const arch = (z: number) =>
    Math.max(
      0.27,
      ...WHEEL_Z.map((wz) =>
        Math.abs(z - wz) <= 0.51
          ? 0.455 + Math.sqrt(Math.max(0, 0.51 ** 2 - (z - wz) ** 2))
          : 0.27,
      ),
    );
  const row = (z: number): V3[] => {
    const d = dimensions(z),
      high = Math.max(d.shoulder, arch(z) + 0.06);
    return [-1, -0.86, -0.58, 0, 0.58, 0.86, 1].map((x) => [
      x * d.width,
      Math.abs(x) === 1
        ? high
        : Math.abs(x) === 0.86
          ? Math.max(d.top - 0.035, high + 0.015)
          : d.top + (x === 0 ? 0.008 : 0.018),
      z,
    ]);
  };
  for (let i = 0; i < zs.length - 1; i++) {
    const z = zs[i],
      nz = zs[i + 1],
      a = row(z),
      b = row(nz);
    for (let j = 0; j < a.length - 1; j++) quad(a[j], b[j], b[j + 1], a[j + 1]);
    for (const side of [-1, 1]) {
      const ai = side < 0 ? 0 : 6,
        d = dimensions(z),
        nd = dimensions(nz);
      quad(
        a[ai],
        [side * (d.width - 0.035), arch(z), z],
        [side * (nd.width - 0.035), arch(nz), nz],
        b[ai],
      );
    }
  }
  for (const z of [zs[0], zs[zs.length - 1]]) {
    const r = row(z);
    for (let i = 0; i < r.length - 1; i++)
      quad(r[i], r[i + 1], [r[i + 1][0], 0.27, z], [r[i][0], 0.27, z]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}
export function loft(rings: V3[][]) {
  const vertices: V3[] = [],
    indices: number[] = [];
  for (const r of rings) vertices.push(...r);
  const n = rings[0].length;
  for (let i = 0; i < rings.length - 1; i++)
    for (let j = 0; j < n; j++) {
      const a = i * n + j,
        b = i * n + ((j + 1) % n),
        c = b + n,
        d = a + n;
      indices.push(a, b, c, a, c, d);
    }
  for (const i of [0, rings.length - 1])
    for (let j = 1; j < n - 1; j++)
      indices.push(i * n, i * n + j, i * n + j + 1);
  return polygon(vertices, indices);
}
export function tyreGeometry() {
  return new THREE.LatheGeometry(
    [
      [0.31, -0.155],
      [0.375, -0.165],
      [0.417, -0.143],
      [0.448, -0.102],
      [0.455, -0.045],
      [0.455, 0.045],
      [0.448, 0.102],
      [0.417, 0.143],
      [0.375, 0.165],
      [0.31, 0.155],
      [0.31, -0.155],
    ].map((p) => new THREE.Vector2(p[0], p[1])),
    24,
  );
}
