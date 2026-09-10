# Build a Complete Low-Poly 3D Browser Car Game

You are an expert frontend engineer, Three.js developer, game developer, UI/UX designer, motion designer, and performance engineer.

I am testing your ability to build a **real, playable browser-based 3D car game**, not a mockup, static landing page, fake dashboard, or visual-only prototype.

Build the project completely and make it actually playable.

The final result should feel like a small polished indie arcade racing game that happens to run inside a browser.

---

# 1. PRIMARY OBJECTIVE

Create a browser-based **low-poly 3D arcade driving game**.

The player controls a low-poly sports car using the keyboard.

The game must have:

- Real 3D environment
- Real-time car movement
- Keyboard controls
- Acceleration
- Braking
- Steering
- Drifting/sliding feel
- Nitro boost
- Nitro meter
- Speedometer
- RPM-style indicator
- Gear indicator
- Lap/distance or score system
- Obstacles
- Collectibles or checkpoints
- Collision detection
- Camera following the car
- Camera shake
- Speed effects
- Engine/audio feedback
- Start/pause/restart flow
- Game-over/completion state
- Light mode
- Dark mode
- Responsive UI
- Smooth animations
- Low-poly visual style

Do NOT create a fake game interface where buttons merely animate.

The car must actually move through a 3D scene.

---

# 2. IMPORTANT DESIGN PRINCIPLE

The website/game must NOT look AI-generated.

Avoid the common AI-generated website style:

- excessive gradients
- giant glowing text
- excessive glassmorphism
- random floating cards
- excessive rounded rectangles
- meaningless neon decorations
- huge empty hero sections
- generic futuristic dashboards
- excessive purple/blue gradients
- unnecessary particle effects everywhere
- excessive shadows
- decorative UI that does not serve gameplay

Instead, make the design feel like a **real game UI designed by a professional game/interface designer**.

Take inspiration from polished arcade racing games, racing dashboards, automotive interfaces and modern game menus.

The interface should be:

- purposeful
- restrained
- tactile
- readable
- slightly industrial
- premium
- responsive
- game-like
- visually coherent

Every visual element should have a reason to exist.

---

# 3. TECHNOLOGY STACK

Use:

- React
- TypeScript
- Vite
- Three.js
- @react-three/fiber
- @react-three/drei
- Zustand
- Anime.js
- @react-three/postprocessing
- Lucide React

Use CSS/Tailwind only where appropriate.

Recommended architecture:

React
↓
Game UI
↓
Zustand game state
↓
React Three Fiber
↓
Three.js

Keep rendering/game-loop logic separate from normal React UI rendering.

Do NOT put the entire game loop into React state.

Use refs and frame updates for high-frequency game values.

---

# 4. GAME WORLD

Create a low-poly racing environment.

The initial playable environment should include:

### Track

Create a road/track with:

- road surface
- lane markings
- curbs
- grass
- simple barriers
- road signs
- trees
- rocks
- low-poly buildings or structures
- street lights
- mountains/hills in the distance

The environment should be visually interesting without requiring huge assets.

Use procedural/simple geometry where practical.

The game must run smoothly in a normal desktop browser.

---

# 5. LOW-POLY ART DIRECTION

The visual style should be:

"Stylized low-poly arcade racing."

Use:

- simple geometric shapes
- flat or lightly shaded materials
- controlled color palette
- subtle ambient lighting
- clean silhouettes
- simplified environmental objects
- moderate shadows
- atmospheric depth

Do not attempt photorealism.

The low-poly style should look intentional rather than like placeholder geometry.

---

# 6. CAR

Create a visually recognizable low-poly sports car.

The car should contain separate logical components:

- body
- wheels
- tires
- windows
- headlights
- taillights
- spoiler
- exhaust
- wheels that visibly rotate
- steering/front-wheel movement

If external GLB/GLTF assets are unavailable, create a good-looking procedural low-poly car using Three.js primitives.

Do not stop because a model asset is unavailable.

The game must still be fully playable.

---

# 7. CAR PHYSICS

Implement arcade-style driving physics.

Do NOT try to create a full realistic racing simulator.

The car needs:

### Acceleration

- gradual acceleration
- maximum speed
- acceleration curve

### Braking

- normal braking
- stronger braking when brake key is held

### Steering

- left/right steering
- steering sensitivity based on speed

### Friction

- normal road friction
- reduced grip while drifting

### Drift

Implement a simple arcade drift system.

The player should be able to intentionally slide around corners.

The car should visually rotate slightly relative to its movement direction.

### Reverse

Allow the player to reverse.

### Speed limits

Have different speed behavior for:

- normal driving
- drifting
- nitro

---

# 8. KEYBOARD CONTROLS

Implement:

W / Arrow Up
→ Accelerate

S / Arrow Down
→ Brake / Reverse

A / Arrow Left
→ Steer left

D / Arrow Right
→ Steer right

Space
→ Nitro

Shift
→ Drift / Handbrake

P / Escape
→ Pause

R
→ Restart

Make controls responsive and avoid browser scrolling when the game is active.

Show the controls somewhere in the interface.

Example:

WASD
DRIVE

SHIFT
DRIFT

SPACE
NITRO

ESC
PAUSE

---

# 9. NITRO SYSTEM

Implement a real nitro system.

The player should have a nitro meter.

Example:

NITRO
████████░░

When Space is held:

- consume nitro
- increase acceleration
- increase maximum velocity
- create exhaust flames
- add subtle screen/camera shake
- add speed-line effect
- slightly modify camera FOV
- animate HUD

When nitro ends:

- return smoothly to normal speed
- restore FOV
- remove boost effects

Do not make the effects excessive.

The nitro should feel powerful but polished.

---

# 10. CAMERA

Use a third-person chase camera.

The camera should:

- follow the car smoothly
- have slight lag
- respond to acceleration
- move slightly during drifting
- increase FOV during nitro
- shake subtly during collisions
- shake subtly during nitro
- avoid clipping through the environment

The camera must feel like a real racing game camera rather than a fixed Three.js camera.

---

# 11. HUD

Create a professional racing HUD.

Suggested layout:

TOP LEFT
Race information

TOP RIGHT
Timer / score

BOTTOM LEFT
Speedometer

BOTTOM CENTER
Nitro meter

BOTTOM RIGHT
Controls / gear / RPM

Example speed display:

147
KM/H

Gear:

GEAR
4

Nitro:

NITRO
██████████

Do not make every UI element a floating glass card.

Use typography, spacing, lines and subtle containers instead.

---

# 12. SPEEDOMETER

Create a visually convincing speedometer.

It should update in real time.

Include:

- current speed
- max speed indicator
- optional RPM
- gear

The speedometer should animate smoothly rather than jumping every frame.

---

# 13. GAME STATES

Create a proper state machine.

At minimum:

MENU
COUNTDOWN
PLAYING
PAUSED
FINISHED
GAME_OVER

Menu:

PLAY
HOW TO PLAY
SETTINGS

During countdown:

3
2
1
GO

Pause:

RESUME
RESTART
MAIN MENU

Finish:

RACE COMPLETE
TIME
TOP SPEED
DISTANCE
NITRO USED

Buttons should actually work.

---

# 14. START MENU

The initial screen should feel like a game.

Use the actual 3D environment behind the menu.

The car can slowly idle in the background.

Example:

--------------------------------

          [GAME LOGO]

       LOW POLY // DRIVE

       PLAY
       HOW TO PLAY
       SETTINGS

     W A S D  TO DRIVE

--------------------------------

Avoid generic landing-page layouts.

This is a game, not a SaaS website.

---

# 15. LIGHT / DARK MODE

Implement a real light/dark mode.

Important:

Light mode should NOT simply be:

background: white

Dark mode should NOT simply be:

background: black

Instead, adjust the complete visual system.

Light mode:

- warm/light environment
- brighter UI
- readable dark typography
- softer shadows
- slightly brighter world

Dark mode:

- deeper environment
- darker UI
- brighter instrumentation
- stronger contrast
- controlled highlights

The setting must persist using localStorage.

---

# 16. ANIMATION SYSTEM

Use Anime.js for UI/motion animation where appropriate.

Anime.js should handle things such as:

- menu entrance
- button hover
- countdown
- HUD transitions
- speed number transitions
- nitro meter animation
- pause menu
- game-over animation
- settings transitions
- theme transitions

Use Three.js/R3F animation for:

- car movement
- wheel rotation
- camera movement
- environmental motion
- particles
- vehicle animation

Do NOT use Anime.js for every single 3D object.

Use the right tool for the right job.

Anime.js supports animation timelines, easing, callbacks and playback controls, so use those capabilities intentionally rather than simply adding random CSS transitions.

---

# 17. VISUAL EFFECTS

Add restrained effects:

- subtle motion blur impression
- speed lines
- tire smoke
- dust
- exhaust
- nitro flame
- subtle bloom
- camera shake
- environmental fog
- headlights
- brake lights

Effects should support gameplay.

Do not turn the entire screen into glowing particles.

---

# 18. COLLISION SYSTEM

Implement basic collision detection.

Objects can include:

- barriers
- trees
- rocks
- checkpoints

On collision:

- slow the car
- apply small camera shake
- show subtle impact feedback
- optionally create particles

Do not allow the car to completely break the game state.

---

# 19. TRACK / GAMEPLAY LOOP

Create an actual playable loop.

For example:

1. Start menu
2. Player clicks PLAY
3. Countdown
4. Car starts
5. Player drives
6. Player collects checkpoints
7. Player avoids obstacles
8. Player uses nitro
9. Timer continues
10. Finish condition reached
11. Results screen appears
12. Player can restart

The game should be playable without needing a backend.

---

# 20. PERFORMANCE

This is extremely important.

Optimize for browser performance.

Use:

- low-poly geometry
- instancing where appropriate
- limited dynamic lights
- efficient materials
- texture reuse
- object pooling where useful
- controlled shadow resolution
- limited postprocessing
- no unnecessary React rerenders
- refs for per-frame values
- Zustand only for meaningful game state

Do not update React state 60 times per second for values such as:

- car position
- velocity
- wheel rotation
- camera position

Those should primarily live in the Three.js/R3F runtime.

---

# 21. RESPONSIVE DESIGN

Desktop keyboard gameplay is the primary target.

Still make the UI responsive.

For smaller screens:

- adapt HUD
- resize menus
- prevent UI overlap
- display a message explaining that keyboard controls are recommended

Do NOT attempt to create an entire mobile driving control system unless it can be done cleanly.

Desktop quality is more important.

---

# 22. AUDIO

If practical, implement lightweight audio.

Sounds:

- engine idle
- engine acceleration
- braking
- tire skid
- collision
- nitro
- UI click
- countdown
- finish

If audio assets are unavailable, structure the code so they can easily be added later.

Do not block the project because audio files are missing.

---

# 23. ASSET STRATEGY

Prefer:

1. procedural low-poly geometry
2. local GLB/GLTF assets
3. simple generated textures

Do not make the project dependent on random external URLs.

If you use external assets, clearly isolate them in an asset configuration file.

For production, assets should eventually be self-hosted.

---

# 24. OPTIONAL ASSET CREATION TOOLS

You may use tools such as:

- Blender for low-poly models
- Higgsfield for generating cinematic visual references or promotional animation
- image-generation tools for textures/concept art

Higgsfield is useful for visual/video generation and motion design, but it should NOT be part of the core real-time game runtime. Its current tooling focuses on AI video, motion design, camera presets and generated visual content.

Do not create a dependency on Higgsfield just to make the game work.

---

# 25. OPTIONAL LIBRARIES

Consider:

@react-three/drei
@react-three/postprocessing
zustand
animejs
lucide-react
howler
@react-three/rapier

However:

DO NOT install libraries just because they exist.

Every dependency must have a clear purpose.

For example, use Rapier only if the game actually benefits from physics simulation.

For a simple arcade car, custom movement may be preferable.

---

# 26. UI DESIGN LANGUAGE

Use a professional racing-inspired visual system.

Typography:

- strong condensed/display font for numbers
- clean sans-serif for controls
- large readable speed numbers
- restrained labels

Shapes:

- angular or slightly rounded
- thin borders
- small corner cuts where appropriate
- subtle separators

Avoid:

- excessive pill buttons
- excessive cards
- excessive glass
- generic dashboard layouts

The UI should feel like an instrument panel.

---

# 27. COLOR SYSTEM

Create a small design token system.

Use:

- primary accent
- secondary accent
- background
- surface
- text
- muted text
- danger
- success
- nitro

Do not use many unrelated colors.

The car and environment should share a coherent palette.

---

# 28. GAME FEEL

This is one of the most important requirements.

The game should feel responsive.

When the player presses W:

The car should respond immediately.

When steering:

The car should turn naturally.

When drifting:

The rear should feel loose.

When using nitro:

The player should clearly feel acceleration.

When colliding:

There should be immediate feedback.

When finishing:

There should be a satisfying result transition.

Prioritize game feel over technical complexity.

---

# 29. CODE ARCHITECTURE

Use a clean architecture such as:

src/
  components/
    ui/
    game/
    hud/

  game/
    systems/
      vehicleSystem.ts
      collisionSystem.ts
      nitroSystem.ts
      raceSystem.ts
      cameraSystem.ts

  scene/
    Track.tsx
    Environment.tsx
    Car.tsx
    Obstacles.tsx
    Effects.tsx

  store/
    gameStore.ts
    settingsStore.ts

  hooks/
    useKeyboard.ts
    useGameLoop.ts

  utils/
    math.ts
    collision.ts

  assets/

  styles/

  App.tsx
  main.tsx

Keep components modular.

Do not create one massive App.tsx file.

---

# 30. STATE MANAGEMENT

Use Zustand for:

- game state
- settings
- pause state
- score
- race progress
- nitro availability
- theme
- selected car

Do not use Zustand as a replacement for the Three.js render loop.

Separate:

GAME STATE

from

FRAME STATE.

---

# 31. ACCESSIBILITY

Even though this is a game:

- buttons should be keyboard accessible
- menus should have focus states
- text should have sufficient contrast
- controls should be understandable
- reduced-motion preference should be respected where practical

---

# 32. SETTINGS

Create a functional settings panel.

Include:

- Light / Dark
- Sound On / Off
- Music On / Off
- Effects On / Off
- Quality: Low / Medium / High
- Reset settings

Persist settings.

Quality should actually affect rendering where possible.

---

# 33. DEBUG MODE

Create an optional developer/debug mode.

It can display:

- FPS
- speed
- position
- velocity
- game state
- nitro
- collisions

It should be disabled by default.

Use a keyboard shortcut such as:

F3

to toggle debug mode.

---

# 34. FALLBACKS

This requirement is critical.

If a fancy feature cannot be implemented reliably:

DO NOT fake it.

Instead:

1. implement a simpler working version
2. keep the architecture extensible
3. document the limitation

A working simple game is better than a visually impressive fake.

---

# 35. ERROR HANDLING

Handle:

- WebGL unavailable
- missing assets
- audio restrictions
- failed model loading
- unsupported browser features

If WebGL 2 is unavailable, show a clear fallback message instead of a blank screen. Three.js provides WebGL capability detection that can be used for this.

---

# 36. NO BACKEND

This first version should be frontend-only.

Do NOT create:

- authentication
- database
- server
- API
- leaderboard backend

unless absolutely necessary.

Use localStorage for:

- settings
- best score
- best time
- preferences

The objective is to create a self-contained browser game.

---

# 37. FINAL QUALITY BAR

Before considering the task complete, verify:

[ ] The project installs successfully.

[ ] The development server starts.

[ ] The game renders.

[ ] The car is visible.

[ ] WASD works.

[ ] Arrow keys work.

[ ] Braking works.

[ ] Reverse works.

[ ] Steering works.

[ ] Drift works.

[ ] Nitro works.

[ ] Nitro meter works.

[ ] Speedometer works.

[ ] Camera follows the car.

[ ] Wheels rotate.

[ ] Collision works.

[ ] Track works.

[ ] Obstacles work.

[ ] Countdown works.

[ ] Pause works.

[ ] Restart works.

[ ] Finish state works.

[ ] Light mode works.

[ ] Dark mode works.

[ ] Settings persist.

[ ] UI animations work.

[ ] No major console errors.

[ ] No obvious React performance problems.

[ ] No broken imports.

[ ] No missing critical assets.

[ ] No fake buttons.

[ ] No fake gameplay.

---

# 38. DEVELOPMENT PROCESS

Do not attempt to generate everything blindly in one giant file.

Build in phases.

## Phase 1 — Project foundation

Create:

- Vite
- React
- TypeScript
- dependencies
- folder structure
- basic UI

Verify the app runs.

## Phase 2 — 3D scene

Create:

- Canvas
- camera
- lighting
- ground
- track
- environment

Verify rendering.

## Phase 3 — Car

Create:

- low-poly car
- wheels
- movement
- steering
- acceleration
- braking

Verify controls.

## Phase 4 — Game systems

Add:

- collision
- drifting
- checkpoints
- race timer
- finish state

## Phase 5 — Nitro

Add:

- nitro meter
- boost
- effects
- camera FOV
- exhaust

## Phase 6 — HUD

Add:

- speedometer
- gear
- RPM
- nitro
- timer
- race progress

## Phase 7 — Menus

Add:

- start
- pause
- settings
- finish
- restart

## Phase 8 — Animation

Add Anime.js animations and game-feel effects.

## Phase 9 — Audio

Add sound architecture and available audio.

## Phase 10 — Optimization

Profile and optimize.

## Phase 11 — Final polish

Fix:

- spacing
- typography
- transitions
- responsiveness
- loading
- errors
- controls
- visual consistency

---

# 39. IMPORTANT IMPLEMENTATION RULE

Do not stop after creating the architecture.

Continue until there is a playable game.

If you encounter an unavailable dependency, asset, API, or tool:

DO NOT stop.

Implement a local/procedural fallback.

If a feature cannot be perfectly implemented:

implement the best working approximation and continue.

---

# 40. WHAT I EXPECT FROM YOU

I expect you to behave like a senior game/frontend engineer.

Think about:

- architecture
- performance
- game feel
- visual hierarchy
- interaction
- maintainability
- browser limitations
- responsive behavior
- loading
- asset management

Do not merely produce code that technically compiles.

The final result should feel like a deliberately designed browser game.

---

# 41. FINAL OUTPUT

When implementation is complete, provide:

1. Project structure
2. Complete implementation
3. Installation commands
4. Development command
5. Production build command
6. Controls
7. Architecture explanation
8. Libraries used and why
9. Known limitations
10. Future upgrade suggestions

Most importantly:

MAKE THE GAME ACTUALLY PLAYABLE.

Do not return only a plan.

Do not return only UI.

Do not create a static mockup.

Build the working game.