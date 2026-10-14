import { forwardRef, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  bodyGeometry,
  loft,
  polygon,
  tyreGeometry,
  type V3,
} from "./carGeometry";
import { runtime, useGame, useSettings } from "../store";
import { keys } from "../game/input";
function Box({ p, s, color = "#17272d" }: { p: V3; s: V3; color?: string }) {
  return (
    <mesh position={p} castShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.25} />
    </mesh>
  );
}
function Pane({ p, color = "#19303c" }: { p: V3[]; color?: string }) {
  const g = useMemo(() => polygon(p), [p]);
  return (
    <mesh geometry={g}>
      <meshStandardMaterial
        color={color}
        roughness={0.3}
        metalness={0.25}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
export const TouringCar = forwardRef<THREE.Group, { kind: "rally" | "muscle" }>(
  function TouringCar({ kind }, ref) {
    const rally = kind === "rally",
      scale: V3 = rally ? [0.9, 1.03, 0.8] : [0.98, 1, 1.04],
      wheelZ = 1.49 * scale[2],
      wheelX = rally ? 0.96 : 1.04;
    const color = useSettings((s) => s.color),
      night = useSettings((s) => s.theme === "dark"),
      effects = useSettings((s) => s.effects),
      wheels = useRef<THREE.Group[]>([]),
      pivots = useRef<THREE.Group[]>([]),
      flame = useRef<THREE.Group>(null),
      lamps = useRef<THREE.MeshStandardMaterial[]>([]),
      target = useMemo(() => new THREE.Object3D(), []);
    const body = useMemo(() => bodyGeometry(scale), [kind]),
      tyre = useMemo(tyreGeometry, []);
    const cabin = useMemo(
      () =>
        rally
          ? loft([
              [
                [-0.77, 0.92, 0.8],
                [0.77, 0.92, 0.8],
                [0.74, 1.04, 0.8],
                [-0.74, 1.04, 0.8],
              ],
              [
                [-0.8, 0.94, 0.18],
                [0.8, 0.94, 0.18],
                [0.66, 1.55, 0.18],
                [-0.66, 1.55, 0.18],
              ],
              [
                [-0.85, 0.96, -1.16],
                [0.85, 0.96, -1.16],
                [0.69, 1.56, -1.16],
                [-0.69, 1.56, -1.16],
              ],
              [
                [-0.85, 0.95, -1.43],
                [0.85, 0.95, -1.43],
                [0.79, 1.15, -1.43],
                [-0.79, 1.15, -1.43],
              ],
            ])
          : loft([
              [
                [-0.82, 0.93, 0.64],
                [0.82, 0.93, 0.64],
                [0.8, 1.01, 0.64],
                [-0.8, 1.01, 0.64],
              ],
              [
                [-0.86, 0.94, -0.04],
                [0.86, 0.94, -0.04],
                [0.68, 1.36, -0.04],
                [-0.68, 1.36, -0.04],
              ],
              [
                [-0.89, 0.96, -0.95],
                [0.89, 0.96, -0.95],
                [0.68, 1.38, -0.95],
                [-0.68, 1.38, -0.95],
              ],
              [
                [-0.86, 0.96, -1.56],
                [0.86, 0.96, -1.56],
                [0.79, 1.03, -1.56],
                [-0.79, 1.03, -1.56],
              ],
            ]),
      [rally],
    );
    useFrame((_, dt) => {
      if (useGame.getState().phase === "PLAYING")
        wheels.current.forEach(
          (w) => (w.rotation.x += (runtime.speed * dt) / 0.455),
        );
      pivots.current.forEach((w) => (w.rotation.y = runtime.steer * 0.4));
      lamps.current.forEach((m) => (m.emissiveIntensity = keys.down ? 4 : 1.4));
      if (flame.current)
        flame.current.visible =
          effects && runtime.boosting && useGame.getState().phase === "PLAYING";
    });
    return (
      <group ref={ref}>
        <primitive object={target} position={[0, 0.1, 23]} />
        {night && (
          <spotLight
            position={[0, 0.85, rally ? 1.8 : 2.3]}
            target={target}
            intensity={65}
            angle={0.55}
            penumbra={0.6}
            distance={45}
            color="#e5edff"
          />
        )}
        <mesh geometry={body} castShadow>
          <meshStandardMaterial
            color={color}
            vertexColors
            flatShading
            side={THREE.DoubleSide}
            roughness={rally ? 0.4 : 0.3}
            metalness={0.25}
          />
        </mesh>
        <mesh geometry={cabin} castShadow>
          <meshStandardMaterial
            color={color}
            roughness={0.35}
            metalness={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
        {rally ? (
          <>
            <Pane
              p={[
                [-0.69, 1.063, 0.78],
                [0.69, 1.063, 0.78],
                [0.61, 1.52, 0.22],
                [-0.61, 1.52, 0.22],
              ]}
            />
            <Pane
              p={[
                [-0.72, 1.19, -1.426],
                [0.72, 1.19, -1.426],
                [0.64, 1.51, -1.205],
                [-0.64, 1.51, -1.205],
              ]}
            />
            <Box p={[0, 1.6, -0.35]} s={[0.45, 0.13, 0.43]} />
            <Box p={[0, 1.55, -1.41]} s={[1.6, 0.07, 0.29]} />
            {[-0.58, 0.58].map((x) => (
              <Box key={x} p={[x, 1.43, -1.32]} s={[0.08, 0.2, 0.12]} />
            ))}
          </>
        ) : (
          <>
            <Pane
              p={[
                [-0.74, 1.03, 0.62],
                [0.74, 1.03, 0.62],
                [0.63, 1.335, 0],
                [-0.63, 1.335, 0],
              ]}
            />
            <Pane
              p={[
                [-0.72, 1.057, -1.54],
                [0.72, 1.057, -1.54],
                [0.63, 1.35, -0.99],
                [-0.63, 1.35, -0.99],
              ]}
            />
            <Box p={[0, 0.997, 1.1]} s={[0.53, 0.15, 0.64]} />
            <Box p={[0, 0.94, -2.3]} s={[1.98, 0.075, 0.18]} />
          </>
        )}
        <Box p={[0, 0.28, 0]} s={[1.6, 0.09, rally ? 3.8 : 4.9]} />
        <Box
          p={[0, 0.51, rally ? 1.995 : 2.592]}
          s={[rally ? 1.65 : 1.91, 0.36, 0.035]}
        />
        <Box
          p={[0, 0.3, rally ? 2.005 : 2.59]}
          s={[rally ? 1.82 : 2, 0.08, 0.045]}
          color={rally ? "#222f32" : "#929e9e"}
        />
        <Box
          p={[0, 0.49, rally ? -1.975 : -2.54]}
          s={[rally ? 1.5 : 1.87, 0.31, 0.03]}
        />
        {[-1, 1].map((side, i) => (
          <group key={side}>
            <Pane
              p={
                rally
                  ? [
                      [side * 0.79, 1.07, 0.64],
                      [side * 0.69, 1.515, 0.12],
                      [side * 0.71, 1.52, -1.1],
                      [side * 0.854, 1.07, -1.27],
                    ]
                  : [
                      [side * 0.82, 1.04, 0.45],
                      [side * 0.7, 1.325, -0.07],
                      [side * 0.705, 1.342, -0.9],
                      [side * 0.88, 1.045, -1.38],
                    ]
              }
            />
            <Box
              p={[side * (rally ? 1.06 : 1.13), 1.05, rally ? 0.46 : 0.33]}
              s={[0.18, 0.1, 0.19]}
            />
            {rally ? (
              <>
                <Pane
                  color="#e5e2d0"
                  p={[
                    [side * 0.969, 0.84, 0.45],
                    [side * 0.977, 0.48, 0.4],
                    [side * 0.966, 0.47, -0.4],
                    [side * 0.961, 0.83, -0.45],
                  ]}
                />
                <Box p={[side * 0.91, 0.37, -1.46]} s={[0.16, 0.33, 0.06]} />
                <mesh
                  position={[side * 0.69, 0.89, 1.84]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <cylinderGeometry args={[0.16, 0.16, 0.1, 12]} />
                  <meshStandardMaterial
                    color="#edf4d3"
                    emissive="#f3e7af"
                    emissiveIntensity={night ? 1.8 : 0.3}
                  />
                </mesh>
                <mesh
                  position={[side * 0.29, 0.88, 1.89]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <cylinderGeometry args={[0.145, 0.145, 0.1, 12]} />
                  <meshStandardMaterial
                    color="#edf4d3"
                    emissive="#f3e7af"
                    emissiveIntensity={night ? 1.8 : 0.3}
                  />
                </mesh>
              </>
            ) : (
              <>
                {[0.61, 0.83].map((x) => (
                  <mesh
                    key={x}
                    position={[side * x, 0.56, 2.623]}
                    rotation={[Math.PI / 2, 0, 0]}
                  >
                    <cylinderGeometry args={[0.1, 0.1, 0.025, 16]} />
                    <meshStandardMaterial
                      color="#f2eed1"
                      emissive="#f2eed1"
                      emissiveIntensity={night ? 2 : 0.3}
                    />
                  </mesh>
                ))}
                <Pane
                  color="#172329"
                  p={[
                    [side * 0.12, 0.923, 0.69],
                    [side * 0.29, 0.923, 0.69],
                    [side * 0.29, 0.798, 2.05],
                    [side * 0.12, 0.798, 2.05],
                  ]}
                />
                <Pane
                  color="#172329"
                  p={[
                    [side * 0.12, 1.395, -0.95],
                    [side * 0.28, 1.395, -0.95],
                    [side * 0.28, 1.376, -0.04],
                    [side * 0.12, 1.376, -0.04],
                  ]}
                />
              </>
            )}
            <mesh
              position={[
                side * (rally ? 0.67 : 0.65),
                rally ? 0.64 : 0.75,
                rally ? -1.97 : -2.55,
              ]}
            >
              <boxGeometry
                args={[rally ? 0.28 : 0.48, rally ? 0.14 : 0.09, 0.035]}
              />
              <meshStandardMaterial
                ref={(m) => {
                  if (m) lamps.current[i] = m;
                }}
                color="#f2472b"
                emissive="#ff2d1a"
                emissiveIntensity={1.4}
              />
            </mesh>
            <mesh
              position={[side * 0.62, 0.38, rally ? -2.01 : -2.56]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.095, 0.095, 0.065, 8, 1, true]} />
              <meshStandardMaterial
                color="#9ba7ab"
                side={THREE.DoubleSide}
                metalness={0.8}
              />
            </mesh>
            {[-wheelZ, wheelZ].map((z, j) => (
              <group
                key={z}
                position={[side * wheelX, 0.455, z]}
                ref={(g) => {
                  if (g && j === 1) pivots.current[i] = g;
                }}
              >
                <group
                  ref={(g) => {
                    if (g) wheels.current[i * 2 + j] = g;
                  }}
                >
                  <mesh
                    geometry={tyre}
                    rotation={[0, 0, Math.PI / 2]}
                    castShadow
                  >
                    <meshStandardMaterial color="#151d21" roughness={0.9} />
                  </mesh>
                  <mesh
                    position={[side * 0.165, 0, 0]}
                    rotation={[0, Math.PI / 2, 0]}
                  >
                    <torusGeometry args={[0.33, 0.025, 6, 20]} />
                    <meshStandardMaterial
                      color={rally ? "#d7d1b4" : "#a4afb0"}
                      metalness={0.7}
                    />
                  </mesh>
                  {Array.from({ length: rally ? 8 : 5 }, (_, n) => (
                    <group
                      key={n}
                      rotation={[(n / (rally ? 8 : 5)) * Math.PI * 2, 0, 0]}
                    >
                      <Box
                        p={[side * 0.16, 0.19, 0]}
                        s={[0.04, 0.25, rally ? 0.04 : 0.075]}
                        color={rally ? "#d7d1b4" : "#a4afb0"}
                      />
                    </group>
                  ))}
                  <mesh
                    position={[side * 0.18, 0, 0]}
                    rotation={[0, 0, Math.PI / 2]}
                  >
                    <cylinderGeometry args={[0.09, 0.09, 0.025, 12]} />
                    <meshStandardMaterial color="#586267" />
                  </mesh>
                </group>
              </group>
            ))}
          </group>
        ))}
        <group ref={flame} visible={false}>
          {[-0.62, 0.62].map((x) => (
            <mesh
              key={x}
              position={[x, 0.38, rally ? -2.3 : -2.9]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <coneGeometry args={[0.13, 0.6, 6]} />
              <meshBasicMaterial color="#a6e8ff" toneMapped={false} />
            </mesh>
          ))}
        </group>
      </group>
    );
  },
);
