"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function GalaxyParticles({ count = 2000 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const gold = new THREE.Color("#c8a951");
    const white = new THREE.Color("#ffffff");
    const blue = new THREE.Color("#6699cc");

    for (let i = 0; i < count; i++) {
      const arm = i % 3;
      const armAngle = (arm / 3) * Math.PI * 2;
      const dist = 2 + Math.random() * 7;
      const spiralAngle = armAngle + dist * 0.8 + (Math.random() - 0.5) * 0.5;
      const height = (Math.random() - 0.5) * 1.5;

      pos[i * 3] = Math.cos(spiralAngle) * dist;
      pos[i * 3 + 1] = height;
      pos[i * 3 + 2] = Math.sin(spiralAngle) * dist;

      const mix = Math.random();
      let c: THREE.Color;
      if (mix < 0.5) c = gold.clone().lerp(white, Math.random() * 0.4);
      else if (mix < 0.85) c = gold.clone().lerp(blue, Math.random() * 0.3);
      else c = white.clone().lerp(blue, Math.random() * 0.2);

      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, [count]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.06;
      meshRef.current.rotation.x += delta * 0.015;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function Starfield() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 1, 7], fov: 55 }} gl={{ antialias: true, alpha: true }}>
        <GalaxyParticles />
      </Canvas>
    </div>
  );
}
