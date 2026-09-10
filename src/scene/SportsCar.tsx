import { forwardRef, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { runtime, useSettings, useGame } from "../store";
import { keys } from "../game/input";
import {
  bodyGeometry,
  loft,
  polygon,
  tyreGeometry,
  WHEEL_Z,
  type V3,
} from "./carGeometry";

function Box({
  at,
  size,
  color = "#142027",
  rotation = [0, 0, 0],
}: {
  at: V3;
  size: V3;
  color?: string;
  rotation?: V3;
}) {
  return (
    <mesh position={at} rotation={rotation} castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.43} metalness={0.3} />
    </mesh>
  );
}
function Panel({
  points,
  color,
  glow = false,
}: {
  points: V3[];
  color: string;
  glow?: boolean;
}) {
  const g = useMemo(() => polygon(points), [points]);
  return (
    <mesh geometry={g} castShadow={!glow}>
      <meshStandardMaterial
        color={color}
        side={THREE.DoubleSide}
        roughness={glow ? 0.24 : 0.38}
        metalness={glow ? 0 : 0.22}
        emissive={glow ? color : "#000"}
        emissiveIntensity={glow ? 2.5 : 0}
      />
    </mesh>
  );
}
function Stroke({
  points,
  color,
  radius = 0.016,
  glow = false,
}: {
  points: V3[];
  color: string;
  radius?: number;
  glow?: boolean;
}) {
  const g = useMemo(() => {
    const p = new THREE.CurvePath<THREE.Vector3>();
    points
      .slice(1)
      .forEach((v, i) =>
        p.add(
          new THREE.LineCurve3(
            new THREE.Vector3(...points[i]),
            new THREE.Vector3(...v),
          ),
        ),
      );
    return new THREE.TubeGeometry(p, (points.length - 1) * 3, radius, 5, false);
  }, [points, radius]);
  return (
    <mesh geometry={g}>
      <meshStandardMaterial
        color={color}
        roughness={0.4}
        metalness={glow ? 0 : 0.4}
        emissive={glow ? color : "#000"}
        emissiveIntensity={glow ? 3 : 0}
      />
    </mesh>
  );
}

export const Car = forwardRef<THREE.Group>(function Car(_, ref) {
  const color = useSettings((s) => s.color),
    night = useSettings((s) => s.theme === "dark"),
    effects = useSettings((s) => s.effects);
  const wheels = useRef<THREE.Group[]>([]),
    steering = useRef<THREE.Group[]>([]),
    flames = useRef<THREE.Group>(null),
    brake = useRef<THREE.MeshStandardMaterial>(null);
  const target = useMemo(() => new THREE.Object3D(), []),
    body = useMemo(bodyGeometry, []),
    tyre = useMemo(tyreGeometry, []);
  const cabin = useMemo(
    () =>
      loft([
        [
          [-0.85, 0.92, 1.01],
          [0.85, 0.92, 1.01],
          [0.82, 0.99, 1.01],
          [-0.82, 0.99, 1.01],
        ],
        [
          [-0.88, 0.91, 0.2],
          [0.88, 0.91, 0.2],
          [0.665, 1.33, 0.2],
          [-0.665, 1.33, 0.2],
        ],
        [
          [-0.91, 0.93, -0.73],
          [0.91, 0.93, -0.73],
          [0.65, 1.36, -0.73],
          [-0.65, 1.36, -0.73],
        ],
        [
          [-0.91, 0.95, -1.36],
          [0.91, 0.95, -1.36],
          [0.82, 1.025, -1.36],
          [-0.82, 1.025, -1.36],
        ],
      ]),
    [],
  );
  const wing = useMemo(
    () =>
      loft([
        [
          [-1.19, 1.35, -2.36],
          [1.19, 1.35, -2.36],
          [1.19, 1.405, -2.36],
          [-1.19, 1.405, -2.36],
        ],
        [
          [-1.13, 1.3, -1.99],
          [1.13, 1.3, -1.99],
          [1.13, 1.355, -1.99],
          [-1.13, 1.355, -1.99],
        ],
      ]),
    [],
  );
  useFrame((_, dt) => {
    if (useGame.getState().phase === "PLAYING")
      wheels.current.forEach(
        (w) => (w.rotation.x += (runtime.speed * dt) / 0.455),
      );
    steering.current.forEach((w) => (w.rotation.y = runtime.steer * 0.38));
    if (flames.current) {
      flames.current.visible =
        effects && runtime.boosting && useGame.getState().phase === "PLAYING";
      flames.current.scale.z = 0.9 + Math.random() * 0.25;
    }
    if (brake.current) brake.current.emissiveIntensity = keys.down ? 5 : 1.4;
  });
  return (
    <group ref={ref}>
      <primitive object={target} position={[0, 0.1, 24]} />
      {night && (
        <spotLight
          position={[0, 0.72, 2.2]}
          target={target}
          color="#e1efff"
          intensity={65}
          distance={45}
          angle={0.55}
          penumbra={0.55}
          decay={1.2}
        />
      )}
      <mesh geometry={body} castShadow receiveShadow>
        <meshStandardMaterial
          color={color}
          vertexColors
          flatShading
          side={THREE.DoubleSide}
          roughness={0.31}
          metalness={0.28}
        />
      </mesh>
      <mesh geometry={cabin} castShadow>
        <meshStandardMaterial
          color={color}
          side={THREE.DoubleSide}
          roughness={0.3}
          metalness={0.3}
        />
      </mesh>
      <Panel
        color="#172a35"
        points={[
          [-0.76, 1.01, 0.984],
          [0.76, 1.01, 0.984],
          [0.62, 1.315, 0.24],
          [-0.62, 1.315, 0.24],
        ]}
      />
      <Panel
        color="#10222b"
        points={[
          [-0.775, 1.04, -1.321],
          [0.775, 1.04, -1.321],
          [0.61, 1.342, -0.777],
          [-0.61, 1.342, -0.777],
        ]}
      />
      <Stroke
        color="#566570"
        radius={0.009}
        points={[
          [-0.73, 1.025, 0.97],
          [0.73, 1.025, 0.97],
        ]}
      />
      <Box at={[0, 0.235, 0]} size={[1.7, 0.09, 4.57]} />
      <Panel
        color="#131d23"
        points={[
          [-0.95, 0.75, -2.437],
          [-0.72, 0.43, -2.442],
          [0.72, 0.43, -2.442],
          [0.95, 0.75, -2.437],
        ]}
      />
      <Panel
        color="#0b141a"
        points={[
          [-0.86, 0.41, -2.445],
          [-0.67, 0.24, -2.47],
          [0.67, 0.24, -2.47],
          [0.86, 0.41, -2.445],
        ]}
      />
      <Box at={[0, 0.605, -2.46]} size={[0.43, 0.15, 0.023]} color="#93a1a3" />
      <Box at={[0, 0.77, -2.45]} size={[0.22, 0.025, 0.02]} color="#566970" />
      {[-0.45, -0.225, 0, 0.225, 0.45].map((x) => (
        <Box
          key={x}
          at={[x, 0.275, -2.29]}
          size={[0.035, 0.14, 0.35]}
          rotation={[0.18, 0, 0]}
        />
      ))}
      <mesh geometry={wing} castShadow>
        <meshStandardMaterial
          color="#172229"
          roughness={0.4}
          metalness={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      {[-1, 1].map((side) => {
        const mirror = (p: V3[]): V3[] =>
          p.map(([x, y, z]) => [x * side, y, z]);
        return (
          <group key={side}>
            <Panel
              color="#142530"
              points={mirror([
                [0.862, 1.011, 0.79],
                [0.693, 1.306, 0.13],
                [0.687, 1.328, -0.67],
                [0.904, 1.018, -1.22],
              ])}
            />
            <Stroke
              color="#2b3a41"
              radius={0.018}
              points={mirror([
                [0.843, 1.014, 0.79],
                [0.683, 1.309, 0.13],
                [0.677, 1.331, -0.67],
                [0.895, 1.02, -1.22],
              ])}
            />
            <Stroke
              color="#28373e"
              radius={0.018}
              points={mirror([
                [0.728, 1.275, -0.46],
                [0.9, 1.013, -0.48],
              ])}
            />
            <Stroke
              color="#55231f"
              radius={0.006}
              points={mirror([
                [1.072, 0.87, 0.87],
                [1.04, 0.38, 0.61],
                [1.036, 0.33, -0.49],
                [1.078, 0.85, -0.67],
              ])}
            />
            <Box
              at={[side * 1.076, 0.81, -0.36]}
              size={[0.025, 0.035, 0.19]}
              color="#762a25"
            />
            <Panel
              color="#111e25"
              points={mirror([
                [1.099, 0.84, -0.82],
                [1.132, 0.86, -1.09],
                [1.095, 0.35, -0.87],
                [1.057, 0.35, -0.64],
              ])}
            />
            <Stroke
              color="#303a3d"
              radius={0.012}
              points={mirror([
                [1.111, 0.81, -0.91],
                [1.08, 0.4, -0.73],
              ])}
            />
            <Panel
              color="#18252a"
              points={mirror([
                [1.02, 0.25, -0.98],
                [1.025, 0.25, 0.94],
                [1.11, 0.32, 0.97],
                [1.11, 0.32, -0.99],
              ])}
            />
            <Box
              at={[side * 0.75, 1.125, -2.14]}
              size={[0.065, 0.43, 0.13]}
              rotation={[-0.2, 0, 0]}
            />
            <Panel
              color="#202c32"
              points={mirror([
                [1.2, 1.3, -2.4],
                [1.2, 1.46, -2.4],
                [1.14, 1.42, -1.94],
                [1.14, 1.3, -1.94],
              ])}
            />
            <Panel
              color="#20262c"
              points={mirror([
                [0.3, 0.875, -2.205],
                [0.88, 0.876, -2.205],
                [1.01, 0.76, -2.348],
                [0.77, 0.7, -2.419],
                [0.32, 0.746, -2.417],
              ])}
            />
            <Stroke
              color="#ff4528"
              radius={0.019}
              glow
              points={mirror([
                [0.34, 0.854, -2.247],
                [0.866, 0.854, -2.247],
                [0.959, 0.769, -2.36],
                [0.758, 0.729, -2.437],
                [0.375, 0.761, -2.435],
              ])}
            />
            <mesh position={[side * 0.64, 0.789, -2.395]}>
              <boxGeometry args={[0.44, 0.022, 0.023]} />
              <meshStandardMaterial
                ref={side === 1 ? brake : undefined}
                color="#ff321f"
                emissive="#ff2415"
                emissiveIntensity={1.4}
              />
            </mesh>
            {[-0.1, 0.1].map((dx) => (
              <group
                key={dx}
                position={[side * 0.77 + dx, 0.405, -2.465]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <mesh>
                  <cylinderGeometry args={[0.105, 0.105, 0.16, 6, 1, true]} />
                  <meshStandardMaterial
                    color="#72808a"
                    metalness={0.85}
                    roughness={0.24}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                <mesh position={[0, -0.065, 0]}>
                  <cylinderGeometry args={[0.084, 0.084, 0.014, 6]} />
                  <meshStandardMaterial color="#080e13" />
                </mesh>
              </group>
            ))}
            <Panel
              color="#142431"
              points={mirror([
                [0.38, 0.746, 2.235],
                [0.984, 0.794, 2.063],
                [1.011, 0.676, 2.22],
                [0.449, 0.657, 2.4],
              ])}
            />
            <Stroke
              color="#d4f4ff"
              radius={0.018}
              glow
              points={mirror([
                [0.436, 0.728, 2.279],
                [0.727, 0.762, 2.17],
                [0.961, 0.776, 2.11],
              ])}
            />
            <Stroke
              color="#b4e2ef"
              radius={0.01}
              glow
              points={mirror([
                [0.48, 0.69, 2.346],
                [0.75, 0.722, 2.235],
                [0.903, 0.739, 2.19],
              ])}
            />
            <Panel
              color="#101b23"
              points={mirror([
                [0.655, 0.574, 2.456],
                [0.91, 0.532, 2.487],
                [0.88, 0.292, 2.495],
                [0.568, 0.3, 2.499],
              ])}
            />
            <Stroke
              color="#2f3b40"
              radius={0.014}
              points={mirror([
                [0.69, 0.49, 2.474],
                [0.832, 0.468, 2.492],
              ])}
            />
            <Panel
              color="#15262e"
              points={mirror([
                [0.34, 0.825, 1.56],
                [0.49, 0.858, 1.39],
                [0.55, 0.799, 1.83],
                [0.39, 0.78, 1.95],
              ])}
            />
            <Box
              at={[side * 0.98, 1.005, 0.58]}
              size={[0.15, 0.045, 0.07]}
              rotation={[0, 0, side * -0.14]}
            />
            <mesh
              position={[side * 1.12, 1.024, 0.59]}
              scale={[0.2, 0.07, 0.12]}
              castShadow
            >
              <icosahedronGeometry args={[1, 0]} />
              <meshStandardMaterial
                color="#202d35"
                metalness={0.35}
                roughness={0.3}
              />
            </mesh>
            {WHEEL_Z.map((z, j) => (
              <group
                key={z}
                position={[side * 1.055, 0.455, z]}
                ref={(g) => {
                  if (g && j === 1) steering.current[side < 0 ? 0 : 1] = g;
                }}
              >
                <mesh position={[side * 0.06, 0.09, -0.22]}>
                  <boxGeometry args={[0.075, 0.19, 0.1]} />
                  <meshStandardMaterial color="#c1392d" metalness={0.3} />
                </mesh>
                <group
                  ref={(g) => {
                    if (g) wheels.current[(side < 0 ? 0 : 2) + j] = g;
                  }}
                >
                  <mesh
                    geometry={tyre}
                    rotation={[0, 0, Math.PI / 2]}
                    castShadow
                  >
                    <meshStandardMaterial color="#13181d" roughness={0.87} />
                  </mesh>
                  <mesh
                    position={[side * 0.068, 0, 0]}
                    rotation={[0, 0, Math.PI / 2]}
                  >
                    <cylinderGeometry args={[0.305, 0.305, 0.025, 24]} />
                    <meshStandardMaterial
                      color="#677178"
                      metalness={0.75}
                      roughness={0.5}
                    />
                  </mesh>
                  <mesh
                    position={[side * 0.159, 0, 0]}
                    rotation={[0, Math.PI / 2, 0]}
                  >
                    <torusGeometry args={[0.337, 0.026, 6, 24]} />
                    <meshStandardMaterial
                      color="#404d56"
                      metalness={0.8}
                      roughness={0.28}
                    />
                  </mesh>
                  {[...Array(10)].map((_, i) => (
                    <group key={i} rotation={[(i / 10) * Math.PI * 2, 0, 0]}>
                      <Box
                        at={[side * 0.153, 0.205, 0.024]}
                        size={[0.047, 0.27, 0.038]}
                        color="#263039"
                        rotation={[-0.25, 0, 0]}
                      />
                    </group>
                  ))}
                  <mesh
                    position={[side * 0.182, 0, 0]}
                    rotation={[0, 0, Math.PI / 2]}
                  >
                    <cylinderGeometry args={[0.093, 0.093, 0.042, 12]} />
                    <meshStandardMaterial
                      color="#414c54"
                      metalness={0.8}
                      roughness={0.25}
                    />
                  </mesh>
                  <mesh
                    position={[side * 0.207, 0, 0]}
                    rotation={[0, 0, Math.PI / 2]}
                  >
                    <cylinderGeometry args={[0.035, 0.035, 0.007, 8]} />
                    <meshStandardMaterial color="#c74430" />
                  </mesh>
                </group>
              </group>
            ))}
          </group>
        );
      })}
      <Panel
        color="#111b22"
        points={[
          [-0.5, 0.58, 2.488],
          [0.5, 0.58, 2.488],
          [0.6, 0.28, 2.511],
          [-0.6, 0.28, 2.511],
        ]}
      />
      <Panel
        color="#18232b"
        points={[
          [-1.02, 0.255, 2.25],
          [1.02, 0.255, 2.25],
          [1.01, 0.255, 2.52],
          [-1.01, 0.255, 2.52],
        ]}
      />
      <Box at={[0, 0.626, 2.445]} size={[0.11, 0.028, 0.016]} color="#718189" />
      <group ref={flames} visible={false}>
        {[-0.77, 0.77].map((x) => (
          <mesh
            key={x}
            position={[x, 0.405, -2.95]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <coneGeometry args={[0.13, 0.85, 7]} />
            <meshBasicMaterial color="#9beaff" toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
});
