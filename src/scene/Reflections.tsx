import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { PMREMGenerator } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// Local procedural lighting; no HDR download or external asset dependency.
export function Reflections({ intensity = 0.35 }: { intensity?: number }) {
  const { gl, scene } = useThree();
  useEffect(() => {
    const room = new RoomEnvironment(),
      generator = new PMREMGenerator(gl);
    const map = generator.fromScene(room, 0.04);
    const previous = scene.environment;
    scene.environment = map.texture;
    room.dispose();
    generator.dispose();
    return () => {
      scene.environment = previous;
      map.dispose();
    };
  }, [gl, scene]);
  useEffect(() => {
    scene.environmentIntensity = intensity;
  }, [scene, intensity]);
  return null;
}
