# DRIVE

A self-contained, playable low-poly arcade racer built from the supplied Markdown brief and all three visual references. Race two laps through eight ordered checkpoint gates around Alpine Coast. Finish within six minutes; your best time stays on this device.

## Run locally

Requires Node.js 22.12+ or a current compatible LTS release.

```sh
npm install
npm run dev
```

Open the local address printed by Vite, normally http://localhost:5173.

```sh
npm run build
npm run preview
npm test
```

The production build is in `dist/`. Host that directory with any static website host. There is no backend, account, API, downloaded model or external runtime asset. The original PNG references are retained for design review but are not bundled into the game.

## Controls

| Key                 | Action                     |
| ------------------- | -------------------------- |
| W / Up              | Accelerate                 |
| S / Down            | Brake, then reverse        |
| A / Left, D / Right | Steer                      |
| Shift               | Drift / handbrake          |
| Space               | Nitro while accelerating   |
| P / Escape          | Pause / resume             |
| R                   | Restart with a countdown   |
| F3                  | Toggle runtime diagnostics |

Brake before a bend, steer into it, then accelerate out. Shift reduces grip for a slide. Nitro recharges automatically; passing a checkpoint restores an additional 12%. Roadside cones and guardrails slow the car on impact. Gates must be collected in order. Losing window focus automatically pauses a race.

## Project structure

```text
src/
  App.tsx                 WebGL capability check and application shell
  main.tsx                React entry
  store.ts                Race state, frame runtime, sampled HUD, saved settings
  styles.css              Responsive menu and racing instrument design
  game/
    track.ts              Closed spline, road lookup, minimap and obstacle data
    vehicle.ts            Fixed-step arcade physics, collision, nitro, race logic
    input.ts              Keyboard handling, held keys and focus loss
    audio.ts              Gesture-initialized procedural audio
  scene/
    GameScene.tsx         R3F frame loop, camera, lighting, dust and quality
    World.tsx             Road, vegetation, mountains, village and landmarks
    Car.tsx               Modular procedural sports car and animated wheels
  ui/
    Menus.tsx             Menu, help, settings, pause, countdown and results
    Hud.tsx               Speed, gear, RPM, nitro, timer, minimap and diagnostics
public/favicon.svg
tests/                    Physics and browser verification
artifacts/                Actual browser screenshots
PLAN.md                   Phased implementation plan and reference interpretation
VERIFICATION.md           Test evidence and implementation limits
```

## Architecture and dependencies

React and TypeScript own the interface. Vite serves and builds the frontend. Three.js and React Three Fiber render the live 3D world. Drei supplies a small contact-shadow treatment. React Three Postprocessing supplies restrained bloom at high quality. Zustand handles race phases, persisted settings and sampled telemetry. Anime.js animates menu entries and the countdown. Lucide supplies interface icons. Web Audio synthesizes sound locally. Prettier formats the source; tsx runs deterministic system tests.

The physics runtime uses mutable values and a fixed 1/120-second step, with elapsed-frame clamping after stalls. Car transforms, wheel rotation, particles and the chase camera stay in the R3F frame loop. The HUD samples telemetry roughly thirteen times per second instead of rendering React on every frame. Repeated trees, road markings, curbs, rails and rocks use instancing; smoke uses a fixed pool. Quality changes pixel density, shadows, vegetation density and postprocessing.

Race phases are `MENU`, `COUNTDOWN`, `PLAYING`, `PAUSED`, `FINISHED` and `GAME_OVER`. Settings include day/night, sound, ambient music, effects, quality and car paint. Resetting settings preserves the best time. Reduced-motion preference disables UI entrance motion, boost camera shake and speed lines where practical.

## Known limitations

- A deliberately simplified procedural interpretation of the reference art, not a reproduction of its detailed car model or scenery.
- One mostly level circuit. The bridge and tunnel are simplified structures; there is no elevated road network, suspension simulation, jumping, AI traffic or opponents.
- Custom planar arcade handling with circular obstacle/road-edge collision. Trees and buildings sit beyond the protected driving boundary rather than using individual physics colliders.
- Audio is synthesized: engine, boost/skid tone changes, event beeps and an optional ambient chord. It is not recorded automotive sound or a composed soundtrack.
- Desktop keyboard driving is the target. Small screens get a responsive interface and keyboard guidance, without touch driving controls.
- The Three.js renderer makes the initial JavaScript bundle approximately 347 KB gzipped. Vite reports its large-chunk advisory; the build succeeds.
- Tests establish behavior and rendering, not guaranteed frame rates across all GPUs. Low/medium quality are available for slower devices.

## Future upgrades

Replace the modular car with an authored local GLB, add a sculpted elevation-aware circuit, richer rock/shore meshes, recorded audio, ghost replays, more routes, and optional touch/gamepad input. Preserve the current runtime/UI separation when expanding these systems.
