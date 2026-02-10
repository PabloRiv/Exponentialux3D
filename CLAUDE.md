# Project Instructions

## Stack
- Next.js 16 (App Router, Turbopack)
- Three.js v0.182 (WebGLRenderer)
- GSAP 3.14 (ScrollTrigger)
- Tailwind CSS 4
- TypeScript 5

## Three.js Notes
- `renderer.localClippingEnabled = true` is required for per-material `clippingPlanes` to work (defaults to `false` in v0.182).
- Attach clipping planes to materials during model traversal (before first render) so shaders compile with clipping support.
- Use large finite values (e.g. `99999`) instead of `Infinity` for plane constants — `Infinity` produces `NaN` via `Plane.applyMatrix4`.

## Architecture
- `src/components/Scene.tsx` — Three.js renderer, model loading, animations, clipping. Exposes `SceneHandle` ref with imperative methods.
- `src/components/HeroOverlay.tsx` — HTML/CSS overlay with GSAP animations, buttons, cutaway controls.
- `src/app/page.tsx` — Wires overlay callbacks to Scene ref methods.
