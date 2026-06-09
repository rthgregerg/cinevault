"use client";
import { useMemo } from "react";
import * as THREE from "three";

// ===== 国家多边形数据 =====
const COUNTRY_BORDERS: Record<string, [number, number][]> = {
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
  RU: [[70,35],[70,50],[68,60],[64,70],[60,80],[55,85],[50,80],[45,75],[42,65],[44,55],[50,50],[55,45],[60,40],[65,35],[70,35]],
  AU: [[-12,130],[-20,120],[-30,116],[-35,128],[-30,140],[-22,150],[-15,146],[-12,140],[-12,130]],
  BR: [[5,-68],[-3,-60],[-10,-50],[-20,-42],[-25,-40],[-30,-50],[-33,-55],[-28,-58],[-20,-55],[-10,-65],[0,-70],[5,-68]],
  NZ: [[-34.5,173],[-40,176],[-45,170],[-46.5,168],[-44,168],[-38,173],[-34.5,173]],
  AR: [[-22,-65],[-25,-60],[-30,-58],[-40,-65],[-55,-68],[-50,-70],[-35,-60],[-22,-65]],
  TH: [[20,100],[18,104],[14,109],[10,106],[6,104],[8,100],[12,98],[16,98],[20,100]],
  EG: [[32,25],[30,32],[28,34],[24,36],[22,34],[22,30],[24,28],[28,26],[32,25]],
  ZA: [[-22,18],[-25,20],[-30,26],[-35,22],[-34,18],[-32,16],[-28,16],[-22,18]],
  MX: [[32,-117],[30,-115],[26,-110],[22,-105],[18,-98],[16,-93],[18,-88],[20,-97],[25,-103],[30,-112],[32,-117]],
  TR: [[42,26],[40,30],[38,36],[36,32],[36,28],[38,26],[42,26]],
  SE: [[69,20],[65,22],[60,18],[56,14],[58,12],[60,14],[63,18],[66,22],[69,20]],
  DK: [[57,8],[56,10],[55,12],[55,9],[56,7],[57,8]],
  PL: [[54,14],[53,18],[52,23],[50,24],[49,22],[50,18],[51,14],[54,14]],
  CA: [[72,-140],[68,-120],[60,-95],[55,-78],[50,-68],[48,-80],[50,-90],[55,-100],[60,-110],[65,-125],[72,-140]],
  NG: [[14,3],[10,4],[5,3],[5,8],[8,12],[13,13],[14,3]],
};

function latLonToVec3(lat: number, lon: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

function pointInPolygon(lat: number, lon: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [lati, loni] = polygon[i];
    const [latj, lonj] = polygon[j];
    if ((loni > lon) !== (lonj > lon) && lat < (latj - lati) * (lon - loni) / (lonj - loni) + lati) inside = !inside;
  }
  return inside;
}

// ===== 3D 球面边界线 =====

function BorderLine({ polygon }: { polygon: [number, number][] }) {
  const points = useMemo(() => {
    const r = 1.53;
    const pts = polygon.map(([lat, lon]) => latLonToVec3(lat, lon, r));
    pts.push(pts[0].clone());
    return pts;
  }, [polygon]);

  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setFromPoints(points);
    return geo;
  }, [points]);

  return (
    <primitive object={new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: "#ffd700", transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending }))} />
  );
}

// ===== 主组件 =====

interface CountryGlowLayerProps {
  countryCode: string | null;
}

export default function CountryGlowLayer({ countryCode }: CountryGlowLayerProps) {
  const polygon = countryCode ? COUNTRY_BORDERS[countryCode] : null;

  if (!polygon) return null;

  return (
    <group>
      <BorderLine polygon={polygon} />
      {/* 辉光外环：稍大的半透明线 */}
      <BorderLineGlow polygon={polygon} />
    </group>
  );
}

function BorderLineGlow({ polygon }: { polygon: [number, number][] }) {
  const r = 1.54;
  const geo = useMemo(() => {
    const pts = polygon.map(([lat, lon]) => latLonToVec3(lat, lon, r));
    const g = new THREE.BufferGeometry();
    g.setFromPoints(pts);
    return g;
  }, [polygon, r]);

  return (
    <primitive object={new THREE.Line(geo, new THREE.LineBasicMaterial({ color: "#f0d060", transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending }))} />
  );
}
