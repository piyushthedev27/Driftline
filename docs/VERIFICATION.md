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

## Expansion verification — 2026-10-08

- Production build: passed (existing large-bundle advisory remains).
- Automated gameplay: 21 tests passed, including full two-lap runs for all nine map/vehicle pairs, collision clearance, saved-record isolation, legacy-save migration and race selection locking.
- Browser interaction: all three destinations, all three vehicles and all four themes selected successfully; saved selection survived reload; race start and pause worked; no JavaScript page errors.
- Responsive captures: 1440×900, 1366×768 and 390×844; all three mobile setup tabs have no horizontal overflow. Four atmosphere options also verified in settings.
- Screenshot review prompted improved preview text contrast and removal of the settings footer that crowded the reset control. Existing touch controls and developer credits are retained.
- Images are in `artifacts/expansion-*.png`; reproducible browser check: `node tests/browser-expansion.cjs` (uses this machine's bundled Playwright and Chrome paths).
- Vehicles and scenery are procedural low-poly geometry; weather is visual and roads remain mostly flat. No backend or online leaderboard is included.

## Visual repair — 2026-10-09

Corrected the scaled rally body so wheel openings retain circular clearance; corrected shell face directions and removed noisy per-triangle color variation. Attached the rally spoiler with supports and repositioned rear lights; removed floating window trim. Road rail/curb segment lengths now follow each circuit length. Raised menu contact shadows above the road and refreshed them when changing car/map. Moved the first roadside sign away from the preview and constrained sign lettering.

Short screens scroll setup controls and the start button together. Preview cards are smaller. Renderer failures replace the interface instead of leaving interactive menus over an error, and graphics-loss messages appear above all overlays. The WebGL capability probe releases its temporary context.

Validation: production compilation passed; all 24 gameplay/geometry tests passed; expansion browser checks passed without page errors; 360×640 and 844×390 layout checks passed. Rally front/side and garage screenshots inspected. The user's unspecified error was not reproduced; no claim is made about a particular error message without its text.

## Reference-led model revision — 2026-10-09

Reopened the supplied sports-car reference and compared controlled front/side/rear renders. Replaced the hood's dense wheel-arch-derived strips with independent broad panel topology. Fender shoulders now use a deliberate profile instead of following every circular arch sample. Retained full circular wheel clearance. Fitted GT headlight housings and hood vents to the painted surface, moved front intakes outside the bumper to remove intersections, and lowered the spoiler and its brackets together.

The showcase accepts `?car=gt|rally|muscle&view=front|side|rear`. `node tests/browser-models.cjs` renders all nine views; outputs are `artifacts/model-*.png`. Models remain original procedural interpretations, not exact replicas of the supplied reference.
