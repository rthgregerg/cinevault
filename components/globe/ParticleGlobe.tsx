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
import type { CountryFilmData } from "@/lib/types";

type Vec3 = { x: number; y: number; z: number };

// ============ 动态粒子着色器 (闪烁 + 浮动) ============

const vertexShader = `
  attribute float aPhase;
  attribute float aFreq;
  uniform float uTime;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    // 浮动：沿径向微调
    float floatAmp = 0.015;
    float wave = sin(uTime * aFreq + aPhase);
    pos += normalize(position) * wave * floatAmp;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 1.0;
    gl_Position = projectionMatrix * mvPosition;

    // 闪烁：alpha 随正弦波动
    vAlpha = 0.65 + 0.35 * sin(uTime * aFreq * 1.3 + aPhase + 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float alpha = 1.0 - smoothstep(0.0, 1.0, d);
    alpha = pow(alpha, 1.5);
    gl_FragColor = vec4(uColor, alpha * uOpacity * vAlpha);
  }
`;

// 外层微光着色器 (浮动幅度更大)
const glowVertexShader = `
  attribute float aPhase;
  attribute float aFreq;
  uniform float uTime;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    float floatAmp = 0.04;
    float wave = sin(uTime * aFreq + aPhase);
    pos += normalize(position) * wave * floatAmp;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 1.0;
    gl_Position = projectionMatrix * mvPosition;

    vAlpha = 0.5 + 0.5 * sin(uTime * aFreq * 0.7 + aPhase + 2.0);
  }
`;

// ============ 通用动态粒子组件 ============

function DynamicParticles({
  data,
  color,
  opacity,
  size,
  floatAmp,
}: {
  data: Vec3[];
  color: [number, number, number];
  opacity: number;
  size: number;
  floatAmp: number;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { positions, phases, freqs } = useMemo(() => {
    const p = new Float32Array(data.length * 3);
    const ph = new Float32Array(data.length);
    const fr = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) {
      p[i * 3] = data[i].x;
      p[i * 3 + 1] = data[i].y;
      p[i * 3 + 2] = data[i].z;
      ph[i] = Math.random() * Math.PI * 2;
      fr[i] = 0.3 + Math.random() * 1.2;
    }
    return { positions: p, phases: ph, freqs: fr };
  }, [data]);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={data.length} itemSize={3} />
        <bufferAttribute attach="attributes-aPhase" array={phases} count={data.length} itemSize={1} />
        <bufferAttribute attach="attributes-aFreq" array={freqs} count={data.length} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={floatAmp > 0.02 ? glowVertexShader : vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(...color) },
          uOpacity: { value: opacity },
        }}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
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

type ParticleData = { ocean: Vec3[]; land: Vec3[]; glow: Vec3[] };

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

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.1;
  });

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
        <DynamicParticles data={particleData.ocean} color={[0.02, 0.08, 0.2]} opacity={0.6} size={0.01} floatAmp={0.015} />
        <DynamicParticles data={particleData.land} color={[0.1, 0.32, 0.7]} opacity={0.8} size={0.01} floatAmp={0.012} />
        <DynamicParticles data={particleData.glow} color={[0.1, 0.2, 0.45]} opacity={0.18} size={0.01} floatAmp={0.04} />
        <CountryHighlights onClickCountry={onClickCountry} isActive={activeCountryCode} />
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
      .then((d) => setData({ ocean: d.ocean || [], land: d.land || [], glow: d.glow || [] }))
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
      <Canvas camera={{ position: [0, 0.3, 3.5], fov: 45, near: 0.1, far: 20 }} gl={{ antialias: true, alpha: true }} style={{ background: "transparent" }}>
        <Suspense fallback={null}>
          <GlobeDataLoader onClickCountry={setActiveCountry} activeCountryCode={activeCountry?.countryCode ?? null} />
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
