"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/components/layout/ThemeProvider";
import Starfield from "@/components/focus/Starfield";
import SideDecor from "@/components/focus/SideDecor";
import FocusTimer from "@/components/focus/FocusTimer";
import QuoteCarousel from "@/components/focus/QuoteCarousel";
import NeteasePlayer from "@/components/focus/NeteasePlayer";

export default function FocusPage() {
  const { theme } = useTheme();
  const [timerRunning, setTimerRunning] = useState(false);

  return (
    <div
      className="fixed inset-0 overflow-hidden flex flex-col transition-all duration-700"
      style={{
        background: "var(--theme-bg)",
        fontFamily: theme === "nouvelle"
          ? "'Courier New', monospace"
          : "'Noto Serif SC', Georgia, serif",
      }}
    >
      {/* ===== 3D 粒子星空背景 ===== */}
      <Starfield />

      {/* ===== 背景顶光 ===== */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: "min(600px, 80vw)",
          height: "min(250px, 35vh)",
          background: `radial-gradient(ellipse, var(--theme-accent-light) 0%, transparent 60%)`,
        }}
      />

      {/* ===== 主题侧边装饰 ===== */}
      <SideDecor side="left" />
      <SideDecor side="right" />

      {/* ===== 返回 ===== */}
      <Link
        href="/"
        className="fixed top-5 left-5 md:top-7 md:left-8 z-50 flex items-center gap-2"
        style={{ color: "var(--theme-text-secondary)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span className="text-[10px] tracking-[0.2em] hidden sm:inline">返回</span>
      </Link>

      {/* ===== 主布局 ===== */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 gap-4 md:gap-6">
        {/* 标题 */}
        <div className="text-center">
          <span className="text-[9px] tracking-[0.4em] uppercase" style={{ color: "var(--theme-text-secondary)" }}>
            Focus Mode
          </span>
        </div>

        {/* 计时器 */}
        <FocusTimer
          isRunning={timerRunning}
          onToggle={() => setTimerRunning(!timerRunning)}
          onComplete={() => setTimerRunning(false)}
        />

        {/* 名言轮播 */}
        <QuoteCarousel timerRunning={timerRunning} />
      </div>

      {/* ===== 底部音乐 ===== */}
      <div className="relative z-10 pb-4 md:pb-6 safe-bottom">
        <NeteasePlayer />
      </div>
    </div>
  );
}
