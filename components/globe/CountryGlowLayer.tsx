"use client";
import { useMemo } from "react";
import * as THREE from "three";
import { COUNTRY_BORDERS } from "@/data/country-borders";

function latLonToVec3(lat: number, lon: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

function BorderLine({ polygon }: { polygon: [number, number][] }) {
  const geo = useMemo(() => {
    const r = 1.53;
    const pts = polygon.map(([lat, lon]) => latLonToVec3(lat, lon, r));
    pts.push(pts[0].clone());
    const g = new THREE.BufferGeometry();
    g.setFromPoints(pts);
    return g;
  }, [polygon]);

  return (
    <primitive object={new THREE.Line(geo, new THREE.LineBasicMaterial({ color: "#ffd700", transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending }))} />
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

interface CountryGlowLayerProps {
  countryCode: string | null;
}

export default function CountryGlowLayer({ countryCode }: CountryGlowLayerProps) {
  const polygon = countryCode ? COUNTRY_BORDERS[countryCode] : null;

  if (!polygon) return null;

  return (
    <group>
      <BorderLine polygon={polygon} />
      <BorderLineGlow polygon={polygon} />
    </group>
  );
}
