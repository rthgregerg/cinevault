# Globe Background Enrichment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace single-layer 300-star Starfield with 3-layer parallax stars + nebula sprites + aurora ring, slow globe rotation 10%, brighten glow particles.

**Architecture:** Refactor `Starfield.tsx` to accept a config object; create `NebulaGlow.tsx` (canvas-generated sprite textures) and `AuroraRing.tsx` (RingGeometry + shader); wire all into `ParticleGlobe.tsx`. All use existing R3F + three.js, no new deps.

**Tech Stack:** React Three Fiber, three.js, TypeScript

**Spec:** `docs/superpowers/specs/2026-06-10-globe-background-enrichment-design.md`

---

### Task 1: Refactor Starfield.tsx to accept layer config

**Files:**
- Modify: `components/globe/Starfield.tsx`

- [ ] **Step 1: Replace Starfield.tsx with config-driven multi-color layer**

Current file is 66 lines. Replace entirely with:

```tsx
"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface StarLayerConfig {
  count: number;
  radiusMin: number;
  radiusMax: number;
  size: number;
  opacity: number;
  colors: Array<{ r: number; g: number; b: number; weight: number }>;
  rotateSpeedX: number;
  rotateSpeedY: number;
}

function pickColor(colors: StarLayerConfig["colors"]): { r: number; g: number; b: number } {
  const totalWeight = colors.reduce((s, c) => s + c.weight, 0);
  let r = Math.random() * totalWeight;
  for (const c of colors) {
    r -= c.weight;
    if (r <= 0) return c;
  }
  return colors[colors.length - 1];
}

export default function Starfield({ config }: { config: StarLayerConfig }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { pos, colors: colorArr } = useMemo(() => {
    const p = new Float32Array(config.count * 3);
    const c = new Float32Array(config.count * 3);

    for (let i = 0; i < config.count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = config.radiusMin + Math.random() * (config.radiusMax - config.radiusMin);

      p[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      p[i * 3 + 2] = r * Math.cos(phi);

      const color = pickColor(config.colors);
      c[i * 3] = color.r;
      c[i * 3 + 1] = color.g;
      c[i * 3 + 2] = color.b;
    }
    return { pos: p, colors: c };
  }, [config]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * config.rotateSpeedY;
      pointsRef.current.rotation.x += delta * config.rotateSpeedX;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={pos}
          count={config.count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colorArr}
          count={config.count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={config.size}
        vertexColors
        transparent
        opacity={config.opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to Starfield.tsx

- [ ] **Step 3: Commit**

```bash
git add components/globe/Starfield.tsx
git commit -m "refactor: Starfield accepts layer config with multi-color support"
```

---

### Task 2: Create NebulaGlow.tsx

**Files:**
- Create: `components/globe/NebulaGlow.tsx`

- [ ] **Step 1: Create NebulaGlow component with canvas-generated sprite textures**

```tsx
"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface NebulaConfig {
  position: [number, number, number];
  color1: string;   // inner color
  color2: string;   // outer color (fades to transparent)
  scale: number;
  opacity: number;
  phase: number;    // offset for sinusoidal drift
}

function generateNebulaTexture(color1: string, color2: string): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(0.3, color1);
  gradient.addColorStop(0.7, color2);
  gradient.addColorStop(1, "transparent");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

const NEBULAE: NebulaConfig[] = [
  { position: [0, 1.5, -5], color1: "#4a2a6a", color2: "#2a3a6a", scale: 4, opacity: 0.05, phase: 0 },
  { position: [-3, -0.5, -4], color1: "#3a2a5a", color2: "#1a3a5a", scale: 3.5, opacity: 0.04, phase: Math.PI / 3 },
  { position: [3.5, 0, -4.5], color1: "#4a3060", color2: "#2a4070", scale: 3.8, opacity: 0.045, phase: (Math.PI * 2) / 3 },
];

export default function NebulaGlow() {
  const sprites = useMemo(
    () =>
      NEBULAE.map((cfg) => ({
        texture: generateNebulaTexture(cfg.color1, cfg.color2),
        config: cfg,
        ref: { current: null as THREE.Sprite | null },
      })),
    []
  );

  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    sprites.forEach((s) => {
      if (s.ref.current) {
        const cfg = s.config;
        s.ref.current.position.x = cfg.position[0] + Math.sin(t * 0.15 + cfg.phase) * 0.5;
        s.ref.current.position.y = cfg.position[1] + Math.cos(t * 0.12 + cfg.phase) * 0.4;
        s.ref.current.position.z = cfg.position[2] + Math.sin(t * 0.1 + cfg.phase) * 0.3;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {sprites.map((s, i) => (
        <sprite
          key={i}
          ref={(el) => { s.ref.current = el; }}
          position={s.config.position}
          scale={[s.config.scale, s.config.scale, 1]}
        >
          <spriteMaterial
            map={s.texture}
            transparent
            opacity={s.config.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  );
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to NebulaGlow.tsx

- [ ] **Step 3: Commit**

```bash
git add components/globe/NebulaGlow.tsx
git commit -m "feat: add NebulaGlow component with 3 drifting nebula sprites"
```

---

### Task 3: Create AuroraRing.tsx

**Files:**
- Create: `components/globe/AuroraRing.tsx`

- [ ] **Step 1: Create AuroraRing component with RingGeometry + custom shader**

```tsx
"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function AuroraRing() {
  const ringRef = useRef<THREE.Mesh>(null);

  const shader uniforms = useMemo(
    () => ({
      uColor1: { value: new THREE.Color("#f0c878") },
      uColor2: { value: new THREE.Color("#6a4a8a") },
      uOpacity: { value: 0.06 },
    }),
    []
  );

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.003;
    }
  });

  return (
    <mesh
      ref={ringRef}
      rotation={[Math.PI * 0.35, 0, 0]}  // ~15° tilt from equatorial plane, plus some
      renderOrder={0}
    >
      <ringGeometry args={[2.1, 2.25, 128]} />
      <shaderMaterial
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vPos;
          void main() {
            vUv = uv;
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vPos = worldPos.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          varying vec3 vPos;
          uniform vec3 uColor1;
          uniform vec3 uColor2;
          uniform float uOpacity;
          void main() {
            // radial gradient: warm gold at inner edge, fading to transparent at outer edge
            float dist = length(vUv - 0.5) * 2.0; // 0 at center, 1 at edges
            // ring is only between inner and outer radius, so use uv.y for radial
            float t = vUv.y; // 0 = inner radius, 1 = outer radius
            float alpha = smoothstep(0.0, 0.15, t) * (1.0 - smoothstep(0.7, 1.0, t));
            vec3 color = mix(uColor1, uColor2, t);
            gl_FragColor = vec4(color, alpha * uOpacity);
          }
        `}
      />
    </mesh>
  );
}
```

Wait — the `useMemo` import is missing. Let me fix the code:

```tsx
"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function AuroraRing() {
  const ringRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uColor1: { value: new THREE.Color("#f0c878") },
      uColor2: { value: new THREE.Color("#6a4a8a") },
      uOpacity: { value: 0.06 },
    }),
    []
  );

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.003;
    }
  });

  return (
    <mesh
      ref={ringRef}
      rotation={[Math.PI * 0.35, 0, 0]}
      renderOrder={0}
    >
      <ringGeometry args={[2.1, 2.25, 128]} />
      <shaderMaterial
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vPos;
          void main() {
            vUv = uv;
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vPos = worldPos.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          varying vec3 vPos;
          uniform vec3 uColor1;
          uniform vec3 uColor2;
          uniform float uOpacity;
          void main() {
            float t = vUv.y;
            float alpha = smoothstep(0.0, 0.15, t) * (1.0 - smoothstep(0.7, 1.0, t));
            vec3 color = mix(uColor1, uColor2, t);
            gl_FragColor = vec4(color, alpha * uOpacity);
          }
        `}
      />
    </mesh>
  );
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to AuroraRing.tsx

- [ ] **Step 3: Commit**

```bash
git add components/globe/AuroraRing.tsx
git commit -m "feat: add AuroraRing with warm-gold gradient shader"
```

---

### Task 4: Integrate into ParticleGlobe + slow rotation + brighten glow

**Files:**
- Modify: `components/globe/ParticleGlobe.tsx`

- [ ] **Step 1: Add imports for new components and StarLayerConfig**

At the top of `ParticleGlobe.tsx`, add:

```tsx
import Starfield, { type StarLayerConfig } from "./Starfield";
import NebulaGlow from "./NebulaGlow";
import AuroraRing from "./AuroraRing";
```

Replace the existing `import Starfield from "./Starfield";` line.

- [ ] **Step 2: Define three star layer configs**

Add after imports, before `type Vec3`:

```tsx
const STAR_LAYERS: StarLayerConfig[] = [
  {
    count: 200, radiusMin: 8, radiusMax: 12, size: 0.012, opacity: 0.5,
    colors: [
      { r: 0.7, g: 0.8, b: 1.0, weight: 2 },
      { r: 0.6, g: 0.7, b: 0.9, weight: 1 },
    ],
    rotateSpeedX: 0.001, rotateSpeedY: 0.003,
  },
  {
    count: 250, radiusMin: 6, radiusMax: 9, size: 0.016, opacity: 0.65,
    colors: [
      { r: 0.85, g: 0.85, b: 0.95, weight: 2 },
      { r: 1.0, g: 0.85, b: 0.65, weight: 1 },
    ],
    rotateSpeedX: 0.002, rotateSpeedY: 0.006,
  },
  {
    count: 150, radiusMin: 4.5, radiusMax: 7, size: 0.022, opacity: 0.8,
    colors: [
      { r: 1.0, g: 0.82, b: 0.55, weight: 2 },
      { r: 1.0, g: 0.9, b: 0.7, weight: 1 },
    ],
    rotateSpeedX: 0.0015, rotateSpeedY: 0.004,
  },
];
```

- [ ] **Step 3: Replace the single `<Starfield count={300} />` with three layers + new components**

In `GlobeScene`, replace:
```tsx
<Starfield count={300} />
```
with:
```tsx
{STAR_LAYERS.map((cfg, i) => <Starfield key={i} config={cfg} />)}
<NebulaGlow />
<AuroraRing />
```

- [ ] **Step 4: Slow globe main rotation by 10%**

Change line:
```tsx
if (mainRef.current) mainRef.current.rotation.y += delta * 0.5;
```
to:
```tsx
if (mainRef.current) mainRef.current.rotation.y += delta * 0.45;
```

- [ ] **Step 5: Brighten glow particles**

Change glow opacity from:
```tsx
if (gm) { gm.opacity = 0.02 + (Math.sin(t*1.8)+1)*0.2; gm.needsUpdate = true; }
```
to:
```tsx
if (gm) { gm.opacity = 0.04 + (Math.sin(t*1.8)+1)*0.25; gm.needsUpdate = true; }
```
(Range changes from 0.02–0.42 → 0.04–0.54, ~30% brighter)

- [ ] **Step 6: Verify TypeScript compilation**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add components/globe/ParticleGlobe.tsx
git commit -m "feat: integrate 3-layer starfield + nebula + aurora ring, slow rotation 10%, brighten glow"
```

---

### Self-Review

**1. Spec coverage:**
- [x] Starfield refactor with `config` type → Task 1
- [x] Far layer (200, 8-12, cool blue-white) → Task 4 Step 2 (layer 0)
- [x] Mid layer (250, 6-9, white+warm gold) → Task 4 Step 2 (layer 1)
- [x] Near layer (150, 4.5-7, warm gold) → Task 4 Step 2 (layer 2)
- [x] NebulaGlow (2-3 sprites, canvas gradients, sinusoidal drift) → Task 2
- [x] AuroraRing (RingGeometry, shader, warm gradient, slow rotation) → Task 3
- [x] ParticleGlobe integration → Task 4
- [x] Globe rotation -10% → Task 4 Step 4
- [x] Glow particles brighter → Task 4 Step 5

**2. Placeholder scan:** No TBD/TODO found. All code is concrete. ✓

**3. Type consistency:** `StarLayerConfig` defined in Task 1, consumed in Task 4. `NebulaGlow` and `AuroraRing` are default exports with no props → no signature mismatch. ✓
