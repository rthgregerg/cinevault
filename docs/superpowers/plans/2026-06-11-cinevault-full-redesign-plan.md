# CineVault 全站改造 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 CineVault 改造为美式复古多主题电影网站：4套可切换主题、首页Hero重构、全站3D动效、专注模式+大卫雕塑+网易云音景。

**Architecture:** CSS 自定义属性驱动的主题系统（`data-theme` on `<html>`），Next.js App Router + Tailwind CSS。ThemeProvider 客户端组件管理主题状态并持久化到 localStorage。专注模式 `/focus` 为独立客户端页面。

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS 3, TMDB API

---

## Phase 1: 主题系统基础

### Task 1: CSS 变量主题引擎 + Tailwind 配色

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1: 更新 tailwind.config.ts 添加4套主题色**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 保持旧色兼容
        bg: { DEFAULT: "#0a0a0a", card: "#141414", elevated: "#1a1a1a" },
        gold: { DEFAULT: "#c8a951", light: "#d4b85e", dark: "#a88a3a" },
        text: { primary: "#ffffff", secondary: "#9ca3af", muted: "#6b7280" },
        // 主题色（通过 CSS 变量动态切换）
        theme: {
          bg: "var(--theme-bg)",
          surface: "var(--theme-surface)",
          card: "var(--theme-card)",
          text: "var(--theme-text)",
          "text-secondary": "var(--theme-text-secondary)",
          accent: "var(--theme-accent)",
          "accent-light": "var(--theme-accent-light)",
          border: "var(--theme-border)",
          hero: "var(--theme-hero)",
        },
      },
      fontFamily: {
        serif: ["Noto Serif SC", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Georgia", "Noto Serif SC", "serif"],
        mono: ["Courier New", "monospace"],
      },
      borderRadius: { card: "8px", btn: "4px" },
      spacing: { section: "48px", "section-lg": "64px" },
      transitionDuration: { DEFAULT: "300ms" },
      maxWidth: { content: "1280px" },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 2: 更新 globals.css 添加4套主题 CSS 变量**

在 `app/globals.css` 的 `@layer base` 中 `body` 之前添加：

```css
/* ========== 主题系统 ========== */
:root,
[data-theme="classic"] {
  --theme-bg: #fdfaf5;
  --theme-surface: #f7f0e5;
  --theme-card: rgba(253, 250, 245, 0.85);
  --theme-text: #3a2010;
  --theme-text-secondary: #8b5e3c;
  --theme-accent: #c8a040;
  --theme-accent-light: rgba(200, 160, 64, 0.15);
  --theme-border: rgba(139, 94, 60, 0.15);
  --theme-hero: #fdfaf5;
}

[data-theme="nouvelle"] {
  --theme-bg: #fafafa;
  --theme-surface: #f0f0f0;
  --theme-card: rgba(250, 250, 250, 0.9);
  --theme-text: #1a1a1a;
  --theme-text-secondary: #666666;
  --theme-accent: #c41e3a;
  --theme-accent-light: rgba(196, 30, 58, 0.1);
  --theme-border: rgba(0, 0, 0, 0.08);
  --theme-hero: #fafafa;
}

[data-theme="noir"] {
  --theme-bg: #0a0a14;
  --theme-surface: #12122a;
  --theme-card: rgba(10, 10, 30, 0.8);
  --theme-text: #e0e0ff;
  --theme-text-secondary: #8888bb;
  --theme-accent: #ff2d78;
  --theme-accent-light: rgba(255, 45, 120, 0.12);
  --theme-border: rgba(255, 45, 120, 0.15);
  --theme-hero: #0a0a14;
}

[data-theme="deco"] {
  --theme-bg: #faf6ed;
  --theme-surface: #f0e8d5;
  --theme-card: rgba(250, 246, 237, 0.9);
  --theme-text: #1a1510;
  --theme-text-secondary: #8b7355;
  --theme-accent: #c8a040;
  --theme-accent-light: rgba(200, 160, 64, 0.12);
  --theme-border: rgba(180, 150, 80, 0.2);
  --theme-hero: linear-gradient(135deg, #faf6ed, #f0e8d5);
}

/* 全局过渡 */
body {
  background: var(--theme-bg);
  color: var(--theme-text);
  transition: background 0.5s ease, color 0.5s ease;
}
```

- [ ] **Step 3: 构建验证 + 提交**

```bash
npx next build 2>&1 | tail -5
git add tailwind.config.ts app/globals.css
git commit -m "feat: add 4-theme CSS variable system (classic/nouvelle/noir/deco)"
```

---

### Task 2: ThemeProvider + ThemeSwitcher

**Files:**
- Create: `components/layout/ThemeProvider.tsx`
- Create: `components/layout/ThemeSwitcher.tsx`
- Modify: `app/layout.tsx`
- Modify: `components/layout/DesktopSidebar.tsx`

- [ ] **Step 1: 创建 ThemeProvider**

```tsx
// components/layout/ThemeProvider.tsx
"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type ThemeName = "classic" | "nouvelle" | "noir" | "deco";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

const themes: { key: ThemeName; label: string; emoji: string }[] = [
  { key: "classic", label: "经典", emoji: "🎞️" },
  { key: "nouvelle", label: "新浪潮", emoji: "🎬" },
  { key: "noir", label: "霓虹", emoji: "🌃" },
  { key: "deco", label: "黄金", emoji: "✨" },
];

const ThemeContext = createContext<ThemeContextValue>({
  theme: "classic",
  setTheme: () => {},
});

export const themeList = themes;

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("classic");

  useEffect(() => {
    const saved = localStorage.getItem("cinevault-theme") as ThemeName | null;
    if (saved && themes.some((t) => t.key === saved)) {
      setThemeState(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("cinevault-theme", t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

- [ ] **Step 2: 创建 ThemeSwitcher**

```tsx
// components/layout/ThemeSwitcher.tsx
"use client";
import { useTheme, themeList } from "./ThemeProvider";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-wrap gap-1.5">
      {themeList.map((t) => (
        <button
          key={t.key}
          onClick={() => setTheme(t.key)}
          className={`px-3 py-1.5 text-[10px] tracking-widest rounded-full border transition-all duration-300 ${
            theme === t.key
              ? "border-theme-accent text-theme-text bg-theme-accent-light"
              : "border-theme-border text-theme-text-secondary hover:border-theme-accent/50"
          }`}
        >
          <span className="mr-1">{t.emoji}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 集成到 layout.tsx**

修改 `app/layout.tsx`，在 `<body>` 内包裹 ThemeProvider：

```tsx
import ThemeProvider from "@/components/layout/ThemeProvider";
// ... 其他 imports 不变

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" data-theme="classic">
      <body className="min-h-screen">
        <ThemeProvider>
          <CursorGlow />
          <DesktopSidebar />
          {children}
          <AtmospherePanel />
          <BottomTabBar />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: 切换器放入侧边栏**

修改 `components/layout/DesktopSidebar.tsx`，在 footer 上方添加：

```tsx
import ThemeSwitcher from "./ThemeSwitcher";

// 在 <div className="mt-auto"> 之前添加：
<div className="py-4 border-t border-theme-border">
  <p className="text-[9px] tracking-[0.3em] text-theme-text-secondary mb-2 opacity-50">STYLE</p>
  <ThemeSwitcher />
</div>
```

- [ ] **Step 5: 构建验证 + 提交**

```bash
npx next build 2>&1 | tail -5
git add components/layout/ThemeProvider.tsx components/layout/ThemeSwitcher.tsx app/layout.tsx components/layout/DesktopSidebar.tsx
git commit -m "feat: add ThemeProvider + ThemeSwitcher with localStorage persistence"
```

---

## Phase 2: 修复 ParallaxTilt + 全站组件升级

### Task 3: 修复 ParallaxTilt 内存泄漏

**Files:**
- Modify: `components/shared/ParallaxTilt.tsx`

- [ ] **Step 1: 用 useEffect 管理动画循环**

在 `ParallaxTilt.tsx` 中删除第 73-76 行的模块级检查：
```tsx
// 删除这4行：
if (rafRef.current === 0) {
  rafRef.current = requestAnimationFrame(animate);
}
```

在 `const handleMouseLeave` 定义之后、`return` 之前添加：
```tsx
useEffect(() => {
  rafRef.current = requestAnimationFrame(animate);
  return () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };
}, []);
```

并在文件顶部已有 import 处确保 `useEffect` 已导入：
```tsx
import { useRef, useEffect, type ReactNode, type CSSProperties } from "react";
```

- [ ] **Step 2: 确保 ParallaxTilt 的外层 div 有 position: relative**

```tsx
<div
  ref={ref}
  className={`relative transition-transform duration-75 ${className}`}
  style={{ transformStyle: "preserve-3d", ...style }}
  ...
>
```

- [ ] **Step 3: 构建 + 提交**

```bash
npx next build 2>&1 | tail -5
git add components/shared/ParallaxTilt.tsx
git commit -m "fix: ParallaxTilt RAF managed by useEffect with cleanup"
```

---

### Task 4: MovieCard 集成 ParallaxTilt

**Files:**
- Modify: `components/shared/MovieCard.tsx`

- [ ] **Step 1: 包裹卡片**

读取现有 MovieCard 代码后，添加 import 并将最外层包裹 ParallaxTilt：

```tsx
import ParallaxTilt from "./ParallaxTilt";

// return 改为：
<ParallaxTilt tiltAmount={6} glare={0.06}>
  <Link href={`/movie/${movie.id}`} className="card block group">
    {/* 原有内容不变 */}
  </Link>
</ParallaxTilt>
```

- [ ] **Step 2: 构建 + 提交**

```bash
npx next build 2>&1 | tail -5
git add components/shared/MovieCard.tsx
git commit -m "feat: MovieCard with ParallaxTilt 3D hover"
```

---

## Phase 3: 首页 Hero + 视差

### Task 5: HeroBanner 组件

**Files:**
- Create: `components/home/HeroBanner.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: 创建 HeroBanner**

```tsx
// components/home/HeroBanner.tsx
"use client";
import { useTheme } from "@/components/layout/ThemeProvider";

export default function HeroBanner() {
  const { theme } = useTheme();
  const isNoir = theme === "noir";

  return (
    <section
      className="relative text-center py-16 md:py-20 overflow-hidden"
      style={{ background: "var(--theme-hero)" }}
    >
      {/* 装饰元素 — 随主题变化 */}
      {theme === "classic" && (
        <div className="flex justify-center gap-1.5 mb-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{
                background: "var(--theme-accent)",
                boxShadow: "0 0 6px var(--theme-accent)",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      )}

      {theme === "nouvelle" && (
        <div className="flex items-center justify-center gap-4 mb-6 opacity-30">
          <div className="w-8 h-px bg-current" />
          <div className="w-1 h-1 bg-current rounded-full" />
          <div className="w-8 h-px bg-current" />
        </div>
      )}

      {theme === "noir" && (
        <div className="flex justify-center gap-2 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full"
              style={{
                background: i % 2 === 0 ? "#ff2d78" : "#00d4ff",
                boxShadow: `0 0 8px ${i % 2 === 0 ? "#ff2d78" : "#00d4ff"}`,
              }}
            />
          ))}
        </div>
      )}

      {theme === "deco" && (
        <div className="mb-6">
          <div className="inline-block border-t-2 border-b-2 py-1 px-6" style={{ borderColor: "var(--theme-accent)" }}>
            <div className="flex gap-1 justify-center mb-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="w-2 h-px" style={{ background: "var(--theme-accent)" }} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 主标题 */}
      <h1
        className="text-2xl md:text-4xl font-display tracking-[0.15em] mb-3"
        style={{
          color: "var(--theme-text)",
          fontFamily: theme === "nouvelle" ? "'Courier New', monospace" : "Georgia, 'Noto Serif SC', serif",
          textShadow: isNoir ? "0 0 20px rgba(0,180,255,0.3)" : "none",
        }}
      >
        发现电影之美
      </h1>
      <p className="text-sm md:text-base tracking-[0.2em]" style={{ color: "var(--theme-text-secondary)" }}>
        探索影史之深
      </p>
      <div className="w-8 h-px mx-auto mt-4" style={{ background: isNoir ? "linear-gradient(to right, #ff2d78, #00d4ff)" : "var(--theme-accent)" }} />

      {/* 浮动装饰 */}
      <div className="flex justify-center gap-4 md:gap-8 mt-8 opacity-40">
        <div className="w-10 h-7 md:w-14 md:h-10 border rounded-sm flex items-center justify-center" style={{ borderColor: "var(--theme-accent)" }}>
          <span className="text-[8px] md:text-[10px]" style={{ color: "var(--theme-accent)" }}>🎬</span>
        </div>
        <div className="w-7 h-7 md:w-10 md:h-10 border rounded-full" style={{ borderColor: "var(--theme-accent)" }} />
        <div className="w-12 h-1.5 md:w-16 md:h-2 rounded-full" style={{ background: "var(--theme-accent-light)" }} />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: 集成到首页**

修改 `app/page.tsx`，在 DailyRecommend 之前插入：

```tsx
import HeroBanner from "@/components/home/HeroBanner";

export default async function HomePage() {
  // ... 现有数据获取 ...

  return (
    <PageWrapper>
      <div className="pt-6 lg:pt-10">
        <HeroBanner />
        <DailyRecommend />
        {/* ... 其余不变 ... */}
      </div>
    </PageWrapper>
  );
}
```

- [ ] **Step 3: 构建 + 提交**

```bash
npx next build 2>&1 | tail -5
git add components/home/HeroBanner.tsx app/page.tsx
git commit -m "feat: add HeroBanner with theme-responsive decorations"
```

---

## Phase 4: 专注模式 + 网易云

### Task 6: 网易云播放器组件

**Files:**
- Create: `components/focus/NeteasePlayer.tsx`
- Modify: `app/focus/page.tsx`

- [ ] **Step 1: 创建 NeteasePlayer 组件**

```tsx
// components/focus/NeteasePlayer.tsx
"use client";
import { useState, useRef, useEffect } from "react";

export interface SoundScene {
  id: string;
  label: string;
  emoji: string;
  neteaseId: string;
}

const SOUND_SCENES: SoundScene[] = [
  { id: "jazz", label: "爵士", emoji: "🎷", neteaseId: "7138395288" },
  { id: "piano", label: "钢琴", emoji: "🎹", neteaseId: "5156234253" },
  { id: "rain", label: "雨声", emoji: "🌧", neteaseId: "4934514985" },
  { id: "ocean", label: "海浪", emoji: "🌊", neteaseId: "4993526879" },
  { id: "forest", label: "森林", emoji: "🌿", neteaseId: "4951122676" },
  { id: "cafe", label: "咖啡馆", emoji: "☕", neteaseId: "5086114461" },
];

export default function NeteasePlayer() {
  const [scene, setScene] = useState<SoundScene>(SOUND_SCENES[0]);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 音景选择面板 */}
      {showMenu && (
        <div className="flex flex-wrap justify-center gap-1 px-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {SOUND_SCENES.map((s) => (
            <button
              key={s.id}
              onClick={() => { setScene(s); setShowMenu(false); }}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-[10px] transition-all duration-300 ${
                scene.id === s.id
                  ? "bg-theme-accent-light text-theme-text"
                  : "text-theme-text-secondary hover:bg-theme-accent-light/50"
              }`}
            >
              <span className="text-base">{s.emoji}</span>
              <span className="tracking-widest">{s.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* 底部控制 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs tracking-widest transition-all duration-300"
          style={{
            background: "var(--theme-card)",
            border: "1px solid var(--theme-border)",
            color: "var(--theme-text-secondary)",
          }}
        >
          <span>{scene.emoji}</span>
          <span>{scene.label}</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-300 ${showMenu ? "rotate-180" : ""}`}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <a
          href={`https://music.163.com/#/playlist?id=${scene.neteaseId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[10px] tracking-widest transition-all duration-300 hover:opacity-70"
          style={{
            background: "var(--theme-accent-light)",
            color: "var(--theme-text-secondary)",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.6 17.6c-.2.4-.7.5-1.1.3-3-1.8-6.8-2.2-11.2-1.2-.4.1-.8-.2-.9-.6-.1-.4.2-.8.6-.9 4.8-1.1 8.9-.6 12.4 1.4.4.2.5.7.2 1zm1.5-3.4c-.3.5-.9.6-1.4.4-3.4-2.1-8.6-2.7-12.7-1.5-.5.1-1-.1-1.2-.6-.1-.5.1-1 .6-1.2 4.7-1.4 10.5-.7 14.5 1.8.5.3.7.8.2 1.1z"/>
          </svg>
          <span>网易云</span>
        </a>
      </div>
    </div>
  );
}

export { SOUND_SCENES };
```

- [ ] **Step 2: 更新 focus/page.tsx 使用 NeteasePlayer**

在 `app/focus/page.tsx` 中：
- 删除内联的 `SOUND_SCENES` 常量和底部音乐控制 JSX
- 添加 `import NeteasePlayer from "@/components/focus/NeteasePlayer";`
- 在底部位置替换为 `<NeteasePlayer />`

- [ ] **Step 3: 构建 + 提交**

```bash
npx next build 2>&1 | tail -5
git add components/focus/NeteasePlayer.tsx app/focus/page.tsx
git commit -m "feat: add NeteasePlayer component, refactor focus page"
```

---

### Task 7: 专注页主题强化 + 大卫雕塑 fallback

**Files:**
- Modify: `app/focus/page.tsx`

- [ ] **Step 1: 专注页强制经典主题**

在 `app/focus/page.tsx` 顶部 useEffect 中设置主题：

```tsx
useEffect(() => {
  // 专注模式强制经典复古主题
  document.documentElement.setAttribute("data-theme", "classic");
  return () => {
    // 离开时恢复用户选择的主题
    const saved = localStorage.getItem("cinevault-theme") || "classic";
    document.documentElement.setAttribute("data-theme", saved);
  };
}, []);
```

- [ ] **Step 2: 确保大卫雕塑 SVG 组件完好**

`app/focus/page.tsx` 中的 `DavidSculpture` SVG 保持不变（作为 fallback），当真实 PNG 加载失败时显示。

- [ ] **Step 3: 构建 + 提交**

```bash
npx next build 2>&1 | tail -5
git add app/focus/page.tsx
git commit -m "feat: focus page forces classic theme, with theme restore on leave"
```

---

## Phase 5: 最终验证 + 部署

### Task 8: 全量构建 + 部署

- [ ] **Step 1: 完整构建**

```bash
npx next build 2>&1 | tail -30
```
Expected: ✓ Compiled successfully，所有路由正常

- [ ] **Step 2: 部署到 Vercel 生产环境**

需用户确认后：
```bash
vercel --prod --force
```

- [ ] **Step 3: 线上验证**

检查 https://cinevault-app-six.vercel.app：
- 主题切换器可用
- 首页 Hero 随主题变化
- 卡片 3D 倾斜
- 专注模式 `/focus` 正常
- 网易云音景

---

## 文件总览

```
新建 (5):
  components/layout/ThemeProvider.tsx
  components/layout/ThemeSwitcher.tsx
  components/home/HeroBanner.tsx
  components/focus/NeteasePlayer.tsx
  public/sculptures/          (需手动放置大卫 PNG)

修改 (8):
  tailwind.config.ts
  app/globals.css
  app/layout.tsx
  app/page.tsx
  app/focus/page.tsx
  components/shared/ParallaxTilt.tsx
  components/shared/MovieCard.tsx
  components/layout/DesktopSidebar.tsx
```
