# ExponentialUX 3D

Interactive 3D landing page built with Next.js, Three.js, and GSAP. Features a GLB model viewer with scroll-driven animations, actuator cycle playback, and a cutaway clipping plane for slicing through the model along any axis.

## Features

- **3D Model Viewer** — Loads and renders GLB models with PBR lighting
- **Scroll Animations** — Camera orbits and model transforms driven by scroll position
- **Actuator Cycle** — Plays embedded GLTF animations on demand
- **Cutaway Mode** — Movable clipping plane to slice the model along X, Y, or Z axes
- **Particle Field** — Animated background particles with parallax
- **Responsive** — Adapts to any viewport with proper resize handling

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- [Next.js](https://nextjs.org/) 16 (App Router, Turbopack)
- [Three.js](https://threejs.org/) 0.182
- [GSAP](https://gsap.com/) 3.14 (ScrollTrigger)
- [Tailwind CSS](https://tailwindcss.com/) 4
- TypeScript 5

## Project Structure

```
src/
├── app/
│   └── page.tsx          # Page component, wires overlay to scene
├── components/
│   ├── Scene.tsx         # Three.js renderer, model, clipping plane
│   └── HeroOverlay.tsx   # HTML overlay, buttons, GSAP animations
public/
└── model.glb             # 3D model asset
```

## Deploy

```bash
npm run build
npm start
```

Or deploy to [Vercel](https://vercel.com) for zero-config hosting.
