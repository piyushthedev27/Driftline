# DRIFT LINE — World Tour expansion

## Feature list

### Three distinct maps
- Alpine Coast: retain the existing coast circuit, lighthouse, village and mountain views.
- Redrock Canyon: a longer desert circuit with sweeping bends, sandstone mesas, cacti and roadside service buildings.
- Frostpine Valley: a technical mountain loop with snow-covered ground, dense evergreens and timber lodges. Road grip stays predictable; this is an arcade circuit, not an ice simulator.
All maps have independent spline layouts, eight ordered checkpoints, road-edge collision, obstacles, minimaps, two-lap finishes and six-minute limits.

### Three vehicles
- Vortex GT: existing reference-inspired sports car; balanced performance.
- Scout RS: compact rally hatchback, roof scoop, rally lamps, short wheelbase and quicker turn-in.
- Monarch V8: classic muscle coupe, long bonnet, wider grille, twin stripes and strong boost with slower turn-in.
Each has its own geometry, acceleration, speed caps, steering and grip. Collision envelopes cover the selected vehicle's full footprint. Paint remains selectable.

### Four world/interface themes
- Daylight: pale sky, clear sunlight, lime accents.
- Golden Hour: warm sky, low amber sun, warm instrument accents.
- Midnight: deep blue sky, moonlight, headlights and cyan accents.
- Overcast: cool fog, diffused light, muted surfaces and ice-blue accents.
Themes alter actual lighting, fog and UI tokens. They do not secretly alter physics or records.

### Race setup interface
A compact header and live 3D backdrop; three setup tabs (Destination / Garage / Atmosphere); accessible option cards with track outlines, handling specs and theme swatches; a persistent selected-setup summary and race button. Clear return to settings/help. Responsive stacked layout on narrow screens. No purchases, locked content or fake controls.

## Phases
1. Review current code and preserve existing branding, credits, controls and collision fixes.
2. Add typed content catalogs, reusable track data, saved selection migration, and per-map/per-vehicle records.
3. Build the two additional environments and two additional vehicle models; connect handling and geometry.
4. Build race setup UI, theme controls, live preview and context-aware HUD/results.
5. Verify each map/vehicle pairing can complete a race; test boundary collision, records, reload persistence and selection safety.
6. Run production compilation, browser interaction checks and screenshot review at desktop and mobile widths. Document exact results and remaining limits.

## Acceptance
Selection changes the real scene and physics. Switching destination resets preview position. Map/vehicle changes are available only outside a race. Restart preserves the setup. Every combination uses correct route length, name, speed cap and best time. Saved invalid IDs fall back safely. Original saved preferences migrate without losing the previous Alpine GT record. Rendering remains procedural and frontend-only.

## Completion
All six implementation phases are complete. The production build, 21 gameplay checks and desktop/mobile browser interaction checks passed. See `docs/VERIFICATION.md` for results and `artifacts/expansion-*.png` for captures.
