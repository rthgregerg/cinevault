"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/components/layout/ThemeProvider";
import SideDecor from "@/components/focus/SideDecor";
import QuoteCarousel from "@/components/focus/QuoteCarousel";
import FocusTimer from "@/components/focus/FocusTimer";

// ==================== 网易云 iframe 播放器 ====================
const NETEASE_SCENES = [
  { id: "jazz", label: "爵士", emoji: "🎷", songId: "431096211" },
  { id: "piano", label: "钢琴", emoji: "🎹", songId: "5253888" },
  { id: "rain", label: "雨声", emoji: "🌧", songId: "1456890009" },
  { id: "ocean", label: "海浪", emoji: "🌊", songId: "523368028" },
  { id: "forest", label: "森林", emoji: "🌿", songId: "523365555" },
];

// ==================== 网易云内嵌播放器 ====================
function NeteaseEmbed() {
  const [scene, setScene] = useState(NETEASE_SCENES[0]);
  const [showMenu, setShowMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = (s: typeof NETEASE_SCENES[0]) => {
    setScene(s);
    setIsPlaying(true);
    setShowMenu(false);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 隐藏 iframe — 网易云网页外链播放器 */}
      {isPlaying && (
        <iframe
          frameBorder="no"
          marginWidth={0}
          marginHeight={0}
          width={0}
          height={0}
          src={`https://music.163.com/outchain/player?type=2&id=${scene.songId}&auto=1&height=0`}
          className="hidden"
          allow="autoplay"
        />
      )}

      {/* 音景选择 */}
      {showMenu && !isPlaying && (
        <div className="flex flex-wrap justify-center gap-1 px-4 mb-1 animate-in fade-in duration-200">
          {NETEASE_SCENES.map((s) => (
            <button
              key={s.id}
              onClick={() => handlePlay(s)}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-[10px] transition-all"
              style={{
                background: scene.id === s.id ? "var(--theme-accent-light)" : "transparent",
                color: "var(--theme-text-secondary)",
              }}
            >
              <span className="text-base">{s.emoji}</span>
              <span className="tracking-widest">{s.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* 控制按钮 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (isPlaying) {
              setIsPlaying(false);
            } else {
              setShowMenu(!showMenu);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs tracking-widest transition-all"
          style={{
            background: "var(--theme-card)",
            border: "1px solid var(--theme-border)",
            color: isPlaying ? "var(--theme-accent)" : "var(--theme-text-secondary)",
          }}
        >
          <span>{isPlaying ? "🎵" : scene.emoji}</span>
          <span>{isPlaying ? "播放中" : scene.label}</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {isPlaying && (
          <button
            onClick={() => setIsPlaying(false)}
            className="text-[10px] tracking-widest px-3 py-2 rounded-full transition-all"
            style={{ color: "var(--theme-text-secondary)", background: "var(--theme-accent-light)" }}
          >
            停止
          </button>
        )}
      </div>
    </div>
  );
}

// ==================== 主页面 ====================
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
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 gap-4 md:gap-6">

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
      <div className="pb-4 md:pb-6 safe-bottom">
        <NeteaseEmbed />
      </div>
    </div>
  );
}
