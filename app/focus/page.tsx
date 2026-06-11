"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// ==================== 名言数据 ====================
interface Quote {
  id: string; quoteZh: string; quoteEn: string;
  film: string; filmEn: string; year: number; tmdbId: number;
}

const quotes: Quote[] = [
  { id: "q1", quoteZh: "希望是美好的，也许是人间至善，而美好的事物永不消逝。", quoteEn: "Hope is a good thing, maybe the best of things, and no good thing ever dies.", film: "肖申克的救赎", filmEn: "The Shawshank Redemption", year: 1994, tmdbId: 278 },
  { id: "q2", quoteZh: "人生就像一盒巧克力，你永远不知道下一颗是什么味道。", quoteEn: "Life is like a box of chocolates. You never know what you're gonna get.", film: "阿甘正传", filmEn: "Forrest Gump", year: 1994, tmdbId: 13 },
  { id: "q3", quoteZh: "我们读诗写诗，并不是因为它们好玩，而是因为我们是人类的一分子。", quoteEn: "We don't read and write poetry because it's cute. We read and write poetry because we are members of the human race.", film: "死亡诗社", filmEn: "Dead Poets Society", year: 1989, tmdbId: 207 },
  { id: "q4", quoteZh: "每个人都会死，但不是每个人都真正活过。", quoteEn: "Every man dies. Not every man really lives.", film: "勇敢的心", filmEn: "Braveheart", year: 1995, tmdbId: 197 },
  { id: "q5", quoteZh: "如果你有梦想，就要去捍卫它。", quoteEn: "You got a dream, you gotta protect it.", film: "当幸福来敲门", filmEn: "The Pursuit of Happyness", year: 2006, tmdbId: 1402 },
  { id: "q6", quoteZh: "世界上只有一种真正的英雄主义，那就是在认清生活真相之后依然热爱生活。", quoteEn: "There is only one heroism in the world: to see the world as it is, and to love it.", film: "闻香识女人", filmEn: "Scent of a Woman", year: 1992, tmdbId: 9475 },
  { id: "q7", quoteZh: "我们一路奋战，不是为了改变世界，而是为了不让世界改变我们。", quoteEn: "We fight not to change the world, but to keep the world from changing us.", film: "熔炉", filmEn: "Silenced", year: 2011, tmdbId: 91070 },
  { id: "q8", quoteZh: "活着本身就是一种胜利。", quoteEn: "To live is itself a victory.", film: "活着", filmEn: "To Live", year: 1994, tmdbId: 11104 },
  { id: "q9", quoteZh: "这世界很糟，但是你会爱上它的。", quoteEn: "The world is a bad place, but you're going to love it.", film: "海上钢琴师", filmEn: "The Legend of 1900", year: 1998, tmdbId: 10376 },
  { id: "q10", quoteZh: "我不知道将去何方，但我已在路上。", quoteEn: "I don't know where I'm going, but I'm on my way.", film: "千与千寻", filmEn: "Spirited Away", year: 2001, tmdbId: 129 },
  { id: "q11", quoteZh: "回忆之所以美好，是因为我们都回不去了。", quoteEn: "Memory is so beautiful because we can never go back.", film: "一代宗师", filmEn: "The Grandmaster", year: 2013, tmdbId: 44865 },
  { id: "q12", quoteZh: "时间可以伸缩和折叠，唯独不能倒退。", quoteEn: "Time can stretch and fold, but it can never go backwards.", film: "星际穿越", filmEn: "Interstellar", year: 2014, tmdbId: 157336 },
  { id: "q13", quoteZh: "爱是我们唯一能够感知的，超越时空维度的事物。", quoteEn: "Love is the one thing we're capable of perceiving that transcends dimensions of time and space.", film: "星际穿越", filmEn: "Interstellar", year: 2014, tmdbId: 157336 },
  { id: "q14", quoteZh: "所有大人都曾经是小孩，虽然只有少数人记得。", quoteEn: "All grown-ups were once children, although few of them remember it.", film: "小王子", filmEn: "The Little Prince", year: 2015, tmdbId: 309809 },
  { id: "q15", quoteZh: "一件事无论太晚，或者对于我来说太早，都不会阻拦你成为你想成为的那个人。", quoteEn: "For what it's worth, it's never too late to be whoever you want to be.", film: "本杰明·巴顿奇事", filmEn: "The Curious Case of Benjamin Button", year: 2008, tmdbId: 4922 },
  { id: "q16", quoteZh: "过去只是我们说给自己听的一个故事。", quoteEn: "The past is just a story we tell ourselves.", film: "她", filmEn: "Her", year: 2013, tmdbId: 152601 },
  { id: "q17", quoteZh: "真正的自由，不是你能做什么，而是你能不做什么。", quoteEn: "True freedom is not being able to do what you want, but being able to not do what you don't want.", film: "荒野生存", filmEn: "Into the Wild", year: 2007, tmdbId: 5915 },
  { id: "q18", quoteZh: "你得决定自己是什么。别人给你贴的标签不重要。", quoteEn: "You have to decide what you are. The labels other people give you don't matter.", film: "月光男孩", filmEn: "Moonlight", year: 2016, tmdbId: 376867 },
];

// ==================== 环境音 ====================
const SOUND_SCENES = [
  { id: "piano", label: "钢琴", emoji: "🎹", neteaseId: "5156234253" },
  { id: "rain", label: "雨声", emoji: "🌧", neteaseId: "4934514985" },
  { id: "ocean", label: "海浪", emoji: "🌊", neteaseId: "4993526879" },
  { id: "forest", label: "森林", emoji: "🌿", neteaseId: "4951122676" },
  { id: "cafe", label: "咖啡", emoji: "☕", neteaseId: "5086114461" },
];

// ==================== 大卫雕像 SVG ====================
function DavidSculpture({ mirror = false }: { mirror?: boolean }) {
  const scale = mirror ? "scale(-1, 1)" : "";
  return (
    <svg
      viewBox="0 0 160 400"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMax meet"
      style={{ transform: scale, display: "block" }}
    >
      <defs>
        <linearGradient id={`marble-${mirror ? "r" : "l"}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e8e0d5" />
          <stop offset="25%" stopColor="#f2ede6" />
          <stop offset="50%" stopColor="#faf7f2" />
          <stop offset="75%" stopColor="#f0ebe4" />
          <stop offset="100%" stopColor="#ddd5c8" />
        </linearGradient>
        <linearGradient id={`shadow-${mirror ? "r" : "l"}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0.05)" />
          <stop offset="50%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.08)" />
        </linearGradient>
        <filter id="marble-texture">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
          <feBlend in="SourceGraphic" in2="grayNoise" mode="overlay" result="textured" />
        </filter>
      </defs>

      {/* 基座 */}
      <rect x="20" y="380" width="120" height="20" rx="3" fill={`url(#marble-${mirror ? "r" : "l"})`} opacity="0.6" />
      <rect x="30" y="372" width="100" height="10" rx="2" fill={`url(#marble-${mirror ? "r" : "l"})`} opacity="0.7" />
      <rect x="40" y="366" width="80" height="7" rx="1.5" fill={`url(#marble-${mirror ? "r" : "l"})`} opacity="0.75" />

      {/* 右脚（承重腿） */}
      <path d="M48 366 L48 280 Q48 270 55 268 L72 268 Q78 270 78 280 L78 366"
        fill={`url(#marble-${mirror ? "r" : "l"})`} opacity="0.85" />
      {/* 右小腿 */}
      <path d="M50 280 L52 235 Q54 228 60 226 L68 226 Q74 228 76 235 L76 280"
        fill={`url(#marble-${mirror ? "r" : "l"})`} opacity="0.88" />
      {/* 右大腿 */}
      <path d="M54 235 L56 185 Q58 176 66 174 L76 174 Q80 178 78 190 L74 235"
        fill={`url(#marble-${mirror ? "r" : "l"})`} opacity="0.9" />

      {/* 左脚（放松腿，微屈） */}
      <path d="M86 366 L86 295 Q88 288 94 286 L108 286 Q112 288 112 296 L112 366"
        fill={`url(#marble-${mirror ? "r" : "l"})`} opacity="0.82" />
      {/* 左小腿 */}
      <path d="M88 295 L90 250 Q92 244 98 242 L106 242 Q110 246 110 252 L110 295"
        fill={`url(#marble-${mirror ? "r" : "l"})`} opacity="0.85" />
      {/* 左大腿 */}
      <path d="M88 250 L86 200 Q88 192 96 190 L106 190 Q112 194 110 205 L108 250"
        fill={`url(#marble-${mirror ? "r" : "l"})`} opacity="0.87" />

      {/* 躯干 */}
      <path d="M48 190 Q30 155 28 110 L120 110 Q122 155 110 190 Q100 210 80 215 Q60 210 48 190 Z"
        fill={`url(#marble-${mirror ? "r" : "l"})`} opacity="0.92" />
      {/* 胸部轮廓 */}
      <path d="M50 130 Q74 118 98 130"
        fill="none" stroke="rgba(200,190,175,0.3)" strokeWidth="1" />
      <path d="M55 148 Q74 140 93 148"
        fill="none" stroke="rgba(200,190,175,0.2)" strokeWidth="0.8" />
      {/* 腹肌线 */}
      <path d="M60 165 Q74 160 88 165" fill="none" stroke="rgba(200,190,175,0.15)" strokeWidth="0.6" />
      <path d="M62 175 Q74 171 86 175" fill="none" stroke="rgba(200,190,175,0.12)" strokeWidth="0.6" />

      {/* 右臂（自然下垂，微屈） */}
      <path d="M48 120 Q28 150 26 190 Q24 210 30 218 Q36 215 38 205 Q40 185 44 170 Q50 145 52 130"
        fill={`url(#marble-${mirror ? "r" : "l"})`} opacity="0.85" />
      {/* 右手 */}
      <ellipse cx="32" cy="216" rx="6" ry="8" fill={`url(#marble-${mirror ? "r" : "l"})`} opacity="0.82" />

      {/* 左臂（弯曲，手搭在肩上 — 持弹弓的经典姿态） */}
      <path d="M100 115 Q125 110 130 95 Q132 88 128 84"
        fill="none" stroke={`url(#marble-${mirror ? "r" : "l"})`} strokeWidth="16" strokeLinecap="round" opacity="0.85" />
      {/* 左前臂 */}
      <path d="M128 84 Q120 75 110 72 Q100 70 95 72"
        fill="none" stroke={`url(#marble-${mirror ? "r" : "l"})`} strokeWidth="12" strokeLinecap="round" opacity="0.83" />
      {/* 左手 */}
      <ellipse cx="94" cy="74" rx="6" ry="5" fill={`url(#marble-${mirror ? "r" : "l"})`} opacity="0.8" />
      {/* 弹弓带（从左肩垂下） */}
      <path d="M95 78 Q90 120 85 170 Q82 200 80 215"
        fill="none" stroke="rgba(180,160,130,0.25)" strokeWidth="3" strokeDasharray="4,2" />

      {/* 颈部 */}
      <path d="M65 110 L65 95 Q68 88 74 86 Q80 88 83 95 L83 110"
        fill={`url(#marble-${mirror ? "r" : "l"})`} opacity="0.9" />

      {/* 头部 */}
      <ellipse cx="74" cy="65" rx="22" ry="28" fill={`url(#marble-${mirror ? "r" : "l"})`} opacity="0.93" />
      {/* 下颌轮廓 */}
      <path d="M56 65 Q60 80 74 82 Q88 80 92 65"
        fill="none" stroke="rgba(200,190,175,0.25)" strokeWidth="0.8" />

      {/* 五官 */}
      <circle cx="66" cy="60" r="2" fill="rgba(180,160,140,0.25)" />
      <circle cx="80" cy="60" r="2" fill="rgba(180,160,140,0.25)" />
      <path d="M70 70 Q74 74 78 70" fill="none" stroke="rgba(180,160,140,0.2)" strokeWidth="0.7" />

      {/* 卷发 — David 的标志性卷发 */}
      {[
        { cx: 56, cy: 48, r: 8 },
        { cx: 62, cy: 38, r: 9 },
        { cx: 70, cy: 34, r: 9 },
        { cx: 78, cy: 35, r: 8 },
        { cx: 85, cy: 40, r: 7 },
        { cx: 90, cy: 48, r: 6 },
        { cx: 54, cy: 58, r: 6 },
        { cx: 92, cy: 56, r: 5 },
        { cx: 60, cy: 43, r: 6 },
        { cx: 86, cy: 44, r: 5 },
      ].map((c, i) => (
        <circle key={i} cx={c.cx} cy={c.cy} r={c.r}
          fill={`url(#marble-${mirror ? "r" : "l"})`} opacity={0.7 + Math.random() * 0.2} />
      ))}

      {/* 全身微妙阴影 */}
      <rect x="0" y="0" width="160" height="400" fill={`url(#shadow-${mirror ? "r" : "l"})`} opacity="0.3" />
    </svg>
  );
}

// ==================== 进度指示 ====================
function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-3">
      {Array.from({ length: Math.min(total, 18) }).map((_, i) => (
        <div
          key={i}
          className="transition-all duration-1000 rounded-full"
          style={{
            width: i === current ? "4px" : "3px",
            height: i === current ? "4px" : "3px",
            background: i === current ? "#c8a951" : "#d0c8b8",
            transform: i === current ? "scale(1.3)" : "scale(1)",
          }}
        />
      ))}
    </div>
  );
}

// ==================== 主页面 ====================
export default function FocusPage() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [soundScene, setSoundScene] = useState(SOUND_SCENES[0]);
  const [showSoundMenu, setShowSoundMenu] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const quote = quotes[current];

  const goTo = useCallback((index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setIsTransitioning(false);
    }, 800);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % quotes.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + quotes.length) % quotes.length);
  }, [current, goTo]);

  // 自动轮播
  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(next, 10000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [next, isPaused]);

  const pauseTemporarily = () => {
    setIsPaused(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsPaused(false), 8000);
  };

  return (
    <div className="fixed inset-0 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #faf8f5 0%, #f3efe8 35%, #e8e2d8 100%)",
        fontFamily: '"Noto Serif SC", Georgia, "Songti SC", serif',
      }}
    >
      {/* ========== 背景装饰 ========== */}
      {/* 顶光 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: "min(600px, 80vw)", height: "min(300px, 40vh)",
          background: "radial-gradient(ellipse, rgba(210,180,130,0.08) 0%, transparent 60%)",
        }}
      />
      {/* 水平金线 */}
      <div className="absolute top-14 left-4 right-4 md:left-[10%] md:right-[10%]"
        style={{ height: "0.5px", background: "linear-gradient(to right, transparent, rgba(180,150,100,0.3), rgba(180,150,100,0.3), transparent)" }}
      />
      <div className="absolute bottom-20 md:bottom-16 left-4 right-4 md:left-[12%] md:right-[12%]"
        style={{ height: "0.5px", background: "linear-gradient(to right, transparent, rgba(180,150,100,0.12), transparent)" }}
      />

      {/* ========== 返回按钮 ========== */}
      <Link
        href="/"
        className="fixed top-5 left-5 md:top-7 md:left-8 z-50 flex items-center gap-2 group"
        style={{ color: "#b0a090" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span className="text-[10px] tracking-[0.2em] hidden sm:inline group-hover:opacity-70 transition-opacity">返回</span>
      </Link>

      {/* ========== 桌面端：左右大卫雕像 ========== */}
      {/* 左雕塑 */}
      <div className="hidden lg:block fixed left-0 bottom-0 z-10 pointer-events-none"
        style={{ width: "min(160px, 12vw)", height: "min(520px, 75vh)", bottom: "40px", left: "max(20px, 3vw)" }}>
        <DavidSculpture />
      </div>
      {/* 右雕塑（镜像） */}
      <div className="hidden lg:block fixed right-0 bottom-0 z-10 pointer-events-none"
        style={{ width: "min(160px, 12vw)", height: "min(520px, 75vh)", bottom: "40px", right: "max(20px, 3vw)" }}>
        <DavidSculpture mirror />
      </div>

      {/* ========== 移动端：小型雕塑 ========== */}
      <div className="lg:hidden fixed left-1 bottom-0 z-10 pointer-events-none"
        style={{ width: "48px", height: "200px", bottom: "30px", left: "4px" }}>
        <DavidSculpture />
      </div>
      <div className="lg:hidden fixed right-1 bottom-0 z-10 pointer-events-none"
        style={{ width: "48px", height: "200px", bottom: "30px", right: "4px" }}>
        <DavidSculpture mirror />
      </div>

      {/* ========== 主内容区 ========== */}
      <main className="relative z-20 h-full flex flex-col items-center justify-center px-6 sm:px-10 md:px-16">
        {/* FOCUS 标头 */}
        <div className="text-center mb-3 md:mb-4">
          <span className="text-[8px] md:text-[10px] tracking-[0.4em] md:tracking-[0.5em] uppercase"
            style={{ color: "#b8a070" }}>
            Focus Mode
          </span>
          <div className="mx-auto mt-2 md:mt-3"
            style={{ width: "4px", height: "4px", background: "#c8a951", transform: "rotate(45deg)", opacity: 0.5 }}
          />
        </div>

        {/* 进度 */}
        <div className="mb-4 md:mb-6">
          <ProgressDots total={quotes.length} current={current} />
        </div>

        {/* 名言主体 */}
        <div
          className="relative max-w-md w-full transition-all duration-800"
          style={{
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? "translateY(12px)" : "translateY(0)",
            filter: isTransitioning ? "blur(2px)" : "blur(0)",
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            transitionDuration: "800ms",
          }}
        >
          {/* 金框卡片 */}
          <div className="relative text-center px-5 py-6 md:px-8 md:py-8"
            style={{
              background: "rgba(255,255,255,0.45)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(200,169,81,0.1)",
              borderTop: "2px solid rgba(200,169,81,0.22)",
              borderBottom: "2px solid rgba(200,169,81,0.22)",
              boxShadow: "0 4px 24px rgba(30,20,10,0.03)",
            }}
          >
            {/* 上引号 */}
            <div className="text-3xl md:text-4xl leading-none mb-2 md:mb-3"
              style={{ color: "#c8a951", opacity: 0.4, fontFamily: "Georgia, serif" }}>
              &ldquo;
            </div>

            {/* 中文名言 */}
            <p className="text-[#3a2f30] leading-[2.1] md:leading-[2.2] mb-3 md:mb-4 tracking-wide"
              style={{ fontSize: "clamp(1rem, 2.2vw, 1.3rem)" }}>
              {quote.quoteZh}
            </p>

            {/* 英文 */}
            <p className="text-[#a09080] italic leading-relaxed mb-3 md:mb-4 text-xs md:text-sm font-light">
              "{quote.quoteEn}"
            </p>

            {/* 金色分隔 */}
            <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div style={{ width: "14px", height: "0.5px", background: "#c8a951", opacity: 0.3 }} />
              <div style={{ width: "3px", height: "3px", background: "#c8a951", transform: "rotate(45deg)", opacity: 0.5 }} />
              <div style={{ width: "14px", height: "0.5px", background: "#c8a951", opacity: 0.3 }} />
            </div>

            {/* 电影信息 */}
            <p className="text-[#8a7060] text-xs md:text-sm tracking-[0.2em] md:tracking-[0.25em] mb-1">
              《{quote.film}》
            </p>
            <p className="text-[#b0a090] text-[10px] md:text-xs tracking-[0.15em]">
              {quote.filmEn} · {quote.year}
            </p>
          </div>
        </div>

        {/* 导航按钮 */}
        <div className="flex items-center gap-8 md:gap-12 mt-6 md:mt-8">
          <button
            onClick={() => { pauseTemporarily(); prev(); }}
            className="p-2 transition-colors duration-300 hover:opacity-60"
            style={{ color: "#b0a090" }}
            aria-label="上一句"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => { pauseTemporarily(); next(); }}
            className="p-2 transition-colors duration-300 hover:opacity-60"
            style={{ color: "#b0a090" }}
            aria-label="下一句"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </main>

      {/* ========== 底部音乐控制 ========== */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pb-4 md:pb-6 safe-bottom">
        {/* 音景选择面板 */}
        {showSoundMenu && (
          <div className="flex justify-center gap-1 md:gap-2 mb-2 px-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {SOUND_SCENES.map((scene) => (
              <button
                key={scene.id}
                onClick={() => { setSoundScene(scene); setShowSoundMenu(false); pauseTemporarily(); }}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-[10px] transition-all duration-300"
                style={{
                  background: soundScene.id === scene.id ? "rgba(255,255,255,0.5)" : "transparent",
                  color: soundScene.id === scene.id ? "#8a7060" : "#b0a090",
                }}
              >
                <span className="text-base md:text-lg">{scene.emoji}</span>
                <span className="tracking-wide whitespace-nowrap">{scene.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* 当前音景 */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => { setShowSoundMenu(!showSoundMenu); pauseTemporarily(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs tracking-widest transition-all duration-300"
            style={{
              background: "rgba(255,255,255,0.35)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(200,169,81,0.06)",
              color: "#8a7060",
            }}
          >
            <span>{soundScene.emoji}</span>
            <span>{soundScene.label}</span>
          </button>
          <a
            href={`https://music.163.com/#/playlist?id=${soundScene.neteaseId}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={pauseTemporarily}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[10px] tracking-widest transition-all duration-300"
            style={{
              background: "rgba(255,255,255,0.25)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(200,169,81,0.04)",
              color: "#b0a090",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.6 17.6c-.2.4-.7.5-1.1.3-3-1.8-6.8-2.2-11.2-1.2-.4.1-.8-.2-.9-.6-.1-.4.2-.8.6-.9 4.8-1.1 8.9-.6 12.4 1.4.4.2.5.7.2 1zm1.5-3.4c-.3.5-.9.6-1.4.4-3.4-2.1-8.6-2.7-12.7-1.5-.5.1-1-.1-1.2-.6-.1-.5.1-1 .6-1.2 4.7-1.4 10.5-.7 14.5 1.8.5.3.7.8.2 1.1z"/>
            </svg>
            <span>网易云</span>
          </a>
        </div>
      </div>
    </div>
  );
}
