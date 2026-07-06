# Focus Page Mineradio 重构 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 /focus 页面重做为 Mineradio 风格——拆分 530 行单文件为独立组件，新增 3D 粒子星空背景，计时器增加 Web Audio 音效提醒。

**Architecture:** 从 `app/focus/page.tsx` 中抽取 QuoteCarousel、FocusTimer、SideDecor 为独立组件，新建 Starfield 3D 背景组件，page.tsx 精简为布局容器。NeteasePlayer 已独立存在，直接复用。

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Three.js / React Three Fiber

---

## 文件结构

```
app/focus/page.tsx              → [REWRITE] 精简为容器，组装子组件
components/focus/
├── Starfield.tsx               → [CREATE] 3D粒子星空背景
├── FocusTimer.tsx              → [CREATE] 从page.tsx抽出 + 音效提醒
├── QuoteCarousel.tsx           → [CREATE] 从page.tsx抽出（名言+海报）
├── SideDecor.tsx               → [CREATE] 从page.tsx抽出（4主题装饰）
└── NeteasePlayer.tsx           → [KEEP]  已存在，不变
```

---

### Task 1: SideDecor — 抽出侧边装饰组件

**Files:**
- Create: `components/focus/SideDecor.tsx`
- Modify: `app/focus/page.tsx`

从 `app/focus/page.tsx` 中把 `SideDecor` 函数完整移动到新文件。

- [ ] **Step 1: 创建 components/focus/SideDecor.tsx**

```tsx
"use client";
import { useTheme } from "@/components/layout/ThemeProvider";

export default function SideDecor({ side }: { side: "left" | "right" }) {
  const { theme } = useTheme();
  const isLeft = side === "left";

  return (
    <div
      className="hidden lg:block fixed bottom-0 z-10 pointer-events-none"
      style={{
        width: "min(120px, 10vw)",
        height: "min(400px, 60vh)",
        bottom: "60px",
        [isLeft ? "left" : "right"]: "max(16px, 2vw)",
      }}
    >
      {theme === "classic" && (
        <div className="flex flex-col items-center gap-4 h-full justify-end pb-8">
          {[1,2,3].map(i => (
            <div key={i} className="w-px" style={{
              height: `${40 + i * 20}px`,
              background: `linear-gradient(to bottom, var(--theme-accent), transparent)`,
              opacity: 0.3 - i * 0.08,
            }} />
          ))}
          <div className="w-2 h-2 rounded-full" style={{ background: "var(--theme-accent)", opacity: 0.4 }} />
        </div>
      )}
      {theme === "nouvelle" && (
        <div className="flex flex-col items-center gap-6 h-full justify-end pb-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="w-8 h-px" style={{
              background: "var(--theme-text)",
              opacity: 0.15 - i * 0.03,
            }} />
          ))}
        </div>
      )}
      {theme === "noir" && (
        <div className="flex flex-col items-center gap-4 h-full justify-end pb-8">
          {[1,2,3].map(i => (
            <div key={i} className="w-1 h-1 rounded-full" style={{
              background: i % 2 === 0 ? "#ff2d78" : "#00d4ff",
              boxShadow: `0 0 ${6 + i * 2}px ${i % 2 === 0 ? "#ff2d78" : "#00d4ff"}`,
              opacity: 0.4 - i * 0.1,
            }} />
          ))}
        </div>
      )}
      {theme === "deco" && (
        <div className="flex flex-col items-center gap-3 h-full justify-end pb-8">
          {[1,2,3].map(i => (
            <div key={i} style={{
              width: `${16 + i * 8}px`,
              height: "1px",
              background: "var(--theme-accent)",
              opacity: 0.25 - i * 0.06,
            }} />
          ))}
          <div className="w-2 h-2" style={{ border: "1px solid var(--theme-accent)", opacity: 0.3, transform: "rotate(45deg)" }} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 从 page.tsx 删除 SideDecor 函数，替换为 import**

在 `app/focus/page.tsx` 中：
1. 添加 `import SideDecor from "@/components/focus/SideDecor";`
2. 删除 `function SideDecor({ side }: ...)` 整个函数体（约 60 行）
3. `<SideDecor side="left" />` 和 `<SideDecor side="right" />` 保持不变

- [ ] **Step 3: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: 提交**

```bash
git add components/focus/SideDecor.tsx app/focus/page.tsx
git commit -m "refactor: extract SideDecor from focus page"
```

---

### Task 2: QuoteCarousel — 抽出名言轮播组件

**Files:**
- Create: `components/focus/QuoteCarousel.tsx`
- Modify: `app/focus/page.tsx`

从 page.tsx 中抽出 quotes 数据、ProgressDots、MoviePoster、轮播逻辑。

- [ ] **Step 1: 创建 components/focus/QuoteCarousel.tsx**

```tsx
"use client";
import { useState, useEffect  } from "react";
import { useTheme } from "@/components/layout/ThemeProvider";

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

// ==================== 进度点 ====================
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

// ==================== 名言轮播 ====================
interface QuoteCarouselProps {
  timerRunning: boolean;
}

export default function QuoteCarousel({ timerRunning }: QuoteCarouselProps) {
  const { theme } = useTheme();
  const [current, setCurrent] = useState(0);
  const [animStage, setAnimStage] = useState<"enter" | "hold" | "exit">("enter");
  const quote = quotes[current];
  const isNoir = theme === "noir";

  useEffect(() => {
    if (timerRunning) return;
    const t = setInterval(() => {
      setAnimStage("exit");
      setTimeout(() => {
        setCurrent((c) => (c + 1) % quotes.length);
        setAnimStage("enter");
      }, 600);
    }, 12000);
    return () => clearInterval(t);
  }, [timerRunning]);

  useEffect(() => { setAnimStage("enter"); }, []);

  const goTo = (index: number) => {
    setAnimStage("exit");
    setTimeout(() => {
      setCurrent(index);
      setAnimStage("enter");
    }, 600);
  };

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6">
      {/* 海报 + 名言卡片 */}
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 max-w-lg">
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
  );
}
```

- [ ] **Step 2: 从 page.tsx 删除相应代码**

在 `app/focus/page.tsx` 中：
1. 添加 `import QuoteCarousel from "@/components/focus/QuoteCarousel";`
2. 删除 `interface Quote`、`quotes` 数组、`ProgressDots`、`MoviePoster` 函数
3. 删除主组件中的 `current`、`animStage`、`quote` 状态和轮播逻辑
4. 将原来的海报+名言+导航 JSX 替换为：`<QuoteCarousel timerRunning={timerRunning} />`

- [ ] **Step 3: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: 提交**

```bash
git add components/focus/QuoteCarousel.tsx app/focus/page.tsx
git commit -m "refactor: extract QuoteCarousel from focus page"
```

---

### Task 3: FocusTimer — 抽出计时器 + 音效

**Files:**
- Create: `components/focus/FocusTimer.tsx`
- Modify: `app/focus/page.tsx`

- [ ] **Step 1: 创建 components/focus/FocusTimer.tsx**

```tsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const TIMER_PRESETS = [
  { label: "25分钟", minutes: 25 },
  { label: "45分钟", minutes: 45 },
  { label: "60分钟", minutes: 60 },
];

/** Web Audio API 计时结束提示音 */
function playAlarm() {
  try {
    const ctx = new AudioContext();
    [0, 200, 400].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = 880 + i * 220;
      gain.gain.value = 0.3;
      osc.start(ctx.currentTime + delay / 1000);
      osc.stop(ctx.currentTime + delay / 1000 + 0.3);
    });
  } catch {
    // AudioContext not available
  }
}

interface FocusTimerProps {
  isRunning: boolean;
  onToggle: () => void;
  onComplete: () => void;
}

export default function FocusTimer({ isRunning, onToggle, onComplete }: FocusTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [preset, setPreset] = useState(25);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const alarmRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            onComplete();
            // 播放提示音
            playAlarm();
            // 每3秒重复提醒
            alarmRef.current = window.setInterval(playAlarm, 3000);
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

  // 用户点击按钮后停止重复提醒
  const handleToggle = useCallback(() => {
    if (alarmRef.current) {
      clearInterval(alarmRef.current);
      alarmRef.current = null;
    }
    onToggle();
  }, [onToggle]);

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
        onClick={handleToggle}
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
```

- [ ] **Step 2: 从 page.tsx 删除 FocusTimer 代码**

在 `app/focus/page.tsx` 中：
1. 添加 `import FocusTimer from "@/components/focus/FocusTimer";`
2. 删除 `TIMER_PRESETS` 常量和 `FocusTimer` 函数定义
3. `<FocusTimer ... />` JSX 调用保持不变

- [ ] **Step 3: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: 提交**

```bash
git add components/focus/FocusTimer.tsx app/focus/page.tsx
git commit -m "feat: extract FocusTimer with Web Audio alarm sound"
```

---

### Task 4: Starfield — 3D 粒子星空背景

**Files:**
- Create: `components/focus/Starfield.tsx`

使用 @react-three/fiber + @react-three/drei（项目已有依赖）。

- [ ] **Step 1: 创建 components/focus/Starfield.tsx**

```tsx
"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Particles({ count = 1500 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // 球形分布，半径随机
      const r = 3 + Math.random() * 7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05;
      meshRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#c8a951"
        sizeAttenuation
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function Starfield() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Particles />
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 2: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: 提交**

```bash
git add components/focus/Starfield.tsx
git commit -m "feat: add Starfield 3D particle background for focus page"
```

---

### Task 5: 重写 page.tsx — 组装精简容器

**Files:**
- Modify: `app/focus/page.tsx`

删除所有已抽出的代码，page.tsx 变为精简的布局容器。

- [ ] **Step 1: 重写 app/focus/page.tsx**

完整替换为：

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/components/layout/ThemeProvider";
import dynamic from "next/dynamic";
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
```

- [ ] **Step 2: 保证 NeteasePlayer 存在**

检查 `components/focus/NeteasePlayer.tsx` 是否存在且有正确导出。如果不存在，从 page.tsx 旧代码中的 `NeteaseEmbed` 逻辑创建它。

- [ ] **Step 3: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: 提交**

```bash
git add app/focus/page.tsx
git commit -m "refactor: rewrite focus page as clean container with extracted components"
```

---

### Task 6: 构建验证 + 提交

- [ ] **Step 1: 完整构建**

```bash
npx next build
```

验证无错误，所有页面正常编译。

- [ ] **Step 2: 最后提交**

```bash
git add -A
git commit -m "feat: Mineradio-style focus page with 3D starfield + alarm sound + component split"
```

---

## 实施顺序

```
Task 1 (SideDecor 抽出)
  → Task 2 (QuoteCarousel 抽出)
    → Task 3 (FocusTimer + 音效)
      → Task 4 (Starfield 3D)
        → Task 5 (page.tsx 重写)
          → Task 6 (最终验证)
```

Task 1-4 相互独立（各自创建独立文件），可并行。Task 5 依赖前四个任务全部完成。
