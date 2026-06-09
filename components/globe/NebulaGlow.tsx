"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface NebulaConfig {
  position: [number, number, number];
  color1: string;
  color2: string;
  scale: number;
  opacity: number;
  phase: number;
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
  { position: [0, 1.5, -5], color1: "#5a3a7a", color2: "#3a4a7a", scale: 5, opacity: 0.12, phase: 0 },
  { position: [-3.5, -0.5, -4.5], color1: "#4a3060", color2: "#2a4070", scale: 4.5, opacity: 0.10, phase: Math.PI / 3 },
  { position: [3.5, 0.5, -5], color1: "#5a4070", color2: "#3a5080", scale: 4.8, opacity: 0.11, phase: (Math.PI * 2) / 3 },
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
    <group>
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
