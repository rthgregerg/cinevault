"use client";
import { useRef, useMemo, useState, useEffect, Suspense, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Starfield from "./Starfield";
import CountryHighlights from "./CountryHighlights";
import CountryInfoPanel from "./CountryInfoPanel";
import type { CountryFilmData } from "@/lib/types";

// ============ 粒子层 — 支持变形 ============

type Vec3 = { x: number; y: number; z: number };

function MorphingParticles({
  oceanData,
  landData,
  morphTarget,
  morphing,
}: {
  oceanData: Vec3[];
  landData: Vec3[];
  morphTarget: Vec3[] | null;
  morphing: boolean;
}) {
  const oceanRef = useRef<THREE.Points>(null);
  const landRef = useRef<THREE.Points>(null);
  const progress = useRef(0);
  const animDirection = useRef(0); // 0=idle, 1=morphing, -1=unmorphing

  const oceanGeo = useMemo(() => {
    const pos = new Float32Array(oceanData.length * 3);
    const col = new Float32Array(oceanData.length * 3);
    for (let i = 0; i < oceanData.length; i++) {
      pos[i * 3] = oceanData[i].x;
      pos[i * 3 + 1] = oceanData[i].y;
      pos[i * 3 + 2] = oceanData[i].z;
      col[i * 3] = 0.02;
      col[i * 3 + 1] = 0.06;
      col[i * 3 + 2] = 0.18;
    }
    return { pos, col };
  }, [oceanData]);

  const landGeo = useMemo(() => {
    const pos = new Float32Array(landData.length * 3);
    const col = new Float32Array(landData.length * 3);
    for (let i = 0; i < landData.length; i++) {
      pos[i * 3] = landData[i].x;
      pos[i * 3 + 1] = landData[i].y;
      pos[i * 3 + 2] = landData[i].z;
      const b = 0.6 + Math.random() * 0.4;
      col[i * 3] = 0.15 * b;
      col[i * 3 + 1] = 0.45 * b;
      col[i * 3 + 2] = 0.85 * b;
    }
    return { pos, col };
  }, [landData]);

  // 变形动画
  useFrame((_, delta) => {
    if (animDirection.current === 0) return;

    const speed = 1.5;
    if (animDirection.current === 1) {
      progress.current = Math.min(1, progress.current + delta * speed);
    } else {
      progress.current = Math.max(0, progress.current - delta * speed);
    }

    const t = easeInOutCubic(progress.current);

    // 更新海洋透明度（变形时淡出）
    if (oceanRef.current) {
      const mat = oceanRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.7 * (1 - t);
    }

    // 更新大陆粒子位置（变形到目标形状）
    if (landRef.current && morphTarget) {
      const posAttr = landRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;

      for (let i = 0; i < Math.min(landData.length, morphTarget.length); i++) {
        const src = landData[i];
        const dst = morphTarget[i % morphTarget.length];
        arr[i * 3] = src.x + (dst.x - src.x) * t;
        arr[i * 3 + 1] = src.y + (dst.y - src.y) * t;
        arr[i * 3 + 2] = src.z + (dst.z - src.z) * t;
      }
      posAttr.needsUpdate = true;

      // 颜色渐变到金色
      const colAttr = landRef.current.geometry.getAttribute("color") as THREE.BufferAttribute;
      if (colAttr) {
        const carr = colAttr.array as Float32Array;
        for (let i = 0; i < landData.length; i++) {
          carr[i * 3] = 0.15 + 0.55 * t;
          carr[i * 3 + 1] = 0.45 + 0.2 * t;
          carr[i * 3 + 2] = 0.85 - 0.6 * t;
        }
        colAttr.needsUpdate = true;
      }
    }

    if (progress.current >= 1 || progress.current <= 0) {
      animDirection.current = 0;
    }
  });

  // 暴露 morph 方法
  useEffect(() => {
    if (morphing) {
      animDirection.current = 1;
    } else {
      animDirection.current = -1;
    }
  }, [morphing]);

  return (
    <>
      <points ref={oceanRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={oceanGeo.pos} count={oceanData.length} itemSize={3} />
          <bufferAttribute attach="attributes-color" array={oceanGeo.col} count={oceanData.length} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.008} vertexColors transparent opacity={0.7} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      <points ref={landRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={landGeo.pos} count={landData.length} itemSize={3} />
          <bufferAttribute attach="attributes-color" array={landGeo.col} count={landData.length} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.014} vertexColors transparent opacity={0.9} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </>
  );
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ============ 大气光晕 ============

function AtmosphereGlow() {
  return (
    <mesh>
      <sphereGeometry args={[1.55, 64, 64]} />
      <shaderMaterial
        transparent depthWrite={false} blending={THREE.AdditiveBlending}
        uniforms={{ uColor: { value: new THREE.Color("#0a2a4a") } }}
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
            gl_FragColor = vec4(uColor, f * 0.15);
          }
        `}
      />
    </mesh>
  );
}

// ============ 场景 ============

type ParticleData = { ocean: Vec3[]; land: Vec3[] };

function GlobeScene({
  onClickCountry,
  activeCountry,
  particleData,
  morphTarget,
  morphing,
}: {
  onClickCountry: (c: CountryFilmData) => void;
  activeCountry: string | null;
  particleData: ParticleData;
  morphTarget: Vec3[] | null;
  morphing: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current && !morphing) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <>
      <Starfield count={300} />
      <AtmosphereGlow />
      <ambientLight intensity={0.1} />
      <group ref={groupRef}>
        <MorphingParticles
          oceanData={particleData.ocean}
          landData={particleData.land}
          morphTarget={morphTarget}
          morphing={morphing}
        />
        <CountryHighlights onClickCountry={onClickCountry} isActive={activeCountry} />
      </group>
      <OrbitControls
        enableZoom={true} zoomSpeed={0.8} minDistance={2.5} maxDistance={5}
        rotateSpeed={0.5} autoRotate={false} enablePan={false}
      />
    </>
  );
}

// ============ 数据加载 ============

function GlobeDataLoader(props: {
  onClickCountry: (c: CountryFilmData) => void;
  activeCountry: string | null;
  morphTarget: Vec3[] | null;
  morphing: boolean;
}) {
  const [data, setData] = useState<ParticleData | null>(null);

  useEffect(() => {
    fetch("/globe-particles.json")
      .then((res) => res.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;
  return <GlobeScene {...props} particleData={data} />;
}

// ============ 主组件 ============

interface ParticleGlobeProps {
  onMovieClick: (movieId: number) => void;
}

// 国家多边形数据 — 用于生成变形的目标形状
const COUNTRY_POLYGONS: Record<string, [number, number][]> = {
  US: [[72,-168],[70,-142],[72,-125],[68,-85],[60,-65],[47,-53],[38,-76],[28,-83],[16,-89],[8,-78],[20,-97],[30,-112],[34,-120],[44,-124],[55,-132],[64,-148],[72,-168]],
  FR: [[51,2],[48,-5],[43,-3],[36,-5],[37,0],[38,5],[36,10],[37,14],[41,26],[43,34],[45,40],[47,38],[50,40],[53,42],[55,45],[51,2]],
  JP: [[45.5,142],[40,141],[34,137],[31,131],[31.5,130],[35,133],[38,138],[41,140],[45.5,142]],
  KR: [[38.5,126],[35,127],[34.5,128.5],[37,129.5],[39,128.5],[38.5,126]],
  GB: [[58.5,-6.5],[57,-3],[54,-1.5],[51,0],[50,-4],[52.5,-5.5],[57,-7],[58.5,-6.5]],
  IT: [[46,8],[44,8],[42,12],[40,14],[38,15],[37,15],[38,17],[40,18],[42,16],[44,14],[46,12],[46,8]],
  DE: [[55,6],[54,10],[52,14],[50,13],[48,10],[47,7],[48,6],[50,6],[52,7],[54,6],[55,6]],
  IN: [[35,72],[28,68],[22,72],[10,78],[7,80],[10,84],[20,90],[25,85],[30,74],[35,72]],
  CN: [[53,123],[48,127],[42,120],[35,119],[30,122],[25,118],[22,108],[22,100],[24,98],[28,98],[35,105],[40,108],[45,115],[50,120],[53,123]],
  HK: [[22.5,114],[22.3,114.3],[22.2,114.3],[22.1,114.1],[22.3,113.9],[22.5,114]],
  TW: [[25.3,121.5],[24,120.5],[22,120.5],[22.5,121.5],[24.5,122],[25.3,121.5]],
  IR: [[39,45],[37,48],[35,50],[32,48],[30,52],[32,54],[35,56],[38,56],[39,50],[39,45]],
  ES: [[43.5,-8],[42,-7],[40,-5],[37,-4],[36,-6],[37,-7],[39,-8],[41,-9],[43,-8],[43.5,-8]],
  SE: [[69,20],[65,22],[60,18],[56,14],[58,12],[60,14],[63,18],[66,22],[69,20]],
  RU: [[70,35],[70,50],[68,60],[64,70],[60,80],[55,85],[50,80],[45,75],[42,65],[44,55],[50,50],[55,45],[60,40],[65,35],[70,35]],
  DK: [[57,8],[56,10],[55,12],[55,9],[56,7],[57,8]],
  MX: [[32,-117],[30,-115],[26,-110],[22,-105],[18,-98],[16,-93],[18,-88],[20,-97],[25,-103],[30,-112],[32,-117]],
  PL: [[54,14],[53,18],[52,23],[50,24],[49,22],[50,18],[51,14],[54,14]],
  AU: [[-12,130],[-20,120],[-30,116],[-35,128],[-30,140],[-22,150],[-15,146],[-12,140],[-12,130]],
  BR: [[5,-68],[-3,-60],[-10,-50],[-20,-42],[-25,-40],[-30,-50],[-33,-55],[-28,-58],[-20,-55],[-10,-65],[0,-70],[5,-68]],
  NZ: [[-34.5,173],[-40,176],[-45,170],[-46.5,168],[-44,168],[-38,173],[-34.5,173]],
  AR: [[-22,-65],[-25,-60],[-30,-58],[-40,-65],[-55,-68],[-50,-70],[-35,-60],[-22,-65]],
  TH: [[20,100],[18,104],[14,109],[10,106],[6,104],[8,100],[12,98],[16,98],[20,100]],
  EG: [[32,25],[30,32],[28,34],[24,36],[22,34],[22,30],[24,28],[28,26],[32,25]],
  ZA: [[-22,18],[-25,20],[-30,26],[-35,22],[-34,18],[-32,16],[-28,16],[-22,18]],
  NG: [[14,3],[10,4],[5,3],[5,8],[8,12],[13,13],[14,3]],
  TR: [[42,26],[40,30],[38,36],[36,32],[36,28],[38,26],[42,26]],
  CA: [[72,-140],[68,-120],[60,-95],[55,-78],[50,-68],[48,-80],[50,-90],[55,-100],[60,-110],[65,-125],[72,-140]],
};

function latLonToVec3(lat: number, lon: number, scale: number): Vec3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const r = 2.0 * scale;
  return {
    x: -r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.cos(phi) * 0.5,
    z: r * Math.sin(phi) * Math.sin(theta) * 0.3,
  };
}

function pointInPolygon(lat: number, lon: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [lati, loni] = polygon[i];
    const [latj, lonj] = polygon[j];
    if ((loni > lon) !== (lonj > lon) &&
        lat < (latj - lati) * (lon - loni) / (lonj - loni) + lati) {
      inside = !inside;
    }
  }
  return inside;
}

function generateCountryShape(countryCode: string): Vec3[] {
  const polygon = COUNTRY_POLYGONS[countryCode];
  if (!polygon) return [];

  // 找到多边形的包围盒
  let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
  for (const [lat, lon] of polygon) {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
  }

  const points: Vec3[] = [];
  const targetCount = 2000;
  const latRange = maxLat - minLat;
  const lonRange = maxLon - minLon;
  const areaScale = Math.sqrt(latRange * lonRange);

  let attempts = 0;
  while (points.length < targetCount && attempts < targetCount * 10) {
    const lat = minLat + Math.random() * latRange;
    const lon = minLon + Math.random() * lonRange;
    if (pointInPolygon(lat, lon, polygon)) {
      const scale = 0.9 + Math.random() * 0.1;
      const pos = latLonToVec3(lat, lon, scale * 0.8);
      // 追加少量 Z 偏移让形状有厚度
      pos.z += (Math.random() - 0.5) * 0.15;
      points.push(pos);
    }
    attempts++;
  }

  return points;
}

export default function ParticleGlobe({ onMovieClick }: ParticleGlobeProps) {
  const [activeCountry, setActiveCountry] = useState<CountryFilmData | null>(null);
  const [morphTarget, setMorphTarget] = useState<Vec3[] | null>(null);
  const [morphing, setMorphing] = useState(false);

  const handleClickCountry = useCallback((country: CountryFilmData) => {
    if (activeCountry?.countryCode === country.countryCode) {
      // 取消选中
      setMorphing(false);
      setTimeout(() => {
        setMorphTarget(null);
        setActiveCountry(null);
      }, 600);
    } else {
      // 选中新国家
      setActiveCountry(country);
      const shape = generateCountryShape(country.countryCode);
      setMorphTarget(shape);
      setTimeout(() => setMorphing(true), 100);
    }
  }, [activeCountry]);

  const handleClose = useCallback(() => {
    setMorphing(false);
    setTimeout(() => {
      setMorphTarget(null);
      setActiveCountry(null);
    }, 600);
  }, []);

  const isPanelOpen = activeCountry !== null;

  return (
    <div className="relative w-full h-[360px] md:h-[420px] lg:h-[440px] bg-gradient-to-b from-[#0a1628] to-bg rounded-card overflow-hidden">
      <Canvas
        camera={{ position: [0, 0.3, 3.5], fov: 45, near: 0.1, far: 20 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <GlobeDataLoader
            onClickCountry={handleClickCountry}
            activeCountry={activeCountry?.countryCode ?? null}
            morphTarget={morphTarget}
            morphing={morphing}
          />
        </Suspense>
      </Canvas>

      {/* 底部提示 */}
      {!isPanelOpen && (
        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
          <p className="text-white/40 text-xs">拖拽旋转 · 滚轮缩放 · 点击金色光点探索</p>
        </div>
      )}

      {/* 侧边信息面板 */}
      <CountryInfoPanel
        country={activeCountry}
        onClose={handleClose}
        onMovieClick={onMovieClick}
      />
    </div>
  );
}
