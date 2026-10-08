import { useMemo } from "react";
import { Track, Instances, Gates, type Item } from "./World";
import { RoadSigns } from "./RoadSigns";
import { nearest, trackAt, obstacles } from "../game/track";
import { useSettings } from "../store";
import { getMap, type MapId } from "../game/catalog";
const rand = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export function BiomeWorld({ mapId }: { mapId: MapId }) {
  const quality = useSettings((s) => s.quality),
    night = useSettings((s) => s.theme === "dark"),
    snow = mapId === "frost",
    spec = getMap(mapId);
  const { trunks, leaves, caps, rocks } = useMemo(() => {
    const trunks: Item[] = [],
      leaves: Item[] = [],
      caps: Item[] = [],
      rocks: Item[] = [];
    for (let i = 0; i < (quality === "low" ? 130 : 280); i++) {
      const x = rand(i) * 420 - 210,
        z = rand(i + 900) * 420 - 210;
      if (nearest(x, z).distance < 18) continue;
      const h = snow ? 6 + rand(i + 600) * 8 : 3 + rand(i + 600) * 4;
      if (snow) {
        trunks.push({ p: [x, h * 0.25, z], s: [1, h * 0.5, 1] });
        for (let j = 0; j < 3; j++) {
          leaves.push({
            p: [x, h * (0.35 + j * 0.2), z],
            s: [h * (0.26 - j * 0.05), h * 0.48, h * (0.26 - j * 0.05)],
          });
          caps.push({
            p: [x, h * (0.43 + j * 0.2), z],
            s: [h * (0.2 - j * 0.045), h * 0.34, h * (0.2 - j * 0.045)],
          });
        }
      } else if (i % 2 === 0) {
        trunks.push({ p: [x, h / 2, z], s: [2, h, 2] });
        leaves.push(
          { p: [x + 1, h * 0.55, z], s: [2, 0.35, 0.4] },
          { p: [x + 1.8, h * 0.7, z], s: [0.4, h * 0.35, 0.4] },
        );
      }
      if (i % 4 === 0 && nearest(x + 4, z + 3).distance > 15)
        rocks.push({ p: [x + 4, 1.4, z + 3], s: [2.4, 1.8, 2.7], r: i });
    }
    return { trunks, leaves, caps, rocks };
  }, [mapId, quality, snow]);
  const peaks = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => {
        const a = (i / 26) * Math.PI * 2,
          r = 235 + rand(i) * 65,
          h = 30 + rand(i + 10) * (snow ? 85 : 45);
        return { x: Math.cos(a) * r, z: Math.sin(a) * r, h };
      }),
    [snow],
  );
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.035, 0]}
        receiveShadow
      >
        <planeGeometry args={[1800, 1800]} />
        <meshStandardMaterial color={spec.ground} roughness={1} />
      </mesh>
      <Track />
      <Gates />
      <RoadSigns />
      {obstacles.map((o, i) => (
        <group key={i} position={[o.x, 0, o.z]}>
          <mesh position={[0, 0.55, 0]} castShadow>
            <coneGeometry args={[0.65, 1.1, 6]} />
            <meshStandardMaterial color="#ef793d" />
          </mesh>
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[1.3, 0.12, 1.3]} />
            <meshStandardMaterial color="#343c3a" />
          </mesh>
        </group>
      ))}
      <Instances
        items={trunks}
        kind="trunk"
        color={snow ? "#615c52" : "#637248"}
      />
      <Instances
        items={leaves}
        kind={snow ? "cone" : "box"}
        color={snow ? "#315c54" : "#637248"}
      />
      {snow && <Instances items={caps} kind="cone" color="#e7efeb" />}
      <Instances items={rocks} kind="rock" color={spec.rock} />
      {peaks.map((p, i) => (
        <group key={i} position={[p.x, 0, p.z]} rotation={[0, i, 0]}>
          <mesh position={[0, p.h / 2 - 3, 0]} castShadow>
            {snow ? (
              <coneGeometry args={[48, p.h, 6]} />
            ) : (
              <cylinderGeometry args={[15 + rand(i) * 12, 36, p.h, 6]} />
            )}
            <meshStandardMaterial
              color={snow ? "#8197a2" : i % 2 ? "#9d5b41" : "#bb7950"}
              flatShading
            />
          </mesh>
          <mesh position={[0, snow ? p.h * 0.78 : p.h - 4, 0]}>
            {snow ? (
              <coneGeometry args={[13, p.h * 0.3, 6]} />
            ) : (
              <cylinderGeometry
                args={[15 + rand(i) * 12, 18 + rand(i) * 12, 7, 6]}
              />
            )}
            <meshStandardMaterial
              color={snow ? "#e4ece8" : "#d6ab7c"}
              flatShading
            />
          </mesh>
        </group>
      ))}
      {[0.12, 0.43, 0.68, 0.9].map((t, i) => {
        const p = trackAt(t, 26);
        return (
          <group key={t} position={[p.x, 0, p.z]} rotation={[0, p.yaw, 0]}>
            <mesh position={[0, 2.1, 0]} castShadow>
              <boxGeometry args={[8, 4.2, 6]} />
              <meshStandardMaterial color={snow ? "#6c6153" : "#d6bc8c"} />
            </mesh>
            <mesh
              position={[0, 5, 0]}
              rotation={[0, Math.PI / 4, 0]}
              castShadow
            >
              <coneGeometry args={[6.5, 2.4, 4]} />
              <meshStandardMaterial color={snow ? "#edf2eb" : "#874e3a"} />
            </mesh>
            {[-2, 2].map((x) => (
              <mesh key={x} position={[x, 2.8, 3.015]}>
                <boxGeometry args={[1.3, 1.2, 0.025]} />
                <meshStandardMaterial
                  color={night ? "#f0ce83" : "#354a50"}
                  emissive={night ? "#df9c42" : "#000"}
                  emissiveIntensity={night ? 0.8 : 0}
                />
              </mesh>
            ))}
            {!snow && i === 0 && (
              <group position={[0, 0, 8]}>
                <mesh position={[0, 4.2, 0]}>
                  <boxGeometry args={[10, 0.45, 5]} />
                  <meshStandardMaterial color="#ba5845" />
                </mesh>
                {[-4, 4].map((x) => (
                  <mesh key={x} position={[x, 2, 0]}>
                    <boxGeometry args={[0.2, 4, 0.2]} />
                    <meshStandardMaterial color="#676b61" />
                  </mesh>
                ))}
                {[-2, 2].map((x) => (
                  <mesh key={x} position={[x, 1, 0]}>
                    <boxGeometry args={[0.8, 2, 0.7]} />
                    <meshStandardMaterial color="#e9dbc1" />
                  </mesh>
                ))}
              </group>
            )}
          </group>
        );
      })}
      {Array.from({ length: 16 }, (_, i) => {
        const p = trackAt(i / 16, 11.3);
        return (
          <group key={i} position={[p.x, 0, p.z]}>
            <mesh position={[0, 2.8, 0]}>
              <cylinderGeometry args={[0.09, 0.12, 5.6, 5]} />
              <meshStandardMaterial color="#4f5a58" />
            </mesh>
            <mesh position={[0, 5.6, 0]}>
              <boxGeometry args={[0.8, 0.14, 0.4]} />
              <meshStandardMaterial
                color="#e5d9b3"
                emissive="#f7ca81"
                emissiveIntensity={night ? 2 : 0}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
