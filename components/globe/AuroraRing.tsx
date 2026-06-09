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
      uOpacity: { value: 0.14 },
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
      <ringGeometry args={[2.05, 2.35, 128]} />
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
