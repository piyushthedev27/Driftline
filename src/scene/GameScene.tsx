import { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { World } from "./World";
import { Car } from "./Car";
import { runtime, useGame, useSettings, useTelemetry } from "../store";
import { stepVehicle } from "../game/vehicle";
import { keys } from "../game/input";
import { audio } from "../game/audio";
import { nearest } from "../game/track";
const target = new THREE.Vector3(),
  look = new THREE.Vector3();
function Simulation() {
  const car = useRef<THREE.Group>(null),
    dust = useRef<THREE.InstancedMesh>(null),
    sample = useRef(0),
    smoothLook = useRef(new THREE.Vector3(runtime.x, 1, runtime.z)),
    lastRun = useRef(-1),
    accumulator = useRef(0);
  const reduced = useRef(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const dummy = useRef(new THREE.Object3D());
  const particles = useRef(
    Array.from({ length: 32 }, () => ({ x: 0, y: 0, z: 0, life: 0 })),
  );
  const particleIndex = useRef(0);
  const emissionTime = useRef(0);
  const smokeTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 32;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, "rgba(220,224,215,.6)");
    gradient.addColorStop(0.4, "rgba(220,224,215,.25)");
    gradient.addColorStop(1, "rgba(220,224,215,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(canvas);
  }, []);
  const settings = useSettings();
  useFrame(({ camera, clock }, rawDt) => {
    const dt = Math.min(rawDt, 0.05),
      g = useGame.getState();
    let collided = false,
      passed = false;
    if (g.phase === "PLAYING") {
      accumulator.current += dt;
      while (accumulator.current >= 1 / 120) {
        const before = runtime.collisions,
          gate = runtime.nextGate;
        stepVehicle(runtime, keys, 1 / 120);
        collided ||= runtime.collisions > before;
        passed ||= runtime.nextGate > gate;
        accumulator.current -= 1 / 120;
      }
      if (runtime.finished) {
        if (!settings.best || runtime.elapsed < settings.best)
          settings.set({ best: runtime.elapsed });
        g.setPhase("FINISHED");
        if (settings.sound) audio.beep(880, 0.5);
      } else if (runtime.elapsed >= 360) g.setPhase("GAME_OVER");
    } else accumulator.current = 0;
    if (collided && settings.sound) audio.beep(65, 0.2);
    if (passed && settings.sound) audio.beep(660, 0.12);
    if (car.current) {
      car.current.position.set(runtime.x, 0.02, runtime.z);
      car.current.rotation.set(
        0,
        runtime.yaw,
        -runtime.steer * Math.min(Math.abs(runtime.speed) / 55, 1) * 0.035,
      );
    }
    const menu = g.phase === "MENU",
      yaw = runtime.yaw,
      t = clock.elapsedTime;
    if (menu) {
      target.set(
        runtime.x + Math.sin(yaw + 2.45 + Math.sin(t * 0.1) * 0.13) * 11,
        4.8,
        runtime.z + Math.cos(yaw + 2.45 + Math.sin(t * 0.1) * 0.13) * 11,
      );
      look.set(runtime.x, 1.1, runtime.z);
    } else {
      const dist = 10.1 + Math.abs(runtime.speed) * 0.035;
      target.set(
        runtime.x - Math.sin(yaw) * dist,
        3.6 + Math.abs(runtime.speed) * 0.008,
        runtime.z - Math.cos(yaw) * dist,
      );
      look.set(
        runtime.x + Math.sin(yaw) * 3.2,
        1.1,
        runtime.z + Math.cos(yaw) * 3.2,
      );
      const road = nearest(target.x, target.z);
      if (road.distance > 8.25) {
        target.x = road.p.x + ((target.x - road.p.x) * 8.25) / road.distance;
        target.z = road.p.z + ((target.z - road.p.z) * 8.25) / road.distance;
      }
    }
    const shake =
      settings.effects && !reduced.current
        ? runtime.impact * 0.14 + (runtime.boosting ? 0.027 : 0)
        : 0;
    target.x += Math.sin(t * 67) * shake;
    target.y += Math.cos(t * 83) * shake;
    if (lastRun.current !== g.run) {
      camera.position.copy(target);
      smoothLook.current.copy(look);
      lastRun.current = g.run;
    } else {
      camera.position.lerp(target, 1 - Math.exp(-dt * (menu ? 2.2 : 7)));
      smoothLook.current.lerp(look, 1 - Math.exp(-dt * 8));
    }
    camera.lookAt(smoothLook.current);
    const pc = camera as THREE.PerspectiveCamera;
    const fov = menu ? 48 : 56 + (runtime.boosting && !reduced.current ? 7 : 0);
    pc.fov += (fov - pc.fov) * (1 - Math.exp(-dt * 4));
    pc.updateProjectionMatrix();
    audio.update(
      runtime.speed,
      runtime.boosting,
      runtime.drifting,
      settings.sound,
      settings.music,
      g.phase === "PLAYING",
    );
    if (dust.current) {
      emissionTime.current += dt;
      if (
        g.phase === "PLAYING" &&
        settings.effects &&
        emissionTime.current > 0.055 &&
        ((runtime.drifting && Math.abs(runtime.speed) > 7) || collided)
      ) {
        emissionTime.current = 0;
        const p = particles.current[particleIndex.current++ % 32];
        const side = particleIndex.current % 2 ? 1 : -1;
        Object.assign(p, {
          x: runtime.x - Math.sin(yaw) * 2.5 + Math.cos(yaw) * side,
          y: 0.24,
          z: runtime.z - Math.cos(yaw) * 2.5 - Math.sin(yaw) * side,
          life: 1,
        });
      }
      particles.current.forEach((p, i) => {
        p.life = Math.max(0, p.life - dt * 2.2);
        if (g.phase === "MENU" || lastRun.current !== g.run) p.life = 0;
        p.y += dt * 0.12;
        dummy.current.position.set(p.x, p.y, p.z);
        dummy.current.quaternion.copy(camera.quaternion);
        dummy.current.scale.setScalar(
          p.life > 0 ? Math.sin(p.life * Math.PI) * 0.6 : 0,
        );
        dummy.current.updateMatrix();
        dust.current!.setMatrixAt(i, dummy.current.matrix);
      });
      dust.current.instanceMatrix.needsUpdate = true;
      dust.current.visible = settings.effects;
    }
    sample.current += dt;
    if (sample.current >= 0.075) {
      useTelemetry.setState({
        ...runtime,
        fps: Math.round(1 / Math.max(rawDt, 0.001)),
      });
      sample.current = 0;
    }
  });
  return (
    <>
      <Car ref={car} />
      <instancedMesh
        ref={dust}
        args={[undefined, undefined, 32]}
        frustumCulled={false}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={smokeTexture}
          transparent
          opacity={0.24}
          depthWrite={false}
        />
      </instancedMesh>
    </>
  );
}
export function GameScene() {
  const phase = useGame((s) => s.phase);
  const { theme, quality, effects } = useSettings();
  const night = theme === "dark";
  const [lost, setLost] = useState(false);
  useEffect(() => () => audio.update(0, false, false, false, false, false), []);
  return (
    <>
      <Canvas
        shadows={quality !== "low"}
        dpr={
          quality === "low" ? 1 : quality === "medium" ? [1, 1.25] : [1, 1.75]
        }
        camera={{ position: [-90, 5, 80], fov: 48, near: 0.1, far: 1400 }}
        gl={{
          antialias: quality !== "low",
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            setLost(true);
            useGame.getState().setPhase("PAUSED");
          });
        }}
      >
        <color attach="background" args={[night ? "#142f44" : "#b9d5d1"]} />
        <fog attach="fog" args={[night ? "#142f44" : "#b9d5d1", 140, 650]} />
        <ambientLight intensity={night ? 0.55 : 1.15} />
        <hemisphereLight
          args={[
            night ? "#81b3cf" : "#e7f4f0",
            night ? "#253934" : "#8c9770",
            night ? 0.8 : 1.3,
          ]}
        />
        <directionalLight
          position={[-60, 100, 40]}
          intensity={night ? 0.65 : 2.5}
          color={night ? "#a6cddd" : "#fff0cf"}
          castShadow={quality !== "low"}
          shadow-mapSize={quality === "high" ? 2048 : 1024}
          shadow-camera-left={-190}
          shadow-camera-right={190}
          shadow-camera-top={190}
          shadow-camera-bottom={-190}
          shadow-camera-far={350}
          shadow-bias={-0.001}
        />
        <World />
        <Simulation />
        {quality === "high" && phase === "MENU" && (
          <ContactShadows
            position={[runtime.x, 0.01, runtime.z]}
            opacity={0.3}
            scale={18}
            blur={2.5}
            far={4}
            resolution={128}
            frames={1}
          />
        )}
        {effects && quality === "high" && (
          <EffectComposer multisampling={0}>
            <Bloom luminanceThreshold={1.4} intensity={0.22} mipmapBlur />
          </EffectComposer>
        )}
      </Canvas>
      {lost && (
        <div className="fatal">
          <h2>Graphics connection interrupted</h2>
          <p>Reload to reconnect the 3D renderer.</p>
          <button onClick={() => location.reload()}>Reload game</button>
        </div>
      )}
    </>
  );
}
