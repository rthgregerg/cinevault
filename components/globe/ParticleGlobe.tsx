"use client";
import { useRef, useMemo, useState, useEffect, Suspense, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Starfield, { type StarLayerConfig } from "./Starfield";
import NebulaGlow from "./NebulaGlow";
import CountryHighlights from "./CountryHighlights";
import CountryGlowLayer from "./CountryGlowLayer";
import CountryInfoPanel from "./CountryInfoPanel";
import { globeCamera } from "@/lib/globe-state";
import type { CountryFilmData } from "@/lib/types";

const STAR_LAYERS: StarLayerConfig[] = [
  {
    count: 400, radiusMin: 8, radiusMax: 13, size: 0.016, opacity: 0.6,
    colors: [
      { r: 0.7, g: 0.8, b: 1.0, weight: 2 },
      { r: 0.6, g: 0.7, b: 0.9, weight: 1 },
    ],
    rotateSpeedX: 0.001, rotateSpeedY: 0.003,
  },
  {
    count: 500, radiusMin: 6, radiusMax: 9.5, size: 0.022, opacity: 0.75,
    colors: [
      { r: 0.85, g: 0.85, b: 0.95, weight: 2 },
      { r: 1.0, g: 0.82, b: 0.6, weight: 1.5 },
    ],
    rotateSpeedX: 0.002, rotateSpeedY: 0.006,
  },
  {
    count: 300, radiusMin: 4.5, radiusMax: 7, size: 0.03, opacity: 0.85,
    colors: [
      { r: 1.0, g: 0.78, b: 0.5, weight: 2 },
      { r: 1.0, g: 0.88, b: 0.65, weight: 1 },
    ],
    rotateSpeedX: 0.0015, rotateSpeedY: 0.004,
  },
];

type Vec3 = { x: number; y: number; z: number };
type ParticleData = { ocean: Vec3[]; land: Vec3[]; glow: Vec3[] };

function buf(d: Vec3[]) { const p=new Float32Array(d.length*3); for(let i=0;i<d.length;i++){p[i*3]=d[i].x;p[i*3+1]=d[i].y;p[i*3+2]=d[i].z;} return p; }

function GlobeScene({ onClickCountry, activeCountryCode, particleData }: {
  onClickCountry: (c: CountryFilmData) => void; activeCountryCode: string | null; particleData: ParticleData;
}) {
  const mainRef = useRef<THREE.Group>(null);
  const oceanGrp = useRef<THREE.Group>(null);
  const landGrp = useRef<THREE.Group>(null);
  const glowGrp = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);

  const oceanMesh = useRef<THREE.Points>(null);
  const landMesh = useRef<THREE.Points>(null);
  const glowMesh = useRef<THREE.Points>(null);

  const oceanGeo = useMemo(() => buf(particleData.ocean), [particleData.ocean]);
  const landGeo = useMemo(() => buf(particleData.land), [particleData.land]);
  const glowGeo = useMemo(() => buf(particleData.glow), [particleData.glow]);

  useEffect(() => {
    let raf: number;
    const clock = new THREE.Clock();
    function loop() {
      const t = clock.getElapsedTime();
      const delta = Math.min(clock.getDelta(), 0.1);

      if (mainRef.current) mainRef.current.rotation.y += delta * 0.45;

      oceanGrp.current?.scale.setScalar(1 + Math.sin(t*2)*0.08);
      landGrp.current?.scale.setScalar(1 + Math.sin(t*2.5)*0.06);
      glowGrp.current?.scale.setScalar(1 + Math.sin(t*1.5)*0.15);

      const om = oceanMesh.current?.material as THREE.PointsMaterial;
      const lm = landMesh.current?.material as THREE.PointsMaterial;
      const gm = glowMesh.current?.material as THREE.PointsMaterial;
      if (om) { om.opacity = 0.05 + (Math.sin(t*3)+1)*0.45; om.needsUpdate = true; }
      if (lm) { lm.opacity = 0.1 + (Math.sin(t*2.8)+1)*0.4; lm.needsUpdate = true; }
      if (gm) { gm.opacity = 0.04 + (Math.sin(t*1.8)+1)*0.25; gm.needsUpdate = true; }

      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const saved = globeCamera.restore();
    if (saved && controlsRef.current) requestAnimationFrame(() => {
      const c = controlsRef.current;
      if (c?.target) c.target.set(...saved.target);
      if (c?.object) { c.object.position.set(...saved.position); c.object.zoom = saved.zoom; c.update(); }
    });
  }, []);
  useEffect(() => () => { if (controlsRef.current) { const c=controlsRef.current; globeCamera.save({position:c.object?.position?.toArray()??[0,0.3,3.5],target:c.target?.toArray()??[0,0,0],zoom:c.object?.zoom??1}); } }, []);

  return (
    <>
      {STAR_LAYERS.map((cfg, i) => <Starfield key={i} config={cfg} />)}
      <NebulaGlow />
      <mesh>
        <sphereGeometry args={[1.55,64,64]} />
        <shaderMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending}
          uniforms={{ uColor:{value:new THREE.Color("#2a5a9a")} }}
          vertexShader="varying vec3 vN,vP;void main(){vec4 w=modelMatrix*vec4(position,1.);vP=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}"
          fragmentShader="varying vec3 vN,vP;uniform vec3 uColor;void main(){float f=1.-abs(dot(normalize(cameraPosition-vP),vN));f=pow(f,2.5);gl_FragColor=vec4(uColor,f*0.3);}"
        />
      </mesh>
      <ambientLight intensity={0.1} />
      <group ref={mainRef}>
        <group ref={oceanGrp}>
          <points ref={oceanMesh}>
            <bufferGeometry><bufferAttribute attach="attributes-position" array={oceanGeo} count={particleData.ocean.length} itemSize={3} /></bufferGeometry>
            <pointsMaterial color="#041830" size={0.009} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
          </points>
        </group>
        <group ref={landGrp}>
          <points ref={landMesh}>
            <bufferGeometry><bufferAttribute attach="attributes-position" array={landGeo} count={particleData.land.length} itemSize={3} /></bufferGeometry>
            <pointsMaterial color="#5ab0e8" size={0.014} transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} />
          </points>
        </group>
        <group ref={glowGrp}>
          <points ref={glowMesh}>
            <bufferGeometry><bufferAttribute attach="attributes-position" array={glowGeo} count={particleData.glow.length} itemSize={3} /></bufferGeometry>
            <pointsMaterial color="#3a6aaa" size={0.022} transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} />
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
  useEffect(() => { fetch("/globe-particles.json").then(r=>r.json()).then(j=>set({ocean:j.ocean||[],land:j.land||[],glow:j.glow||[]})).catch(()=>{}); }, []);
  if (!d) return null;
  return <GlobeScene {...props} particleData={d} />;
}

export default function ParticleGlobe({ onMovieClick }: { onMovieClick: (id: number) => void }) {
  const [active, setActive] = useState<CountryFilmData | null>(null);
  return (
    <div className="relative w-full h-[360px] md:h-[420px] lg:h-[440px] bg-gradient-to-b from-[#0a1628] to-bg rounded-card overflow-hidden">
      <Canvas camera={{ position:[0,0.3,3.5], fov:45, near:0.1, far:20 }} gl={{ antialias:true, alpha:true }} style={{ background:"transparent" }}>
        <Suspense fallback={null}><GlobeDataLoader onClickCountry={setActive} activeCountryCode={active?.countryCode??null} /></Suspense>
      </Canvas>
      {!active && <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none"><p className="text-white/40 text-xs">拖拽旋转 · 滚轮缩放 · 点击金色光点探索</p></div>}
      <CountryInfoPanel country={active} onClose={()=>setActive(null)} onMovieClick={onMovieClick} />
    </div>
  );
}
