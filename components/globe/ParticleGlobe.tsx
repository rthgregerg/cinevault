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
  const groupRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<any>(null);
  const oceanMesh = useRef<THREE.Points>(null);
  const landMesh = useRef<THREE.Points>(null);
  const glowMesh = useRef<THREE.Points>(null);

  const oceanGeo = useMemo(() => makeGeo(particleData.ocean), [particleData.ocean]);
  const landGeo = useMemo(() => makeGeo(particleData.land), [particleData.land]);
  const glowGeo = useMemo(() => makeGeo(particleData.glow), [particleData.glow]);
  const oceanPhases = useMemo(() => makePhases(particleData.ocean.length), [particleData.ocean.length]);
  const landPhases = useMemo(() => makePhases(particleData.land.length), [particleData.land.length]);
  const glowPhases = useMemo(() => makePhases(particleData.glow.length), [particleData.glow.length]);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.1;

    animateLayer(oceanMesh.current, particleData.ocean, oceanPhases, t, 0.5, 0.1, 0.012, 1.5, "#082244");
    animateLayer(landMesh.current, particleData.land, landPhases, t, 0.65, 0.15, 0.01, 1.3, "#1e5aaa");
    animateLayer(glowMesh.current, particleData.glow, glowPhases, t, 0.12, 0.06, 0.04, 0.6, "#1a3a6a");
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
      <group ref={groupRef}>
        <points ref={oceanMesh}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" array={oceanGeo} count={particleData.ocean.length} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial color="#082244" size={0.012} transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
        <points ref={landMesh}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" array={landGeo} count={particleData.land.length} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial color="#1e5aaa" size={0.011} transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
        <points ref={glowMesh}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" array={glowGeo} count={particleData.glow.length} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial color="#1a3a6a" size={0.018} transparent opacity={0.15} depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
        <CountryHighlights onClickCountry={onClickCountry} isActive={activeCountryCode} />
        <CountryGlowLayer countryCode={activeCountryCode} />
      </group>
      <OrbitControls ref={controlsRef} enableZoom zoomSpeed={0.8} minDistance={2.5} maxDistance={5} rotateSpeed={0.5} autoRotate={false} enablePan={false} />
    </>
  );
}

// ===== 工具函数（模块级，不依赖 React）=====

function makeGeo(data: Vec3[]) {
  const p = new Float32Array(data.length * 3);
  for (let i = 0; i < data.length; i++) { p[i*3]=data[i].x; p[i*3+1]=data[i].y; p[i*3+2]=data[i].z; }
  return p;
}
function makePhases(n: number) {
  const ph = new Float32Array(n);
  for (let i = 0; i < n; i++) ph[i] = Math.random() * Math.PI * 2;
  return ph;
}
function animateLayer(
  mesh: THREE.Points | null, orig: Vec3[], phases: Float32Array,
  t: number, baseOp: number, rangeOp: number, amp: number, freq: number, color: string
) {
  if (!mesh) return;
  (mesh.material as THREE.PointsMaterial).opacity = baseOp + rangeOp * Math.sin(t * freq);
  const pos = mesh.geometry.getAttribute("position") as THREE.BufferAttribute;
  const arr = pos.array as Float32Array;
  for (let i = 0; i < orig.length; i++) {
    const wave = Math.sin(t * 0.7 + phases[i]) * amp;
    const d = orig[i];
    const len = Math.sqrt(d.x*d.x+d.y*d.y+d.z*d.z) || 1;
    arr[i*3] = d.x + (d.x/len)*wave;
    arr[i*3+1] = d.y + (d.y/len)*wave;
    arr[i*3+2] = d.z + (d.z/len)*wave;
  }
  pos.needsUpdate = true;
}

// ===== 数据加载 =====

function GlobeDataLoader(props: {
  onClickCountry: (c: CountryFilmData) => void;
  activeCountryCode: string | null;
}) {
  const [d, set] = useState<ParticleData | null>(null);
  useEffect(() => { fetch("/globe-particles.json").then(r => r.json()).then(j => set({ ocean: j.ocean||[], land: j.land||[], glow: j.glow||[] })).catch(()=>{}); }, []);
  if (!d) return null;
  return <GlobeScene {...props} particleData={d} />;
}

// ===== 主组件 =====

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
