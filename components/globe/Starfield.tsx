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
