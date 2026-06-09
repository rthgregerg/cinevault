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
type ParticleData = { ocean: Vec3[]; land: Vec3[]; glow: Vec3[] };

function makeGeo(data: Vec3[]) {
  const p = new Float32Array(data.length * 3);
  for (let i = 0; i < data.length; i++) { p[i*3]=data[i].x; p[i*3+1]=data[i].y; p[i*3+2]=data[i].z; }
  return p;
}

function AtmosphereGlow() {
  return (
    <mesh>
      <sphereGeometry args={[1.55, 64, 64]} />
      <shaderMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending}
        uniforms={{ uColor: { value: new THREE.Color("#2a5a9a") } }}
        vertexShader="varying vec3 vN,vP;void main(){vec4 w=modelMatrix*vec4(position,1.);vP=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}"
        fragmentShader="varying vec3 vN,vP;uniform vec3 uColor;void main(){float f=1.-abs(dot(normalize(cameraPosition-vP),vN));f=pow(f,2.5);gl_FragColor=vec4(uColor,f*0.3);}"
      />
    </mesh>
  );
}

function GlobeScene({
  onClickCountry, activeCountryCode, particleData,
}: {
  onClickCountry: (c: CountryFilmData) => void;
  activeCountryCode: string | null;
  particleData: ParticleData;
}) {
  const mainRef = useRef<THREE.Group>(null);
  const oceanRef = useRef<THREE.Group>(null);
  const landRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);
  const oceanOpRef = useRef<THREE.PointsMaterial>(null);
  const landOpRef = useRef<THREE.PointsMaterial>(null);
  const glowOpRef = useRef<THREE.PointsMaterial>(null);

  const oceanGeo = useMemo(() => makeGeo(particleData.ocean), [particleData.ocean]);
  const landGeo = useMemo(() => makeGeo(particleData.land), [particleData.land]);
  const glowGeo = useMemo(() => makeGeo(particleData.glow), [particleData.glow]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();

    // 主球体自转
    if (mainRef.current) mainRef.current.rotation.y += delta * 0.1;

    // 海洋层：明显闪烁 + 呼吸
    if (oceanRef.current) {
      const s = 1 + Math.sin(t * 0.8) * 0.03;
      oceanRef.current.scale.setScalar(s);
    }
    if (oceanOpRef.current) oceanOpRef.current.opacity = 0.2 + (Math.sin(t * 1.5) + 1) * 0.35;

    // 大陆层：明显闪烁
    if (landRef.current) {
      const s = 1 + Math.sin(t * 1.1 + 1) * 0.025;
      landRef.current.scale.setScalar(s);
    }
    if (landOpRef.current) landOpRef.current.opacity = 0.3 + (Math.sin(t * 1.3) + 1) * 0.3;

    // 微光层：大幅度脉冲
    if (glowRef.current) {
      const s = 1 + Math.sin(t * 0.5) * 0.08;
      glowRef.current.scale.setScalar(s);
    }
    if (glowOpRef.current) glowOpRef.current.opacity = 0.03 + (Math.sin(t * 0.6) + 1) * 0.1;
  });

  useEffect(() => {
    const saved = globeCamera.restore();
    if (saved && controlsRef.current) requestAnimationFrame(() => {
      const c = controlsRef.current;
      if (c?.target) c.target.set(...saved.target);
      if (c?.object) { c.object.position.set(...saved.position); c.object.zoom = saved.zoom; c.update(); }
    });
  }, []);
  useEffect(() => () => {
    if (controlsRef.current) {
      const c = controlsRef.current;
      globeCamera.save({ position: c.object?.position?.toArray() ?? [0,0.3,3.5], target: c.target?.toArray() ?? [0,0,0], zoom: c.object?.zoom ?? 1 });
    }
  }, []);

  return (
    <>
      <Starfield count={300} />
      <AtmosphereGlow />
      <ambientLight intensity={0.1} />
      <group ref={mainRef}>
        {/* 海洋层 */}
        <group ref={oceanRef}>
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" array={oceanGeo} count={particleData.ocean.length} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial ref={oceanOpRef} color="#082244" size={0.012} transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} />
          </points>
        </group>
        {/* 大陆层 */}
        <group ref={landRef}>
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" array={landGeo} count={particleData.land.length} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial ref={landOpRef} color="#1e5aaa" size={0.011} transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} />
          </points>
        </group>
        {/* 微光层 */}
        <group ref={glowRef}>
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" array={glowGeo} count={particleData.glow.length} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial ref={glowOpRef} color="#1a3a6a" size={0.018} transparent opacity={0.15} depthWrite={false} blending={THREE.AdditiveBlending} />
          </points>
        </group>
        <CountryHighlights onClickCountry={onClickCountry} isActive={activeCountryCode} />
        <CountryGlowLayer countryCode={activeCountryCode} />
      </group>
      <OrbitControls ref={controlsRef} enableZoom zoomSpeed={0.8} minDistance={2.5} maxDistance={5} rotateSpeed={0.5} autoRotate={false} enablePan={false} />
    </>
  );
}

function GlobeDataLoader(props: { onClickCountry: (c: CountryFilmData) => void; activeCountryCode: string | null }) {
  const [d, set] = useState<ParticleData | null>(null);
  useEffect(() => { fetch("/globe-particles.json").then(r => r.json()).then(j => set({ ocean: j.ocean||[], land: j.land||[], glow: j.glow||[] })).catch(()=>{}); }, []);
  if (!d) return null;
  return <GlobeScene {...props} particleData={d} />;
}

export default function ParticleGlobe({ onMovieClick }: { onMovieClick: (id: number) => void }) {
  const [active, setActive] = useState<CountryFilmData | null>(null);
  return (
    <div className="relative w-full h-[360px] md:h-[420px] lg:h-[440px] bg-gradient-to-b from-[#0a1628] to-bg rounded-card overflow-hidden">
      <Canvas camera={{ position:[0,0.3,3.5], fov:45, near:0.1, far:20 }} gl={{ antialias:true, alpha:true }} style={{ background:"transparent" }}>
        <Suspense fallback={null}>
          <GlobeDataLoader onClickCountry={setActive} activeCountryCode={active?.countryCode??null} />
        </Suspense>
      </Canvas>
      {!active && <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none"><p className="text-white/40 text-xs">拖拽旋转 · 滚轮缩放 · 点击金色光点探索</p></div>}
      <CountryInfoPanel country={active} onClose={()=>setActive(null)} onMovieClick={onMovieClick} />
    </div>
  );
}
