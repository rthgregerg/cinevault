"use client";
import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import countries from "@/data/film-countries.json";

interface Props {
  onClickCountry: (country: (typeof countries)[0]) => void;
  isActive: string | null;
}

/** 经纬度 → 3D 坐标 */
function latLonToVec3(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

export default function CountryHighlights({ onClickCountry, isActive }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const points = useMemo(() => {
    return countries.map((c) => ({
      ...c,
      pos: latLonToVec3(c.lat, c.lng, 1.52), // 稍大于球体半径
    }));
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // 更新每个光点子元素的scale
    groupRef.current.children.forEach((child, i) => {
      if (child instanceof THREE.Mesh) {
        const intensity = points[i]?.lightIntensity || 1;
        const base = 0.6 + intensity * 0.1;
        const pulse = Math.sin(t * 2 + i * 1.5) * 0.2;
        child.scale.setScalar(base + pulse);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {points.map((p, i) => {
        const isHovered = hovered === p.countryCode;
        const active = isActive === p.countryCode;
        const size = 0.018 + p.lightIntensity * 0.01;
        const highlight = isHovered || active;

        return (
          <mesh
            key={p.countryCode}
            position={p.pos}
            scale={1}
            onClick={(e: any) => {
              e.stopPropagation();
              onClickCountry(p);
            }}
            onPointerOver={(e: any) => {
              e.stopPropagation();
              setHovered(p.countryCode);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              setHovered(null);
              document.body.style.cursor = "default";
            }}
          >
            {/* 光球核心 */}
            <sphereGeometry args={[size, 16, 16]} />
            <meshBasicMaterial
              color={highlight ? "#ffd700" : "#c8a951"}
              transparent
              opacity={highlight ? 1 : 0.8}
            />

            {/* 光环 */}
            {highlight && (
              <mesh>
                <ringGeometry args={[size * 1.5, size * 2.5, 32]} />
                <meshBasicMaterial
                  color="#c8a951"
                  transparent
                  opacity={0.4}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            {/* 脉冲环 */}
            {active && (
              <mesh>
                <ringGeometry args={[size * 2, size * 3.5, 32]} />
                <meshBasicMaterial
                  color="#f0d060"
                  transparent
                  opacity={0.2}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
          </mesh>
        );
      })}
    </group>
  );
}

export { countries };
