"use client";
import { useRef, useMemo, useState, useEffect, Suspense, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Starfield from "./Starfield";
import CountryHighlights from "./CountryHighlights";
import CountryGlowLayer from "./CountryGlowLayer";
import CountryInfoPanel from "./CountryInfoPanel";
import { globeCamera } from "@/lib/globe-state";
import type { CountryFilmData, GlobeCameraState } from "@/lib/types";

type Vec3 = { x: number; y: number; z: number };

// ============ 海洋粒子 ============

function OceanLayer({ data }: { data: Vec3[] }) {
  const geo = useMemo(() => {
    const p = new Float32Array(data.length * 3);
    const c = new Float32Array(data.length * 3);
    for (let i = 0; i < data.length; i++) {
      p[i * 3] = data[i].x; p[i * 3 + 1] = data[i].y; p[i * 3 + 2] = data[i].z;
      const flicker = 0.7 + Math.random() * 0.3;
      c[i * 3] = 0.02 * flicker;
      c[i * 3 + 1] = 0.08 * flicker;
      c[i * 3 + 2] = 0.2 * flicker;
    }
    return { positions: p, colors: c };
  }, [data]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={geo.positions} count={data.length} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={geo.colors} count={data.length} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.012} vertexColors transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// ============ 大陆内部粒子 ============

function LandInteriorLayer({ data }: { data: Vec3[] }) {
  const geo = useMemo(() => {
    const p = new Float32Array(data.length * 3);
    const c = new Float32Array(data.length * 3);
    for (let i = 0; i < data.length; i++) {
      p[i * 3] = data[i].x; p[i * 3 + 1] = data[i].y; p[i * 3 + 2] = data[i].z;
      const b = 0.5 + Math.random() * 0.5;
      c[i * 3] = 0.08 * b;
      c[i * 3 + 1] = 0.28 * b;
      c[i * 3 + 2] = 0.65 * b;
    }
    return { positions: p, colors: c };
  }, [data]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={geo.positions} count={data.length} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={geo.colors} count={data.length} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.01} vertexColors transparent opacity={0.75} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// ============ 大陆边缘粒子 (明亮大号) ============

function LandEdgeLayer({ data }: { data: Vec3[] }) {
  const geo = useMemo(() => {
    const p = new Float32Array(data.length * 3);
    const c = new Float32Array(data.length * 3);
    for (let i = 0; i < data.length; i++) {
      p[i * 3] = data[i].x; p[i * 3 + 1] = data[i].y; p[i * 3 + 2] = data[i].z;
      c[i * 3] = 0.65; c[i * 3 + 1] = 0.82; c[i * 3 + 2] = 1.0;
    }
    return { positions: p, colors: c };
  }, [data]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={geo.positions} count={data.length} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={geo.colors} count={data.length} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.028} vertexColors transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// ============ 外层微光 ============

function GlowLayer({ data }: { data: Vec3[] }) {
  const geo = useMemo(() => {
    const p = new Float32Array(data.length * 3);
    const c = new Float32Array(data.length * 3);
    for (let i = 0; i < data.length; i++) {
      p[i * 3] = data[i].x; p[i * 3 + 1] = data[i].y; p[i * 3 + 2] = data[i].z;
      c[i * 3] = 0.1; c[i * 3 + 1] = 0.2; c[i * 3 + 2] = 0.45;
    }
    return { positions: p, colors: c };
  }, [data]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={geo.positions} count={data.length} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={geo.colors} count={data.length} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.018} vertexColors transparent opacity={0.18} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// ============ 大气光晕 ============

function AtmosphereGlow() {
  return (
    <mesh>
      <sphereGeometry args={[1.55, 64, 64]} />
      <shaderMaterial
        transparent depthWrite={false} blending={THREE.AdditiveBlending}
        uniforms={{ uColor: { value: new THREE.Color("#2a5a9a") } }}
        vertexShader={`
          varying vec3 vNormal; varying vec3 vPosition;
          void main() {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vPosition = wp.xyz;
            vNormal = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying vec3 vNormal; varying vec3 vPosition;
          uniform vec3 uColor;
          void main() {
            float f = 1.0 - abs(dot(normalize(cameraPosition - vPosition), vNormal));
            f = pow(f, 2.5);
            gl_FragColor = vec4(uColor, f * 0.3);
          }
        `}
      />
    </mesh>
  );
}

// ============ 场景 ============

type ParticleData = { ocean: Vec3[]; landInterior: Vec3[]; landEdge: Vec3[]; glow: Vec3[] };

function GlobeScene({
  onClickCountry,
  activeCountryCode,
  particleData,
}: {
  onClickCountry: (c: CountryFilmData) => void;
  activeCountryCode: string | null;
  particleData: ParticleData;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);

  // 自转
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.1;
  });

  // 恢复相机状态
  useEffect(() => {
    const saved = globeCamera.restore();
    if (saved && controlsRef.current) {
      requestAnimationFrame(() => {
        const c = controlsRef.current;
        if (c?.target) c.target.set(...saved.target);
        if (c?.object) { c.object.position.set(...saved.position); c.object.zoom = saved.zoom; c.update(); }
      });
    }
  }, []);

  // 保存相机状态
  useEffect(() => () => {
    if (controlsRef.current) {
      const c = controlsRef.current;
      globeCamera.save({
        position: c.object?.position?.toArray() ?? [0, 0.3, 3.5],
        target: c.target?.toArray() ?? [0, 0, 0],
        zoom: c.object?.zoom ?? 1,
      });
    }
  }, []);

  return (
    <>
      <Starfield count={300} />
      <AtmosphereGlow />
      <ambientLight intensity={0.1} />
      <group ref={groupRef}>
        <OceanLayer data={particleData.ocean} />
        <LandInteriorLayer data={particleData.landInterior} />
        <LandEdgeLayer data={particleData.landEdge} />
        <CountryHighlights onClickCountry={onClickCountry} isActive={activeCountryCode} />
        <GlowLayer data={particleData.glow} />
        <CountryGlowLayer countryCode={activeCountryCode} />
      </group>
      <OrbitControls ref={controlsRef} enableZoom zoomSpeed={0.8} minDistance={2.5} maxDistance={5} rotateSpeed={0.5} autoRotate={false} enablePan={false} />
    </>
  );
}

// ============ 数据加载 ============

function GlobeDataLoader(props: {
  onClickCountry: (c: CountryFilmData) => void;
  activeCountryCode: string | null;
}) {
  const [data, setData] = useState<ParticleData | null>(null);

  useEffect(() => {
    fetch("/globe-particles.json")
      .then((res) => res.json())
      .then((d) => setData({ ocean: d.ocean || [], landInterior: d.landInterior || [], landEdge: d.landEdge || [], glow: d.glow || [] }))
      .catch(() => {});
  }, []);

  if (!data) return null;
  return <GlobeScene {...props} particleData={data} />;
}

// ============ 主组件 ============

interface ParticleGlobeProps {
  onMovieClick: (movieId: number) => void;
}

export default function ParticleGlobe({ onMovieClick }: ParticleGlobeProps) {
  const [activeCountry, setActiveCountry] = useState<CountryFilmData | null>(null);

  const handleClose = useCallback(() => setActiveCountry(null), []);

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
            activeCountryCode={activeCountry?.countryCode ?? null}
          />
        </Suspense>
      </Canvas>

      {!activeCountry && (
        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
          <p className="text-white/40 text-xs">拖拽旋转 · 滚轮缩放 · 点击金色光点探索</p>
        </div>
      )}

      <CountryInfoPanel country={activeCountry} onClose={handleClose} onMovieClick={onMovieClick} />
    </div>
  );
}
