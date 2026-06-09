# Globe Background Enrichment — Design Spec

**Date**: 2026-06-10
**Status**: Approved
**Style**: Dreamy/Romantic · Serene · Warm + Cool palette

---

## Goal

Enrich the 3D globe's background from a minimal single-layer 300-star field into a dreamy, layered space environment with gentle depth and warm tonality — without feeling busy or distracting.

---

## Architecture

Three new/modified components live inside `components/globe/`:

| File | Change | Purpose |
|---|---|---|
| `Starfield.tsx` | Refactor | Accept `layer` config; three stacked instances for parallax depth |
| `NebulaGlow.tsx` | **New** | 2–3 large semi-transparent sprites with warm-purple/blue radial gradient |
| `AuroraRing.tsx` | **New** | Thin ring near the equatorial plane, warm gradient, slow self-rotation |
| `ParticleGlobe.tsx` | Tiny tweak | Add `<NebulaGlow />` and `<AuroraRing />` alongside the three `<Starfield />`s |

All use existing `@react-three/fiber` + `three.js` primitives. No new dependencies.

---

## Component Specs

### Starfield (refactored)

Exported as a function accepting `config`:

```ts
type StarLayerConfig = {
  count: number
  radiusMin: number
  radiusMax: number
  size: number
  opacity: number
  colors: Array<{ r: number; g: number; b: number; weight: number }>
  rotateSpeed: { x: number; y: number }
}
```

Three instances with roughly these values:

| Layer | Count | Radius | Color palette | Size | Opacity | Speed (y/x) |
|---|---|---|---|---|---|---|
| Far | 200 | 8–12 | Cool blue-white | 0.012 | 0.5 | 0.003 / 0.001 |
| Mid | 250 | 6–9 | White + warm gold mix | 0.016 | 0.65 | 0.006 / 0.002 |
| Near | 150 | 4.5–7 | Warm gold/amber | 0.022 | 0.8 | 0.004 / 0.0015 |

Each layer gets its own `Points` mesh with vertex colors, `AdditiveBlending`, `depthWrite=false`.

Rotation: `useFrame` applies per-layer rotation. Near layer rotates slowest (creates subtle parallax against mid/far).

### NebulaGlow

- 2–3 sprites (`THREE.Sprite`) placed behind and to the sides of the globe
- Texture: canvas-generated radial gradient (warm purple `#6a3a7a` → transparent, warm blue `#2a4a7a` → transparent)
- Large scale (~3–5 units), very low opacity (0.03–0.06)
- Slow independent float via `useFrame` (sinusoidal position drift ±0.3 units, period ~20s)
- `depthWrite=false`, `AdditiveBlending`

### AuroraRing

- `THREE.RingGeometry(innerRadius, outerRadius, 64)` — thin ring
- Rotated ~15° from the equatorial plane
- Custom `ShaderMaterial` with warm gold-to-transparent gradient along the ring's radial direction
- Opacity 0.04–0.08, `AdditiveBlending`, `depthWrite=false`
- Slow self-rotation around its axis (~0.003 rad/s)
- Ring sits at radius ~2.2, well outside the globe sphere (r=1.5)

### ParticleGlobe (change)

Inside `<Canvas>`, before the `<GlobeDataLoader>`:
```tsx
<Starfield config={FAR_LAYER} />
<Starfield config={MID_LAYER} />
<Starfield config={NEAR_LAYER} />
<NebulaGlow />
<AuroraRing />
```

---

## Visual Summary

- **Depth**: Three star layers at different distances + rotation speeds → parallax
- **Color journey**: Cool blue (far) → white+warm (mid) → warm gold (near)
- **Ambient glow**: Large soft nebula patches in purple/blue, barely visible
- **Subtle structure**: A faint golden ring tilted off the equator
- **Motion**: Everything moves slowly, no flickering or pulsing — serene

---

## Performance

- ~600 total star vertices → negligible GPU load
- 2–3 sprite textures (small canvas-generated PNGs) → negligible
- 1 ring geometry → trivial
- All use `AdditiveBlending` with `depthWrite=false` — no overdraw issues
- Target: 60fps on mid-range mobile

---

## Non-Goals

- No meteor/shooting-star effects (too dynamic for the chosen style)
- No programmatic nebula shaders (shader complexity not warranted)
- No background image/texture assets (all procedural)
- No changes to globe particles, country highlights, or glow layers
