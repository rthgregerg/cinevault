"use client";

import { useRef, useEffect, type ReactNode, type CSSProperties } from "react";

/**
 * 视差倾斜卡片 — 3D 透视倾斜效果
 * Unicorn Studio 风格：鼠标悬停时卡片朝鼠标方向微倾
 */
interface ParallaxTiltProps {
  children: ReactNode;
  className?: string;
  /** 倾斜强度 (0-30)，默认 8 */
  tiltAmount?: number;
  /** 光晕强度 (0-1)，默认 0.1 */
  glare?: number;
  style?: CSSProperties;
}

export default function ParallaxTilt({
  children,
  className = "",
  tiltAmount = 8,
  glare = 0.1,
  style,
}: ParallaxTiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const currentRef = useRef({ rx: 0, ry: 0 });
  const targetRef = useRef({ rx: 0, ry: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const percentX = (e.clientX - centerX) / (rect.width / 2);
    const percentY = (e.clientY - centerY) / (rect.height / 2);
    targetRef.current = {
      ry: percentX * tiltAmount,
      rx: -percentY * tiltAmount,
    };
  };

  const handleMouseLeave = () => {
    targetRef.current = { rx: 0, ry: 0 };
  };

  const animate = () => {
    const el = ref.current;
    if (!el) {
      rafRef.current = requestAnimationFrame(animate);
      return;
    }
    const cur = currentRef.current;
    const tgt = targetRef.current;
    cur.rx += (tgt.rx - cur.rx) * 0.1;
    cur.ry += (tgt.ry - cur.ry) * 0.1;

    el.style.transform = `perspective(600px) rotateX(${cur.rx}deg) rotateY(${cur.ry}deg)`;

    // 光晕跟随
    const glareLayer = el.querySelector("[data-glare]") as HTMLElement | null;
    if (glareLayer) {
      const gx = 50 + cur.ry * (50 / tiltAmount);
      const gy = 50 - cur.rx * (50 / tiltAmount);
      glareLayer.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,${glare}) 0%, transparent 60%)`;
    }

    rafRef.current = requestAnimationFrame(animate);
  };

  // 用 useEffect 管理动画生命周期
  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`relative transition-transform duration-75 ${className}`}
      style={{ transformStyle: "preserve-3d", ...style }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <div
        data-glare
        className="absolute inset-0 pointer-events-none rounded-inherit"
        aria-hidden="true"
        style={{ zIndex: 1, borderRadius: "inherit" }}
      />
    </div>
  );
}
