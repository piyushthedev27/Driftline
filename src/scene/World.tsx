import { useMemo, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import { curve, trackAt, nearest, obstacles } from "../game/track";
import { useSettings, runtime } from "../store";
import { useFrame } from "@react-three/fiber";
import { RoadSigns } from "./RoadSigns";

function ribbon(offset: number, width: number, y: number) {
  const v: number[] = [],
    ix: number[] = [];
  for (let i = 0; i <= 600; i++) {
    for (const side of [-1, 1]) {
      const p = trackAt(i / 600, offset + (side * width) / 2);
      v.push(p.x, y, p.z);
    }
    if (i < 600) {
      const n = i * 2;
      ix.push(n, n + 2, n + 1, n + 1, n + 2, n + 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
  g.setIndex(ix);
  g.computeVertexNormals();
  return g;
}
type Item = {
  p: [number, number, number];
  s: [number, number, number];
  r?: number;
  color?: string;
};
function Instances({
  items,
  kind,
  color,
}: {
  items: Item[];
  kind: "box" | "cone" | "rock" | "trunk";
  color: string;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const o = new THREE.Object3D();
    items.forEach((it, i) => {
      o.position.set(...it.p);
      o.scale.set(...it.s);
      o.rotation.set(0, it.r || 0, 0);
      o.updateMatrix();
      ref.current!.setMatrixAt(i, o.matrix);
      if (it.color) ref.current!.setColorAt(i, new THREE.Color(it.color));
    });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [items]);
  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, items.length]}
      castShadow
      receiveShadow
    >
      {kind === "box" ? (
        <boxGeometry />
      ) : kind === "cone" ? (
        <coneGeometry args={[1, 1, 5]} />
      ) : kind === "trunk" ? (
        <cylinderGeometry args={[0.2, 0.3, 1, 5]} />
      ) : (
        <icosahedronGeometry args={[1, 0]} />
      )}
      <meshStandardMaterial color={color} roughness={0.94} flatShading />
    </instancedMesh>
  );
}
const random = (n: number) => {
  const a = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return a - Math.floor(a);
};
function Track() {
  const geometries = useMemo(
    () => [
      ribbon(0, 19, 0.025),
      ribbon(0, 15, 0.06),
      ribbon(-7.7, 0.55, 0.09),
      ribbon(7.7, 0.55, 0.09),
    ],
    [],
  );
  const marks = useMemo(
    () =>
      Array.from({ length: 160 }, (_, i) => {
        const p = trackAt(i / 160);
        return {
          p: [p.x, 0.082, p.z] as [number, number, number],
          s: [0.14, 0.02, 1.9] as [number, number, number],
          r: p.yaw,
        };
      }),
    [],
  );
  const rails = useMemo(
    () =>
      [-1, 1].flatMap((side) =>
        Array.from({ length: 250 }, (_, i) => {
          const p = trackAt(i / 250, 9.7 * side);
          return {
            p: [p.x, 0.84, p.z] as [number, number, number],
            s: [0.16, 0.36, 3.25] as [number, number, number],
            r: p.yaw,
          };
        }),
      ),
    [],
  );
  const posts = useMemo(
    () =>
      rails
        .filter((_, i) => i % 3 === 0)
        .map((x) => ({
          ...x,
          p: [x.p[0], 0.47, x.p[2]] as [number, number, number],
          s: [0.14, 0.95, 0.14] as [number, number, number],
        })),
    [rails],
  );
  const curbs = useMemo(
    () =>
      [-1, 1].flatMap((side) =>
        Array.from({ length: 170 }, (_, i) => {
          const p = trackAt(i / 170, 7.7 * side);
          return {
            p: [p.x, 0.104, p.z] as [number, number, number],
            s: [0.58, 0.025, 2] as [number, number, number],
            r: p.yaw,
          };
        }),
      ),
    [],
  );
  return (
    <group>
      {geometries.map((g, i) => (
        <mesh key={i} geometry={g} receiveShadow>
          <meshStandardMaterial
            color={["#ae9d7b", "#4a5559", "#e3ded0", "#e3ded0"][i]}
            roughness={1}
          />
        </mesh>
      ))}
      <Instances items={marks} kind="box" color="#ddd9bf" />
      <Instances items={curbs} kind="box" color="#b54a38" />
      <Instances items={rails} kind="box" color="#a5b0ab" />
      <Instances items={posts} kind="box" color="#747f7a" />
      {Array.from({ length: 16 }, (_, i) => {
        const p = trackAt(0, (i - 7.5) * 0.88);
        return (
          <mesh key={i} position={[p.x, 0.12, p.z]} rotation={[0, p.yaw, 0]}>
            <boxGeometry args={[0.87, 0.02, 1.6]} />
            <meshStandardMaterial color={i % 2 ? "#eee9d8" : "#273436"} />
          </mesh>
        );
      })}
    </group>
  );
}
function Scenery() {
  const quality = useSettings((s) => s.quality);
  const { trees, trunks, rocks, mountains, snow, houses } = useMemo(() => {
    const trees: Item[] = [],
      trunks: Item[] = [],
      rocks: Item[] = [],
      mountains: Item[] = [],
      snow: Item[] = [],
      houses: Item[] = [];
    for (let i = 0; i < (quality === "low" ? 160 : 340); i++) {
      const x = random(i * 3) * 350 - 160,
        z = random(i * 3 + 1) * 350 - 170;
      if (nearest(x, z).distance < 14 || x < -130) continue;
      const h = 5 + random(i + 700) * 9;
      trunks.push({ p: [x, h * 0.2, z], s: [1, h * 0.4, 1] });
      for (let j = 0; j < 3; j++)
        trees.push({
          p: [x, h * (0.38 + j * 0.2), z],
          s: [h * (0.31 - j * 0.065), h * 0.53, h * (0.31 - j * 0.065)],
          color: ["#3c6040", "#507046", "#6c813f"][i % 3],
        });
      if (i % 4 === 0)
        rocks.push({
          p: [x + 4, 1, z + 3],
          s: [3 + random(i) * 2, 2.5, 3],
          r: i,
        });
    }
    for (let i = 0; i < 25; i++) {
      const x = 25 + i * 17,
        z = -185 - random(i + 10) * 65,
        h = 45 + random(i + 2) * 100;
      mountains.push({
        p: [x, h * 0.33 - 12, z],
        s: [45 + random(i) * 20, h, 40],
        r: i,
        color: ["#6b8181", "#85918a", "#6c8287"][i % 3],
      });
      snow.push({ p: [x, h * 0.73 - 12, z], s: [12, h * 0.2, 11], r: i });
    }
    for (let i = 0; i < 15; i++) {
      const p = trackAt(0.48 + i * 0.013, 22 + random(i) * 14);
      houses.push({
        p: [p.x, 2.5, p.z],
        s: [4 + random(i) * 3, 5 + random(i + 9) * 3, 5],
        r: p.yaw,
      });
    }
    return { trees, trunks, rocks, mountains, snow, houses };
  }, [quality]);
  return (
    <group>
      <Instances items={trunks} kind="trunk" color="#705444" />
      <Instances items={trees} kind="cone" color="#ffffff" />
      <Instances items={rocks} kind="rock" color="#7c8173" />
      <Instances items={mountains} kind="rock" color="#ffffff" />
      <Instances items={snow} kind="rock" color="#e3e6d9" />
      {houses.map((h, i) => (
        <group
          key={i}
          position={[h.p[0], 0, h.p[2]]}
          rotation={[0, h.r || 0, 0]}
        >
          <mesh position={[0, h.s[1] / 2, 0]} castShadow>
            <boxGeometry args={h.s} />
            <meshStandardMaterial
              color={["#e4c998", "#e9d9b4", "#cfad86"][i % 3]}
            />
          </mesh>
          <mesh
            position={[0, h.s[1] + 1.1, 0]}
            rotation={[0, Math.PI / 4, 0]}
            castShadow
          >
            <coneGeometry args={[h.s[0] * 0.85, 2.3, 4]} />
            <meshStandardMaterial color="#ba6445" flatShading />
          </mesh>
          {[-1, 1].map((x) => (
            <mesh key={x} position={[x * 1.2, h.s[1] - 0.9, 2.515]}>
              <boxGeometry args={[0.7, 1.1, 0.04]} />
              <meshStandardMaterial color="#304d50" />
            </mesh>
          ))}
          <mesh position={[0, 1.2, 2.52]}>
            <boxGeometry args={[0.9, 2.4, 0.06]} />
            <meshStandardMaterial color="#716652" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
function Landmarks() {
  const night = useSettings((s) => s.theme === "dark");
  const tunnel = trackAt(0.31);
  return (
    <group>
      <group position={[-157, 0, -5]}>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[17, 22, 12, 7]} />
          <meshStandardMaterial color="#8e947b" flatShading />
        </mesh>
        <mesh position={[0, 15, 0]} castShadow>
          <cylinderGeometry args={[2, 3.7, 24, 8]} />
          <meshStandardMaterial color="#eddfb9" />
        </mesh>
        <mesh position={[0, 27.5, 0]}>
          <cylinderGeometry args={[3, 3, 2, 8]} />
          <meshStandardMaterial color="#374d51" />
        </mesh>
        <mesh position={[0, 30, 0]}>
          <coneGeometry args={[4, 3, 8]} />
          <meshStandardMaterial color="#b5573c" />
        </mesh>
        <mesh position={[0, 27.7, 0]}>
          <cylinderGeometry args={[2.5, 2.5, 1.1, 8]} />
          <meshStandardMaterial
            color="#ffeab5"
            emissive="#ffc97a"
            emissiveIntensity={night ? 2 : 0.2}
          />
        </mesh>
      </group>
      <group position={[tunnel.x, 0, tunnel.z]} rotation={[0, tunnel.yaw, 0]}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 11, 3.5, 0]} castShadow>
            <boxGeometry args={[3, 7, 28]} />
            <meshStandardMaterial color="#737d70" />
          </mesh>
        ))}
        <mesh position={[0, 8, 0]} castShadow>
          <boxGeometry args={[25, 3, 28]} />
          <meshStandardMaterial color="#707d6c" />
        </mesh>
        {[-10, 0, 10].map((z) => (
          <mesh key={z} position={[0, 6.45, z]}>
            <boxGeometry args={[1.5, 0.15, 1]} />
            <meshStandardMaterial
              color="#ffe0a1"
              emissive="#ffd486"
              emissiveIntensity={2}
            />
          </mesh>
        ))}
      </group>
      {Array.from({ length: 12 }, (_, i) => {
        const p = trackAt(0.04 + i * 0.006);
        return (
          <mesh key={i} position={[p.x, -5, p.z]}>
            <boxGeometry args={[16, 10, 1.1]} />
            <meshStandardMaterial color="#989989" />
          </mesh>
        );
      })}
      {Array.from({ length: 24 }, (_, i) => {
        const p = trackAt(i / 24, 10.8);
        return (
          <group key={i} position={[p.x, 0, p.z]} rotation={[0, p.yaw, 0]}>
            <mesh position={[0, 3.2, 0]}>
              <cylinderGeometry args={[0.09, 0.13, 6.4, 5]} />
              <meshStandardMaterial color="#374846" />
            </mesh>
            <mesh position={[-0.65, 6.3, 0]}>
              <boxGeometry args={[1.5, 0.16, 0.38]} />
              <meshStandardMaterial
                color="#c3ba92"
                emissive="#ffdc8b"
                emissiveIntensity={night ? 2.5 : 0}
              />
            </mesh>
          </group>
        );
      })}
      {obstacles.map((o, i) => (
        <group key={i} position={[o.x, 0, o.z]}>
          <mesh position={[0, 0.55, 0]} castShadow>
            <coneGeometry args={[0.65, 1.1, 6]} />
            <meshStandardMaterial color="#e98343" />
          </mesh>
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[1.3, 0.16, 1.3]} />
            <meshStandardMaterial color="#e0d5b5" />
          </mesh>
          <mesh position={[0, 0.57, 0]}>
            <cylinderGeometry args={[0.26, 0.37, 0.2, 6]} />
            <meshStandardMaterial color="#f7e8c3" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
function Gates() {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const p = trackAt((runtime.nextGate % 8) / 8);
    ref.current.position.set(p.x, 0, p.z);
    ref.current.rotation.y = p.yaw;
  });
  return (
    <group ref={ref}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 7.7, 3, 0]}>
          <boxGeometry args={[0.25, 6, 0.25]} />
          <meshStandardMaterial
            color="#d9ecb4"
            emissive="#c3ee8d"
            emissiveIntensity={0.35}
          />
        </mesh>
      ))}
      <mesh position={[0, 6, 0]}>
        <boxGeometry args={[15.7, 0.32, 0.25]} />
        <meshStandardMaterial
          color="#d6ee9e"
          emissive="#c3ee8d"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}
function Panorama() {
  const night = useSettings((s) => s.theme === "dark");
  const peaks = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const angle = (i / 18) * Math.PI * 2,
          x = Math.cos(angle) * 430,
          z = Math.sin(angle) * 430;
        const h = 70 + random(i + 20) * 90;
        const g = new THREE.CylinderGeometry(0, 95, h, 7, 3).toNonIndexed();
        const pos = g.getAttribute("position");
        for (let k = 0; k < pos.count; k++) {
          const px = pos.getX(k),
            py = pos.getY(k),
            pz = pos.getZ(k);
          const jitter = Math.sin(px * 0.63 + pz * 0.27 + py * 0.31) * 7;
          pos.setXYZ(
            k,
            px + jitter,
            py + Math.sin(px * 0.23 + pz * 0.48) * 7,
            pz + jitter * 0.7,
          );
        }
        g.computeVertexNormals();
        const colors = [];
        for (let k = 0; k < pos.count; k++) {
          const col = new THREE.Color(
            pos.getY(k) > h * 0.24
              ? "#dfe5dc"
              : pos.getY(k) > h * 0.02
                ? "#859b9c"
                : "#758e8f",
          );
          colors.push(col.r, col.g, col.b);
        }
        g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        return { g, x, z, h };
      }),
    [],
  );
  return (
    <group>
      {peaks.map((p, i) => (
        <mesh
          key={i}
          geometry={p.g}
          position={[p.x, p.h * 0.33 - 15, p.z]}
          rotation={[0, i, 0]}
        >
          <meshStandardMaterial vertexColors flatShading roughness={1} />
        </mesh>
      ))}
      {Array.from({ length: 13 }, (_, i) => (
        <group key={i} position={[-300 + i * 55, 110 + random(i) * 30, -300]}>
          {[0, 1, 2].map((j) => (
            <mesh
              key={j}
              position={[j * 12, j === 1 ? 6 : 0, 0]}
              scale={[18, 7 + j * 3, 9]}
            >
              <icosahedronGeometry args={[1, 0]} />
              <meshStandardMaterial
                color={night ? "#456575" : "#f3f0d8"}
                flatShading
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
export function World() {
  const night = useSettings((s) => s.theme === "dark");
  const island = useMemo(() => {
    const g = new THREE.CylinderGeometry(190, 205, 16, 18);
    return g;
  }, []);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -9, 0]} receiveShadow>
        <planeGeometry args={[2200, 2200]} />
        <meshStandardMaterial
          color={night ? "#163f50" : "#5799a9"}
          roughness={0.45}
          metalness={0.15}
        />
      </mesh>
      <mesh geometry={island} position={[45, -8, 0]} receiveShadow>
        <meshStandardMaterial
          color={night ? "#304737" : "#859561"}
          flatShading
        />
      </mesh>
      <Track />
      <Scenery />
      <Landmarks />
      <Gates />
      <Panorama />
      <RoadSigns />
      {Array.from({ length: 15 }, (_, i) => {
        const x = -200 - random(i) * 190,
          z = -220 + random(i + 5) * 400;
        return (
          <mesh
            key={i}
            position={[x, -8.9, z]}
            rotation={[-Math.PI / 2, 0, 0.1]}
          >
            <planeGeometry args={[12 + random(i) * 20, 0.35]} />
            <meshBasicMaterial
              color={night ? "#416371" : "#a0c8c5"}
              transparent
              opacity={0.35}
            />
          </mesh>
        );
      })}
      <mesh position={[-230, 150, -420]}>
        <icosahedronGeometry args={[24, 1]} />
        <meshBasicMaterial color={night ? "#e3e8cc" : "#fff1c5"} />
      </mesh>
    </group>
  );
}
