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

// ============ 粒子层 (纯渲染，无动画) ============

function ParticleLayer({
  data, color, opacity, size, layerRef,
}: {
  data: Vec3[]; color: string; opacity: number; size: number;
  layerRef: React.MutableRefObject<{ mesh: THREE.Points | null; orig: Vec3[]; phases: Float32Array }>;
}) {
  const meshRef = useRef<THREE.Points>(null);
  const origPos = useMemo(() => {
    const p = new Float32Array(data.length * 3);
    for (let i = 0; i < data.length; i++) { p[i * 3] = data[i].x; p[i * 3 + 1] = data[i].y; p[i * 3 + 2] = data[i].z; }
    return p;
  }, [data]);
  const phases = useMemo(() => {
    const ph = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) ph[i] = Math.random() * Math.PI * 2;
    return ph;
  }, [data]);

  useEffect(() => {
    layerRef.current = { mesh: meshRef.current, orig: data, phases };
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={origPos} count={data.length} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={color} size={size} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} />
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
          void main(){vec4 wp=modelMatrix*vec4(position,1.);vPosition=wp.xyz;vNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}
        `}
        fragmentShader={`
          varying vec3 vNormal; varying vec3 vPosition;
          uniform vec3 uColor;
          void main(){float f=1.-abs(dot(normalize(cameraPosition-vPosition),vNormal));f=pow(f,2.5);gl_FragColor=vec4(uColor,f*0.3);}
        `}
      />
    </mesh>
  );
}

// ============ 场景 (集中所有动画) ============

type ParticleData = { ocean: Vec3[]; land: Vec3[]; glow: Vec3[] };

function GlobeScene({
  onClickCountry, activeCountryCode, particleData,
}: {
  onClickCountry: (c: CountryFilmData) => void;
  activeCountryCode: string | null;
  particleData: ParticleData;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);
  const oceanRef = useRef<{ mesh: THREE.Points | null; orig: Vec3[]; phases: Float32Array }>({ mesh: null, orig: [], phases: new Float32Array() });
  const landRef = useRef<{ mesh: THREE.Points | null; orig: Vec3[]; phases: Float32Array }>({ mesh: null, orig: [], phases: new Float32Array() });
  const glowRef = useRef<{ mesh: THREE.Points | null; orig: Vec3[]; phases: Float32Array }>({ mesh: null, orig: [], phases: new Float32Array() });

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    groupRef.current && (groupRef.current.rotation.y += delta * 0.1);

    // 对所有三个粒子层做闪烁+浮动
    const layers = [
      { ref: oceanRef, amp: 0.012, freq: 1.5, opacityBase: 0.5, opacityRange: 0.1 },
      { ref: landRef,  amp: 0.01,  freq: 1.3, opacityBase: 0.65, opacityRange: 0.15 },
      { ref: glowRef,  amp: 0.04,  freq: 0.6, opacityBase: 0.12, opacityRange: 0.06 },
    ];

    for (const layer of layers) {
      const m = layer.ref.current.mesh;
      if (!m) continue;
      // 闪烁
      (m.material as THREE.PointsMaterial).opacity = layer.opacityBase + layer.opacityRange * Math.sin(t * layer.freq);
      // 浮动
      const pos = m.geometry.getAttribute("position") as THREE.BufferAttribute;
      if (!pos) continue;
      const arr = pos.array as Float32Array;
      const orig = layer.ref.current.orig;
      const phases = layer.ref.current.phases;
      for (let i = 0; i < Math.min(orig.length, arr.length / 3); i++) {
        const wave = Math.sin(t * 0.7 + phases[i]) * layer.amp;
        const d = orig[i];
        const len = Math.sqrt(d.x * d.x + d.y * d.y + d.z * d.z) || 1;
        arr[i * 3] = d.x + (d.x / len) * wave;
        arr[i * 3 + 1] = d.y + (d.y / len) * wave;
        arr[i * 3 + 2] = d.z + (d.z / len) * wave;
      }
      pos.needsUpdate = true;
    }
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
        <ParticleLayer data={particleData.ocean} color="#061e3a" opacity={0.6} size={0.012} layerRef={oceanRef} />
        <ParticleLayer data={particleData.land}  color="#1a52a0" opacity={0.8} size={0.011} layerRef={landRef} />
        <ParticleLayer data={particleData.glow}  color="#1a3a6a" opacity={0.15} size={0.018} layerRef={glowRef} />
        <CountryHighlights onClickCountry={onClickCountry} isActive={activeCountryCode} />
        <CountryGlowLayer countryCode={activeCountryCode} />
      </group>
      <OrbitControls ref={controlsRef} enableZoom zoomSpeed={0.8} minDistance={2.5} maxDistance={5} rotateSpeed={0.5} autoRotate={false} enablePan={false} />
    </>
  );
}

function GlobeDataLoader(props: { onClickCountry: (c: CountryFilmData) => void; activeCountryCode: string | null }) {
  const [data, setData] = useState<ParticleData | null>(null);
  useEffect(() => {
    fetch("/globe-particles.json").then(r => r.json()).then(d => setData({ ocean: d.ocean || [], land: d.land || [], glow: d.glow || [] })).catch(() => {});
  }, []);
  if (!data) return null;
  return <GlobeScene {...props} particleData={data} />;
}

interface ParticleGlobeProps { onMovieClick: (movieId: number) => void; }

export default function ParticleGlobe({ onMovieClick }: ParticleGlobeProps) {
  const [activeCountry, setActiveCountry] = useState<CountryFilmData | null>(null);
  return (
    <div className="relative w-full h-[360px] md:h-[420px] lg:h-[440px] bg-gradient-to-b from-[#0a1628] to-bg rounded-card overflow-hidden">
      <Canvas camera={{ position: [0, 0.3, 3.5], fov: 45, near: 0.1, far: 20 }} gl={{ antialias: true, alpha: true }} style={{ background: "transparent" }}>
        <Suspense fallback={null}>
          <GlobeDataLoader onClickCountry={setActiveCountry} activeCountryCode={activeCountry?.countryCode ?? null} />
        </Suspense>
      </Canvas>
      {!activeCountry && <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none"><p className="text-white/40 text-xs">拖拽旋转 · 滚轮缩放 · 点击金色光点探索</p></div>}
      <CountryInfoPanel country={activeCountry} onClose={() => setActiveCountry(null)} onMovieClick={onMovieClick} />
    </div>
  );
}
