"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "@/components/layout/ThemeProvider";
import SideDecor from "@/components/focus/SideDecor";

// ==================== 名言 + TMDB ID ====================
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

// ==================== 计时器预设 ====================
const TIMER_PRESETS = [
  { label: "25分钟", minutes: 25 },
  { label: "45分钟", minutes: 45 },
  { label: "60分钟", minutes: 60 },
];

// ==================== 网易云 iframe 播放器 ====================
const NETEASE_SCENES = [
  { id: "jazz", label: "爵士", emoji: "🎷", songId: "431096211" },
  { id: "piano", label: "钢琴", emoji: "🎹", songId: "5253888" },
  { id: "rain", label: "雨声", emoji: "🌧", songId: "1456890009" },
  { id: "ocean", label: "海浪", emoji: "🌊", songId: "523368028" },
  { id: "forest", label: "森林", emoji: "🌿", songId: "523365555" },
];

// ==================== 进度条 ====================
function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: Math.min(total, 18) }).map((_, i) => (
        <div
          key={i}
          className="transition-all duration-1000 rounded-full"
          style={{
            width: i === current ? "5px" : "3px",
            height: i === current ? "5px" : "3px",
            background: i === current ? "var(--theme-accent)" : "var(--theme-border)",
            transform: i === current ? "scale(1.4)" : "scale(1)",
          }}
        />
      ))}
    </div>
  );
}

// ==================== 计时器 ====================
function FocusTimer({
  onComplete,
  isRunning,
  onToggle,
}: {
  onComplete: () => void;
  isRunning: boolean;
  onToggle: () => void;
}) {
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [preset, setPreset] = useState(25);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, remaining, onComplete]);

  const setPresetMinutes = (min: number) => {
    setPreset(min);
    setTotalSeconds(min * 60);
    setRemaining(min * 60);
  };

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 预设选择 */}
      {!isRunning && (
        <div className="flex gap-2">
          {TIMER_PRESETS.map((p) => (
            <button
              key={p.minutes}
              onClick={() => setPresetMinutes(p.minutes)}
              className="px-3 py-1 text-[10px] tracking-widest rounded-full border transition-all"
              style={{
                borderColor: preset === p.minutes ? "var(--theme-accent)" : "var(--theme-border)",
                color: preset === p.minutes ? "var(--theme-accent)" : "var(--theme-text-secondary)",
                background: preset === p.minutes ? "var(--theme-accent-light)" : "transparent",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* 环形进度 */}
      <div className="relative w-20 h-20 md:w-24 md:h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="var(--theme-border)" strokeWidth="3" />
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="var(--theme-accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${progress * 276} 276`}
            style={{ transition: "stroke-dasharray 1s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg md:text-xl font-mono tracking-wider" style={{ color: "var(--theme-text)" }}>
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* 开始/暂停 */}
      <button
        onClick={onToggle}
        className="px-5 py-1.5 rounded-full text-xs tracking-widest transition-all"
        style={{
          background: "var(--theme-accent)",
          color: isRunning ? "var(--theme-text)" : "#fff",
          opacity: isRunning ? 0.7 : 1,
        }}
      >
        {isRunning ? "暂停" : remaining === 0 ? "重新开始" : "开始专注"}
      </button>
    </div>
  );
}

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

// ==================== 电影海报 ====================
function MoviePoster({ tmdbId }: { tmdbId: number }) {
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch(`/api/movie/${tmdbId}`, { signal: ac.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data.poster_path) {
          setPosterUrl(`https://image.tmdb.org/t/p/w342${data.poster_path}`);
        }
      })
      .catch(() => {});
    return () => ac.abort();
  }, [tmdbId]);

  if (!posterUrl) {
    return (
      <div
        className="w-24 h-36 md:w-32 md:h-48 rounded-sm flex items-center justify-center"
        style={{ background: "var(--theme-accent-light)" }}
      >
        <span className="text-xs" style={{ color: "var(--theme-text-secondary)" }}>🎬</span>
      </div>
    );
  }

  return (
    <img
      src={posterUrl}
      alt=""
      className="w-24 h-36 md:w-32 md:h-48 object-cover rounded-sm shadow-lg animate-in fade-in duration-500"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
    />
  );
}

// ==================== 主页面 ====================
export default function FocusPage() {
  const { theme } = useTheme();
  const [current, setCurrent] = useState(0);
  const [animStage, setAnimStage] = useState<"enter" | "hold" | "exit">("enter");
  const [timerRunning, setTimerRunning] = useState(false);
  const quote = quotes[current];

  // 定时切换
  useEffect(() => {
    if (timerRunning) return; // 计时器运行时不轮播
    const t = setInterval(() => {
      setAnimStage("exit");
      setTimeout(() => {
        setCurrent((c) => (c + 1) % quotes.length);
        setAnimStage("enter");
      }, 600);
    }, 12000);
    return () => clearInterval(t);
  }, [timerRunning]);

  const goTo = (index: number) => {
    setAnimStage("exit");
    setTimeout(() => {
      setCurrent(index);
      setAnimStage("enter");
    }, 600);
  };

  useEffect(() => { setAnimStage("enter"); }, []);

  const isNoir = theme === "noir";

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

        {/* 海报 + 名言卡片（水平排列桌面 / 垂直排列手机） */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 max-w-lg">
          {/* 海报 — 带动画 */}
          <div
            className="shrink-0 transition-all duration-600"
            style={{
              opacity: animStage === "exit" ? 0 : 1,
              transform: animStage === "exit"
                ? "translateY(-16px) scale(0.95)"
                : animStage === "enter"
                ? "translateY(8px) scale(1.02)"
                : "translateY(0) scale(1)",
              transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <MoviePoster tmdbId={quote.tmdbId} />
          </div>

          {/* 名言卡片 — 带动画 */}
          <div
            className="text-center px-5 py-5 md:px-7 md:py-6 max-w-xs transition-all duration-600"
            style={{
              opacity: animStage === "exit" ? 0 : 1,
              transform: animStage === "exit"
                ? "translateY(12px)"
                : animStage === "enter"
                ? "translateY(-4px)"
                : "translateY(0)",
              transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              background: "var(--theme-card)",
              backdropFilter: "blur(10px)",
              border: "1px solid var(--theme-border)",
              borderTop: `2px solid var(--theme-accent)`,
              borderBottom: `2px solid var(--theme-accent)`,
              borderRadius: "4px",
              boxShadow: isNoir
                ? "0 4px 24px rgba(255,45,120,0.05)"
                : "0 4px 20px rgba(0,0,0,0.04)",
            }}
          >
            <div className="text-2xl md:text-3xl leading-none mb-2"
              style={{ color: "var(--theme-accent)", opacity: 0.4, fontFamily: "Georgia, serif" }}>
              &ldquo;
            </div>
            <p className="leading-[2] md:leading-[2.1] mb-3 tracking-wide"
              style={{
                color: "var(--theme-text)",
                fontSize: "clamp(0.95rem, 2vw, 1.2rem)",
              }}>
              {quote.quoteZh}
            </p>
            <p className="italic leading-relaxed mb-3 text-xs md:text-sm font-light"
              style={{ color: "var(--theme-text-secondary)" }}>
              "{quote.quoteEn}"
            </p>
            <div className="flex items-center justify-center gap-2 mb-3">
              <div style={{ width: "12px", height: "0.5px", background: "var(--theme-accent)", opacity: 0.3 }} />
              <div style={{ width: "3px", height: "3px", background: "var(--theme-accent)", transform: "rotate(45deg)", opacity: 0.5 }} />
              <div style={{ width: "12px", height: "0.5px", background: "var(--theme-accent)", opacity: 0.3 }} />
            </div>
            <p className="text-xs tracking-[0.2em]" style={{ color: "var(--theme-text-secondary)" }}>
              《{quote.film}》· {quote.year}
            </p>
          </div>
        </div>

        {/* 进度 + 导航 */}
        <div className="flex items-center gap-6">
          <button onClick={() => goTo((current - 1 + quotes.length) % quotes.length)} className="p-2 transition-opacity hover:opacity-50" style={{ color: "var(--theme-text-secondary)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <ProgressDots total={quotes.length} current={current} />
          <button onClick={() => goTo((current + 1) % quotes.length)} className="p-2 transition-opacity hover:opacity-50" style={{ color: "var(--theme-text-secondary)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>

      {/* ===== 底部音乐 ===== */}
      <div className="pb-4 md:pb-6 safe-bottom">
        <NeteaseEmbed />
      </div>
    </div>
  );
}
