"use client";
import { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Starfield from "./Starfield";
import CountryHighlights from "./CountryHighlights";
import CountryInfoPanel from "./CountryInfoPanel";
import { globeCamera } from "@/lib/globe-state";
import type { CountryFilmData, GlobeCameraState } from "@/lib/types";

// ============ 海洋粒子层 ============

function OceanParticles({ data }: { data: { x: number; y: number; z: number }[] }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(data.length * 3);
    const col = new Float32Array(data.length * 3);
    for (let i = 0; i < data.length; i++) {
      pos[i * 3] = data[i].x;
      pos[i * 3 + 1] = data[i].y;
      pos[i * 3 + 2] = data[i].z;
      // 深蓝海洋
      const flicker = 0.7 + Math.random() * 0.3;
      col[i * 3] = 0.04 * flicker;
      col[i * 3 + 1] = 0.1 * flicker;
      col[i * 3 + 2] = 0.22 * flicker;
    }
    return { positions: pos, colors: col };
  }, [data]);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={data.length} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={colors} count={data.length} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.012} vertexColors transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// ============ 大陆粒子层 ============

function LandParticles({ data }: { data: { x: number; y: number; z: number }[] }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(data.length * 3);
    const col = new Float32Array(data.length * 3);
    for (let i = 0; i < data.length; i++) {
      pos[i * 3] = data[i].x;
      pos[i * 3 + 1] = data[i].y;
      pos[i * 3 + 2] = data[i].z;
      const b = 0.5 + Math.random() * 0.5;
      col[i * 3] = 0.08 * b;
      col[i * 3 + 1] = 0.28 * b;
      col[i * 3 + 2] = 0.58 * b;
    }
    return { positions: pos, colors: col };
  }, [data]);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={data.length} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={colors} count={data.length} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.01} vertexColors transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// ============ 大气层光晕 (Fresnel) ============

function AtmosphereGlow() {
  return (
    <mesh>
      <sphereGeometry args={[1.55, 64, 64]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{ uColor: { value: new THREE.Color("#1a3a5c") } }}
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vPosition = wp.xyz;
            vNormal = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec3 vNormal;
          varying vec3 vPosition;
          uniform vec3 uColor;
          void main() {
            float f = 1.0 - abs(dot(normalize(cameraPosition - vPosition), vNormal));
            f = pow(f, 2.5);
            gl_FragColor = vec4(uColor, f * 0.2);
          }
        `}
      />
    </mesh>
  );
}

// ============ 场景内容 ============

type ParticleData = { ocean: { x: number; y: number; z: number }[]; land: { x: number; y: number; z: number }[] } | null;

function GlobeScene({ onClickCountry, activeCountry, particleData }: {
  onClickCountry: (c: CountryFilmData) => void;
  activeCountry: string | null;
  particleData: ParticleData;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
  });

  // 恢复保存的相机视角
  useEffect(() => {
    const saved = globeCamera.restore();
    if (saved && controlsRef.current) {
      const ctrl = controlsRef.current;
      // 延迟一帧应用，确保控制器已初始化
      requestAnimationFrame(() => {
        if (ctrl.target) {
          ctrl.target.set(saved.target[0], saved.target[1], saved.target[2]);
        }
        if (ctrl.object) {
          ctrl.object.position.set(saved.position[0], saved.position[1], saved.position[2]);
          ctrl.object.zoom = saved.zoom;
          ctrl.update();
        }
      });
    }
  }, []);

  // 组件卸载前保存相机状态
  useEffect(() => {
    return () => {
      if (controlsRef.current) {
        const ctrl = controlsRef.current;
        const state: GlobeCameraState = {
          position: ctrl.object?.position?.toArray() ?? [0, 0.3, 3.5],
          target: ctrl.target?.toArray() ?? [0, 0, 0],
          zoom: ctrl.object?.zoom ?? 1,
        };
        globeCamera.save(state);
      }
    };
  }, []);

  return (
    <>
      <Starfield count={300} />
      <AtmosphereGlow />
      <ambientLight intensity={0.1} />

      <group ref={groupRef}>
        {particleData && (
          <>
            <OceanParticles data={particleData.ocean} />
            <LandParticles data={particleData.land} />
          </>
        )}
        <CountryHighlights onClickCountry={onClickCountry} isActive={activeCountry} />
      </group>

      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        zoomSpeed={0.8}
        minDistance={2.5}
        maxDistance={5}
        rotateSpeed={0.5}
        autoRotate={false}
        enablePan={false}
      />
    </>
  );
}

// ============ 数据加载包装 ============

function GlobeDataLoader(props: {
  onClickCountry: (c: CountryFilmData) => void;
  activeCountry: string | null;
}) {
  const [data, setData] = useState<ParticleData>(null);

  useEffect(() => {
    fetch("/globe-particles.json")
      .then((res) => res.json())
      .then(setData)
      .catch(() => console.warn("Failed to load globe particle data"));
  }, []);

  return <GlobeScene {...props} particleData={data} />;
}

// ============ 主导出 ============

interface ParticleGlobeProps {
  onMovieClick: (movieId: number) => void;
}

export default function ParticleGlobe({ onMovieClick }: ParticleGlobeProps) {
  const [activeCountry, setActiveCountry] = useState<CountryFilmData | null>(null);

  return (
    <div className="relative w-full h-[360px] md:h-[420px] lg:h-[440px] bg-gradient-to-b from-[#0a1628] to-bg rounded-card overflow-hidden">
      <Canvas
        camera={{ position: [0, 0.3, 3.5], fov: 45, near: 0.1, far: 20 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <GlobeDataLoader
            onClickCountry={setActiveCountry}
            activeCountry={activeCountry?.countryCode ?? null}
          />
        </Suspense>
      </Canvas>

      <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
        <p className="text-text-muted text-[10px] opacity-50">拖拽旋转 · 滚轮缩放 · 点击光点探索</p>
      </div>

      <CountryInfoPanel
        country={activeCountry}
        onClose={() => setActiveCountry(null)}
        onMovieClick={onMovieClick}
      />
    </div>
  );
}
