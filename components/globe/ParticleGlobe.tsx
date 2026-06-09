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

function buf(d: Vec3[]) { const p=new Float32Array(d.length*3); for(let i=0;i<d.length;i++){p[i*3]=d[i].x;p[i*3+1]=d[i].y;p[i*3+2]=d[i].z;} return p; }

function GlobeScene({ onClickCountry, activeCountryCode, particleData }: {
  onClickCountry: (c: CountryFilmData) => void; activeCountryCode: string | null; particleData: ParticleData;
}) {
  const mainRef = useRef<THREE.Group>(null);
  const oceanGrp = useRef<THREE.Group>(null);
  const landGrp = useRef<THREE.Group>(null);
  const glowGrp = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);

  const oceanGeo = useMemo(() => buf(particleData.ocean), [particleData.ocean]);
  const landGeo = useMemo(() => buf(particleData.land), [particleData.land]);
  const glowGeo = useMemo(() => buf(particleData.glow), [particleData.glow]);

  const oceanMat = useMemo(() => new THREE.PointsMaterial({ color:"#082244",size:0.012,transparent:true,opacity:0.6,depthWrite:false,blending:THREE.AdditiveBlending}),[]);
  const landMat = useMemo(() => new THREE.PointsMaterial({ color:"#1e5aaa",size:0.011,transparent:true,opacity:0.8,depthWrite:false,blending:THREE.AdditiveBlending}),[]);
  const glowMat = useMemo(() => new THREE.PointsMaterial({ color:"#1a3a6a",size:0.018,transparent:true,opacity:0.15,depthWrite:false,blending:THREE.AdditiveBlending}),[]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    // 诊断：主球旋转加速到一眼可见
    if (mainRef.current) mainRef.current.rotation.y += delta * 0.5;

    // 海洋：极明显呼吸 + 频闪
    oceanGrp.current?.scale.setScalar(1 + Math.sin(t*2)*0.08);
    oceanMat.opacity = 0.05 + (Math.sin(t*3)+1)*0.45;

    // 大陆：极明显
    landGrp.current?.scale.setScalar(1 + Math.sin(t*2.5)*0.06);
    landMat.opacity = 0.1 + (Math.sin(t*2.8)+1)*0.4;

    // 微光：极明显
    glowGrp.current?.scale.setScalar(1 + Math.sin(t*1.5)*0.15);
    glowMat.opacity = 0.02 + (Math.sin(t*1.8)+1)*0.2;
  });

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
      <Starfield count={300} />
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
          <points>
            <bufferGeometry><bufferAttribute attach="attributes-position" array={oceanGeo} count={particleData.ocean.length} itemSize={3} /></bufferGeometry>
            <primitive object={oceanMat} attach="material" />
          </points>
        </group>
        <group ref={landGrp}>
          <points>
            <bufferGeometry><bufferAttribute attach="attributes-position" array={landGeo} count={particleData.land.length} itemSize={3} /></bufferGeometry>
            <primitive object={landMat} attach="material" />
          </points>
        </group>
        <group ref={glowGrp}>
          <points>
            <bufferGeometry><bufferAttribute attach="attributes-position" array={glowGeo} count={particleData.glow.length} itemSize={3} /></bufferGeometry>
            <primitive object={glowMat} attach="material" />
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
