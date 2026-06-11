"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { TmdbMovie } from "@/lib/types";
import { backdropUrl } from "@/lib/tmdb";

// ==================== 名言数据 ====================
interface Quote {
  id: string;
  quoteZh: string;
  quoteEn: string;
  film: string;
  filmEn: string;
  year: number;
  tmdbId: number;
}

const quotes: Quote[] = [
  { id: "q1", quoteZh: "希望是美好的，也许是人间至善，而美好的事物永不消逝。", quoteEn: "Hope is a good thing, maybe the best of things, and no good thing ever dies.", film: "肖申克的救赎", filmEn: "The Shawshank Redemption", year: 1994, tmdbId: 278 },
  { id: "q2", quoteZh: "人生就像一盒巧克力，你永远不知道下一颗是什么味道。", quoteEn: "Life is like a box of chocolates. You never know what you're gonna get.", film: "阿甘正传", filmEn: "Forrest Gump", year: 1994, tmdbId: 13 },
  { id: "q3", quoteZh: "我们读诗写诗，并不是因为它们好玩，而是因为我们是人类的一分子。", quoteEn: "We don't read and write poetry because it's cute. We read and write poetry because we are members of the human race.", film: "死亡诗社", filmEn: "Dead Poets Society", year: 1989, tmdbId: 207 },
  { id: "q4", quoteZh: "每个人都会死，但不是每个人都真正活过。", quoteEn: "Every man dies. Not every man really lives.", film: "勇敢的心", filmEn: "Braveheart", year: 1995, tmdbId: 197 },
  { id: "q5", quoteZh: "如果你有梦想，就要去捍卫它。", quoteEn: "Don't ever let somebody tell you you can't do something. You got a dream, you gotta protect it.", film: "当幸福来敲门", filmEn: "The Pursuit of Happyness", year: 2006, tmdbId: 1402 },
  { id: "q6", quoteZh: "世界上只有一种真正的英雄主义，那就是在认清生活真相之后依然热爱生活。", quoteEn: "There is only one heroism in the world: to see the world as it is, and to love it.", film: "闻香识女人", filmEn: "Scent of a Woman", year: 1992, tmdbId: 9475 },
  { id: "q7", quoteZh: "我们一路奋战，不是为了改变世界，而是为了不让世界改变我们。", quoteEn: "We fight not to change the world, but to keep the world from changing us.", film: "熔炉", filmEn: "Silenced", year: 2011, tmdbId: 91070 },
  { id: "q8", quoteZh: "活着本身就是一种胜利。", quoteEn: "To live is itself a victory.", film: "活着", filmEn: "To Live", year: 1994, tmdbId: 11104 },
  { id: "q9", quoteZh: "这世界很糟，但是你会爱上它的。", quoteEn: "The world is a bad place, but you're going to love it.", film: "海上钢琴师", filmEn: "The Legend of 1900", year: 1998, tmdbId: 10376 },
  { id: "q10", quoteZh: "我不知道将去何方，但我已在路上。", quoteEn: "I don't know where I'm going, but I'm on my way.", film: "千与千寻", filmEn: "Spirited Away", year: 2001, tmdbId: 129 },
  { id: "q11", quoteZh: "你得决定自己是什么。别人给你贴的标签不重要。", quoteEn: "You have to decide what you are. The labels other people give you don't matter.", film: "月光男孩", filmEn: "Moonlight", year: 2016, tmdbId: 376867 },
  { id: "q12", quoteZh: "回忆之所以美好，是因为我们都回不去了。", quoteEn: "Memory is so beautiful because we can never go back.", film: "一代宗师", filmEn: "The Grandmaster", year: 2013, tmdbId: 44865 },
  { id: "q13", quoteZh: "时间可以伸缩和折叠，唯独不能倒退。", quoteEn: "Time can stretch and fold, but it can never go backwards.", film: "星际穿越", filmEn: "Interstellar", year: 2014, tmdbId: 157336 },
  { id: "q14", quoteZh: "爱是我们唯一能够感知的，超越时空维度的事物。", quoteEn: "Love is the one thing we're capable of perceiving that transcends dimensions of time and space.", film: "星际穿越", filmEn: "Interstellar", year: 2014, tmdbId: 157336 },
  { id: "q15", quoteZh: "所有大人都曾经是小孩，虽然只有少数人记得。", quoteEn: "All grown-ups were once children, although few of them remember it.", film: "小王子", filmEn: "The Little Prince", year: 2015, tmdbId: 309809 },
  { id: "q16", quoteZh: "一件事无论太晚，或者对于我来说太早，都不会阻拦你成为你想成为的那个人。", quoteEn: "For what it's worth, it's never too late to be whoever you want to be.", film: "本杰明·巴顿奇事", filmEn: "The Curious Case of Benjamin Button", year: 2008, tmdbId: 4922 },
  { id: "q17", quoteZh: "过去只是我们说给自己听的一个故事。", quoteEn: "The past is just a story we tell ourselves.", film: "她", filmEn: "Her", year: 2013, tmdbId: 152601 },
  { id: "q18", quoteZh: "真正的自由，不是你能做什么，而是你能不做什么。", quoteEn: "True freedom is not being able to do what you want, but being able to not do what you don't want.", film: "荒野生存", filmEn: "Into the Wild", year: 2007, tmdbId: 5915 },
];

// ==================== 环境音配置 ====================
const SOUND_SCENES = [
  { id: "rain", label: "雨声", icon: "🌧", neteaseId: "4934514985" },
  { id: "piano", label: "钢琴", icon: "🎹", neteaseId: "5156234253" },
  { id: "ocean", label: "海浪", icon: "🌊", neteaseId: "4993526879" },
  { id: "forest", label: "森林", icon: "🌿", neteaseId: "4951122676" },
  { id: "cafe", label: "咖啡馆", icon: "☕", neteaseId: "5086114461" },
  { id: "fire", label: "壁炉", icon: "🔥", neteaseId: "4801321473" },
];

// ==================== 粒子画布 ====================
function AmbientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: Array<{ x: number; y: number; r: number; vx: number; vy: number; opacity: number }> = [];
    const PARTICLE_COUNT = 50;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // 初始化粒子
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15 - 0.1,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        // 环绕边界
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148, 163, 184, ${p.opacity})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

// ==================== 进度条 ====================
function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="transition-all duration-1000 ease-in-out rounded-full"
          style={{
            width: i === current ? "28px" : "6px",
            height: "2px",
            background: i === current ? "#334155" : "#cbd5e1",
          }}
        />
      ))}
    </div>
  );
}

// ==================== 主组件 ====================
export default function FocusPage() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [soundScene, setSoundScene] = useState(SOUND_SCENES[1]); // 默认钢琴
  const [showSoundMenu, setShowSoundMenu] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const quote = quotes[current];

  const goTo = useCallback((index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setIsTransitioning(false);
    }, 1200);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % quotes.length);
  }, [current, goTo]);

  // 自动轮播
  useEffect(() => {
    intervalRef.current = setInterval(next, 10000); // 10 秒
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [next]);

  // 暂停自动播放
  const pauseAndResume = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setTimeout(() => {
        intervalRef.current = setInterval(next, 10000);
      }, 5000); // 交互后 5 秒恢复
    }
  };

  return (
    <>
      <AmbientCanvas />

      {/* 返回按钮 */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-50 flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors duration-500"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        <span className="text-xs tracking-widest hidden sm:inline">ESCAPE</span>
      </Link>

      {/* 主内容 */}
      <main className="fixed inset-0 flex flex-col items-center justify-center z-10 px-6 sm:px-12">
        {/* 进度指示器 */}
        <div className="absolute top-12 sm:top-16">
          <ProgressDots total={quotes.length} current={current} />
        </div>

        {/* 名言区域 */}
        <div
          className={`max-w-lg mx-auto text-center transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isTransitioning ? "opacity-0 translate-y-6 blur-[2px]" : "opacity-100 translate-y-0 blur-0"
          }`}
        >
          {/* 中文引用 */}
          <p
            className="font-serif text-[#1e2a3a] leading-[2.2] tracking-wide mb-8"
            style={{
              fontSize: "clamp(1.125rem, 3vw, 1.5rem)",
              fontFamily: '"Noto Serif SC", Georgia, "Songti SC", serif',
            }}
          >
            &ldquo;{quote.quoteZh}&rdquo;
          </p>

          {/* 分隔线 */}
          <div className="w-8 h-px bg-[#94a3b8] mx-auto mb-6" />

          {/* 英文 */}
          <p className="text-[#94a3b8] text-sm italic leading-relaxed mb-6 font-light tracking-wide">
            {quote.quoteEn}
          </p>

          {/* 电影信息 */}
          <div className="space-y-1">
            <p className="text-[#475569] text-xs tracking-[0.15em]">
              《{quote.film}》
            </p>
            <p className="text-[#94a3b8] text-[10px] tracking-[0.2em] uppercase">
              {quote.filmEn} · {quote.year}
            </p>
          </div>
        </div>

        {/* 交互提示 */}
        <div className="absolute bottom-32 flex items-center gap-8">
          <button
            onClick={() => {
              pauseAndResume();
              goTo((current - 1 + quotes.length) % quotes.length);
            }}
            className="text-slate-300 hover:text-slate-500 transition-colors duration-500 p-3"
            aria-label="上一句"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button
            onClick={() => {
              pauseAndResume();
              next();
            }}
            className="text-slate-300 hover:text-slate-500 transition-colors duration-500 p-3"
            aria-label="下一句"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </main>

      {/* 底部音乐控制 */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-lg mx-auto px-6 pb-8 safe-bottom">
          {/* 音景选择 */}
          {showSoundMenu && (
            <div className="flex justify-center gap-1 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {SOUND_SCENES.map((scene) => (
                <button
                  key={scene.id}
                  onClick={() => {
                    setSoundScene(scene);
                    setShowSoundMenu(false);
                    pauseAndResume();
                  }}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs transition-all duration-300 ${
                    soundScene.id === scene.id
                      ? "bg-white/60 text-slate-700 shadow-sm"
                      : "text-slate-400 hover:text-slate-600 hover:bg-white/30"
                  }`}
                >
                  <span className="text-lg">{scene.icon}</span>
                  <span className="tracking-wide">{scene.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* 当前音景 + 网易云链接 */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => { setShowSoundMenu(!showSoundMenu); pauseAndResume(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 backdrop-blur-sm text-slate-500 text-xs tracking-widest hover:bg-white/60 transition-all duration-300"
            >
              <span>{soundScene.icon}</span>
              <span>{soundScene.label}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`transition-transform duration-300 ${showSoundMenu ? "rotate-180" : ""}`}>
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            <a
              href={`https://music.163.com/#/playlist?id=${soundScene.neteaseId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/30 backdrop-blur-sm text-slate-400 text-[10px] tracking-widest hover:text-[#c62f2f] hover:bg-white/50 transition-all duration-300"
              onClick={pauseAndResume}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.6 17.6c-.2.4-.7.5-1.1.3-3-1.8-6.8-2.2-11.2-1.2-.4.1-.8-.2-.9-.6-.1-.4.2-.8.6-.9 4.8-1.1 8.9-.6 12.4 1.4.4.2.5.7.2 1zm1.5-3.4c-.3.5-.9.6-1.4.4-3.4-2.1-8.6-2.7-12.7-1.5-.5.1-1-.1-1.2-.6-.1-.5.1-1 .6-1.2 4.7-1.4 10.5-.7 14.5 1.8.5.3.7.8.2 1.1zm.1-3.5C15.1 8.5 7.1 8.2 3.6 9.3c-.6.2-1.3-.2-1.5-.8-.2-.6.2-1.3.8-1.5 4.3-1.3 13.1-1 18.2 1.9.6.3.9 1 .6 1.6-.3.5-1.1.3-1.5.2z"/>
              </svg>
              <span>网易云</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
