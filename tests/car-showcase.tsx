import React from "react";
import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { Car } from "../src/scene/Car";
import { Reflections } from "../src/scene/Reflections";
const view = new URLSearchParams(location.search).get("view");
const position: [number, number, number] =
  view === "front" ? [6, 2.8, 7] : view === "side" ? [8, 2, 0] : [-6, 2.6, -7];
createRoot(document.getElementById("root")!).render(
  <Canvas shadows camera={{ position, fov: 33 }} dpr={1.5}>
    <color attach="background" args={["#26323b"]} />
    <ambientLight intensity={0.4} />
    <hemisphereLight args={["#e7f2fc", "#59626a", 0.9]} />
    <directionalLight
      position={[4, 7, 5]}
      intensity={1.8}
      castShadow
      shadow-mapSize={[2048, 2048]}
    />
    <directionalLight position={[-4, 5, -4]} intensity={0.8} color="#c4e0ff" />
    <Reflections intensity={0.4} />
    <group position={[0, -0.5, 0]}>
      <Car />
    </group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#26323b" roughness={0.75} />
    </mesh>
  </Canvas>,
);
