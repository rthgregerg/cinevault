"use client";

import { useEffect, useRef } from "react";

/**
 * 光标光晕 — 鼠标路径跟随效果
 * Unicorn Studio 风格：柔和光斑跟随鼠标，带惯性延迟
 */
export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -200, y: -200 });
  const targetRef = useRef({ x: -200, y: -200 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    const onMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      const pos = posRef.current;
      const target = targetRef.current;

      // 惯性跟随
      pos.x += (target.x - pos.x) * 0.08;
      pos.y += (target.y - pos.y) * 0.08;

      glow.style.transform = `translate(${pos.x - 200}px, ${pos.y - 200}px)`;
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="fixed pointer-events-none z-[9999]"
      style={{
        width: "400px",
        height: "400px",
        left: 0,
        top: 0,
        background:
          "radial-gradient(circle, rgba(200,169,81,0.04) 0%, rgba(200,169,81,0.01) 30%, transparent 60%)",
        willChange: "transform",
      }}
      aria-hidden="true"
    />
  );
}
