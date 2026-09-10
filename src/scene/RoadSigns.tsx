import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { trackAt } from "../game/track";

export function RoadSigns() {
  const signs = useMemo(
    () =>
      [
        {
          t: 0.015,
          title: "ALPINE COAST",
          sub: "TIME ATTACK   /   2 LAPS",
          arrow: false,
        },
        { t: 0.19, title: "SUMMIT PASS", sub: "TUNNEL AHEAD", arrow: false },
        {
          t: 0.45,
          title: "PORTO ALPINO",
          sub: "TAKE THE SCENIC ROUTE",
          arrow: false,
        },
        { t: 0.73, title: "SLOW", sub: "TIGHT CORNER", arrow: true },
        {
          t: 0.88,
          title: "COAST ROAD",
          sub: "START / FINISH  →",
          arrow: false,
        },
      ].map((sign) => {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#213f40";
        ctx.fillRect(0, 0, 512, 256);
        ctx.strokeStyle = "#cbd5b6";
        ctx.lineWidth = 5;
        ctx.strokeRect(10, 10, 492, 236);
        ctx.fillStyle = "#ecedcd";
        ctx.textAlign = "center";
        ctx.font = "bold 47px Arial";
        ctx.fillText(sign.title, 256, 111);
        ctx.font = "22px Arial";
        ctx.fillText(sign.sub, 256, 170);
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return { ...sign, ...trackAt(sign.t, -11), texture };
      }),
    [],
  );
  useEffect(() => () => signs.forEach((s) => s.texture.dispose()), [signs]);
  return (
    <group>
      {signs.map((sign) => (
        <group
          key={sign.t}
          position={[sign.x, 0, sign.z]}
          rotation={[0, sign.yaw + Math.PI, 0]}
        >
          <mesh position={[0, 2.1, 0]}>
            <boxGeometry args={[0.13, 4.2, 0.13]} />
            <meshStandardMaterial color="#6f7d6e" />
          </mesh>
          <mesh position={[0, 4.1, 0]}>
            <boxGeometry args={[4.6, 2.3, 0.13]} />
            <meshStandardMaterial color="#294343" />
          </mesh>
          <mesh position={[0, 4.1, 0.075]}>
            <planeGeometry args={[4.5, 2.2]} />
            <meshStandardMaterial map={sign.texture} roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
