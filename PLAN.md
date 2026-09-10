# DRIVE implementation plan

## Reference review

Read the complete supplied build prompt and visually inspected all three PNGs. Preserve the red wedge-shaped sports car, dark glass, black spoiler, sculpted body, bright rear lamps, coastal water, faceted mountains, pines, pale village walls and terracotta roofs. Use an actual 3D scene behind an editorial racing menu and compact instruments during driving. Interpret the pictures procedurally; they are art references, not runtime backgrounds.

## Phases and acceptance gates

1. Foundation: React, TypeScript, Vite, modular systems and persisted Zustand settings. Install and compile.
2. World: closed coastal circuit, road markings, curbs, guardrails, mountains, trees, village, lighthouse, bridge and tunnel. Inspect actual browser rendering.
3. Vehicle: separate faceted body, windows, wheels, lamps, spoiler and exhaust; acceleration, reverse, speed-sensitive steering and chase camera.
4. Race systems: ordered checkpoints over two laps, timer, distance, best time, collisions and a time-limit game-over state. Test deterministic physics and race progression.
5. Boost and feel: rechargeable nitro, handbrake slip, rotating wheels, exhaust, pooled dust, FOV and restrained camera shake.
6. Instruments: speed, gear, RPM, nitro, progress, minimap, time and checkpoint notifications; sample telemetry rather than updating React each frame.
7. Flow: live-world menu, how to play, countdown, pause, restart, completion and settings. Functional keyboard and focus states.
8. Polish: Anime.js transitions, day/night world palette, quality/effects controls and responsive layouts with reduced-motion support.
9. Audio: gesture-initialized procedural engine, skids, boost and event sounds, independent music and sound controls.
10. Verification: production build, automated core-system checks, actual browser inspection and controls where tools permit. Record limitations honestly.

## Architecture

Custom planar arcade physics in a frame runtime, a sampled telemetry store for the HUD, and separate scene, system, input, audio and UI modules. Three.js geometry is generated locally. No backend or external runtime assets. Two laps through eight ordered gates form a complete race; six minutes is the time limit.

## Completion

All ten implementation phases are complete for this first playable version. Production compilation, eight automated system tests, and browser keyboard/layout/persistence checks pass. See `VERIFICATION.md` for evidence and `README.md` for deliberately simplified features and future work.
