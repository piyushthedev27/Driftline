# Verification record

## Requirements and references

Read the entire supplied build prompt before implementation. Inspected `Low-Poly Sports Car Showcase.png`, `Low-Poly Mountain Coast Racing Environment.png`, and `Drive Low-Poly Racing Moodboard.png` at their original resolution. Wrote `PLAN.md` before building.

## Completed checks

- Dependency installation succeeded, with zero vulnerabilities reported by npm at installation time.
- TypeScript and the Vite production build succeeded. The only build advisory is the size of the bundled Three.js application.
- Local development server started at port 5173.
- Eight deterministic automated tests passed: immediate acceleration/braking/reverse, nitro consumption/regeneration, drift slip, barrier recovery/cooldown, obstacle collision, ordered checkpoint/two-lap completion, deterministic bounded integration, and a continuous steering-controller drive around the complete circuit within the six-minute limit.
- Headless Chrome rendered the actual WebGL scene and visible car. Screenshots were inspected at desktop and narrow mobile sizes.
- Browser tests used actual key presses to verify acceleration with Arrow Up and W, boost with Space, drift and steering with Shift/Arrow Right, reverse with S, pause with Escape, resume and R restart.
- Pause stopped the visible race timer. Restart reset the race and ran another countdown.
- Night theme and low quality persisted after reloading.
- No horizontal overflow at 390 × 844. Menu, settings, driving and night layouts captured in `artifacts/`.
- Final browser gameplay test reported no page errors or failed network requests.

The initial browser test had missing favicon requests, now fixed with a local SVG. A development-state test initially imported a duplicate hot-reload module; the final gameplay assertions read the visible HUD instead. Neither is a remaining gameplay defect.

## Tooling notes

The Windows sandbox blocked npm registry access and bundler/test-runner OS access. Those operations succeeded with approved execution outside the sandbox. The app browser-control tool failed to initialize, so browser verification used bundled Playwright with locally installed Chrome.

`npm test` is portable. The supplementary browser scripts use the local bundled Playwright/Chrome paths in this environment; adapt their imports and launch executable if rerunning elsewhere. They expect the Vite server at port 5173.

## Limits of verification

No human driving review or audio listening assessment is claimed. No real-device mobile driving, Safari/Firefox matrix, or GPU performance benchmark has been performed. Read the README for deliberately simplified features and suggested upgrades.

## Result-screen integration

Browser fixtures verified time-limit game over, restart, ordered-gate completion, the result screen, saving best time, main-menu return, and the help screen. These fixtures reposition the vehicle to gates; the separate full-circuit system test verifies continuous driving. No page errors occurred.

## Car and clipping correction — 11 September 2026

- Rebuilt the car with a lower cabin, open wheel arches, contoured fenders, inset glazing, angular LED housings, C-shaped rear lamps, multi-spoke wheels, brake discs, side intakes and a slimmer wing. The model is an original procedural interpretation of the supplied reference, not an imported replica.
- Collision now protects the full vehicle footprint, projects against continuous track segments, and rejects outward velocity during the feedback cooldown. It covers front/rear corners, side contact, reverse and prolonged acceleration into a rail.
- Reframed the chase camera and constrained its desired position to the driving corridor. Replaced large polygonal impact clouds with small, brief smoke sprites emitted at the rear of the car.
- Added local procedural environment reflections without downloadable assets.
- All ten system/regression tests pass, including full two-lap driving, both-rail angled impacts and sustained pressure against a rail.
- Production build passes. The focused Chrome check reproduced contact at 1148 × 960, verified the footprint remains inside the rail, and rendered front/rear/side inspection views with no page errors.
- Inspection captures: artifacts/car-front.png, artifacts/car-rear.png, artifacts/car-side.png, artifacts/rail-contact-fixed.png. The optional development-only inspection page is tests/car-showcase.html.
