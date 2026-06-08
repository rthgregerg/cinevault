# CineVault 电影社区 — 实现计划

> **For agentic workers:** 使用 superpowers:subagent-driven-development 或 superpowers:executing-plans 按任务逐步实现。每个步骤使用 checkbox (`- [ ]`) 跟踪。

**Goal:** 构建一个黑色极简风格的全球电影社区网站（含 PWA 移动端体验），具备电影浏览/搜索/详情、个人标记系统（喜欢/想看/看过/收藏/评分），以及 13 个电影流派的影史探索功能。

**Architecture:** Next.js App Router + Tailwind CSS + localStorage。Mobile First 响应式布局，底部 Tab Bar 导航（手机）→ 左侧导航栏（桌面）。数据层为本地 JSON（~500 部电影 + 13 个流派）。PWA 可安装到手机主屏幕。

**Tech Stack:** Next.js 14+, React 18+, TypeScript, Tailwind CSS 3+, next-pwa (PWA support)

---

## 文件结构总览

```
E:\ai开发\电影网页\
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (metadata, fonts, viewport)
│   ├── page.tsx                  # 首页
│   ├── globals.css               # Tailwind + 自定义全局样式
│   ├── discover/
│   │   └── page.tsx              # 发现页（搜索+筛选+网格）
│   ├── history/
│   │   ├── page.tsx              # 影史流派列表
│   │   └── [movement]/
│   │       └── page.tsx          # 流派详情
│   ├── movie/
│   │   └── [slug]/
│   │       └── page.tsx          # 电影详情
│   ├── likes/
│   │   └── page.tsx              # 喜欢的电影
│   └── profile/
│       └── page.tsx              # 个人中心
├── components/
│   ├── layout/
│   │   ├── BottomTabBar.tsx      # 手机底部 5 项导航
│   │   ├── DesktopSidebar.tsx    # 桌面左侧导航
│   │   └── PageWrapper.tsx       # 页面容器（底部 padding + max-width）
│   ├── home/
│   │   ├── NowShowing.tsx        # 横滑卡片
│   │   ├── TopRated.tsx          # 高分列表
│   │   ├── ComingSoon.tsx        # 即将上映
│   │   └── DailyPick.tsx         # 每日推荐
│   ├── movie/
│   │   ├── MovieHero.tsx         # 全宽海报+渐变遮罩
│   │   ├── MovieInfo.tsx         # 基本信息
│   │   ├── RatingDisplay.tsx     # 星级+分布条
│   │   ├── ActionButtons.tsx     # 喜欢/想看/看过/收藏
│   │   ├── CastSection.tsx       # 演职员
│   │   └── RelatedMovies.tsx     # 相关推荐
│   ├── history/
│   │   ├── MovementCard.tsx      # 流派卡片
│   │   ├── TimelineView.tsx      # 时间线视图
│   │   └── DirectorCard.tsx      # 导演卡片
│   ├── profile/
│   │   ├── StatCards.tsx         # 统计卡片
│   │   └── RatingChart.tsx       # 评分分布图
│   ├── search/
│   │   └── SearchOverlay.tsx     # 全屏搜索（含联想下拉）
│   └── shared/
│       ├── MovieCard.tsx         # 可复用电影卡片
│       ├── MovieGrid.tsx         # 响应式网格容器
│       ├── FilterBar.tsx         # 筛选标签栏
│       ├── EmptyState.tsx        # 空状态
│       ├── LoadingSkeleton.tsx   # 加载骨架屏
│       └── SectionHeader.tsx     # 分区标题
├── data/
│   ├── movies.json               # ~500 部电影
│   └── movements.json            # 13 个流派
├── lib/
│   ├── types.ts                  # TypeScript 类型定义
│   ├── storage.ts                # localStorage 读写
│   ├── search.ts                 # 搜索/筛选/排序
│   └── utils.ts                  # 工具函数
├── public/
│   ├── manifest.json             # PWA Manifest
│   ├── sw.js                     # Service Worker
│   └── icons/                    # App 图标
├── tailwind.config.ts
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## Phase 1: 项目脚手架与配置

### Task 1: 初始化 Next.js 项目

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`

- [ ] **Step 1: 创建项目目录并初始化**

```bash
cd "E:\ai开发\电影网页"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --no-turbopack
```

Expected: Next.js 项目创建成功，出现 `package.json`、`tsconfig.json`、`next.config.js`、`tailwind.config.ts` 等文件。

- [ ] **Step 2: 安装额外依赖**

```bash
cd "E:\ai开发\电影网页"
npm install next-pwa
```

- [ ] **Step 3: 配置 tailwind.config.ts — 黑色主题色彩系统**

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0a0a",
          card: "#141414",
          elevated: "#1a1a1a",
        },
        gold: {
          DEFAULT: "#c8a951",
          light: "#d4b85e",
          dark: "#a88a3a",
        },
        text: {
          primary: "#ffffff",
          secondary: "#9ca3af",
          muted: "#6b7280",
        },
      },
      fontFamily: {
        serif: ["Noto Serif SC", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Geist", "Inter", "sans-serif"],
      },
      borderRadius: {
        card: "8px",
        btn: "4px",
      },
      spacing: {
        section: "48px",
        "section-lg": "64px",
      },
      transitionDuration: {
        DEFAULT: "300ms",
      },
      maxWidth: {
        content: "1280px",
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 4: 配置 next.config.js — PWA + 图片域名**

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    unoptimized: true,
  },
};

module.exports = withPWA(nextConfig);
```

- [ ] **Step 5: 写 globals.css — 全局样式 + Tailwind 指令**

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Serif+SC:wght@400;500;600;700&display=swap');

@layer base {
  * {
    -webkit-tap-highlight-color: transparent;
  }

  body {
    @apply bg-bg text-text-primary font-sans antialiased;
    overscroll-behavior: none;
  }

  /* 自定义滚动条 */
  ::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
  }

  /* 选中色 */
  ::selection {
    background: rgba(200, 169, 81, 0.3);
    color: #fff;
  }
}

@layer components {
  .text-gold-gradient {
    @apply text-gold;
  }

  .card {
    @apply bg-bg-card rounded-card overflow-hidden;
    transition: transform 300ms ease, box-shadow 300ms ease;
  }
  .card:active {
    transform: scale(0.98);
  }
  @media (hover: hover) {
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    }
  }

  .btn-gold {
    @apply bg-gold text-black font-medium rounded-btn px-6 py-3;
    transition: opacity 300ms ease;
  }
  .btn-gold:active {
    opacity: 0.8;
  }
}

@layer utilities {
  .safe-bottom {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
  .safe-top {
    padding-top: env(safe-area-inset-top, 0px);
  }

  /* 渐变遮罩 */
  .mask-bottom {
    mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  }

  .gradient-overlay {
    background: linear-gradient(to top, #0a0a0a 0%, transparent 60%);
  }
}
```

- [ ] **Step 6: 写 root layout.tsx — 元数据 + viewport 配置**

```tsx
// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "CineVault — 极简高级电影社区",
  description: "发现电影之美，探索影史之深",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-180.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CineVault",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "chore: scaffold Next.js project with Tailwind config, dark theme, fonts"
```

---

### Task 2: TypeScript 类型定义与数据模型

**Files:**
- Create: `lib/types.ts`, `data/movies.json`（骨架）, `data/movements.json`（骨架）

- [ ] **Step 1: 写 lib/types.ts — 所有数据模型**

```typescript
// lib/types.ts

/** 电影条目 */
export interface Movie {
  id: string;                 // slug: "the-shawshank-redemption"
  titleZh: string;            // 中文片名
  titleEn: string;            // 英文片名
  year: number;               // 上映年份
  director: string[];         // 导演
  cast: string[];             // 主要演员
  genres: Genre[];            // 类型标签
  region: Region;             // 地区
  language: string;           // 语言
  runtime: number;            // 片长（分钟）
  rating: number;             // 评分 1-10
  ratingCount: number;        // 评分人数
  ratingDistribution: number[]; // 评分分布 [5星%, 4星%, 3星%, 2星%, 1星%]
  synopsis: string;           // 简介（~200字）
  posterUrl: string;          // 海报图片URL
  backdropUrl?: string;       // 背景大图URL
  trailerUrl?: string;        // 预告片URL
  movements: string[];        // 所属流派 ID 列表
  isNowShowing: boolean;      // 是否正在热映
  isComingSoon: boolean;      // 是否即将上映
  releaseDate: string;        // 上映日期 "YYYY-MM-DD"
  tags: string[];             // 特色标签 e.g. ["悬疑", "人性", "经典"]
}

export type Genre =
  | "剧情" | "喜剧" | "动作" | "爱情" | "科幻"
  | "悬疑" | "恐怖" | "动画" | "纪录片" | "战争"
  | "犯罪" | "奇幻" | "冒险" | "历史" | "音乐"
  | "家庭" | "西部" | "黑色电影";

export type Region =
  | "中国大陆" | "中国香港" | "中国台湾"
  | "美国" | "英国" | "法国" | "意大利" | "德国"
  | "日本" | "韩国" | "印度" | "伊朗"
  | "苏联" | "瑞典" | "丹麦" | "西班牙" | "其他";

export interface FilmMovement {
  id: string;                 // slug: "french-new-wave"
  name: string;               // 流派名称
  nameEn: string;             // 英文名
  years: string;              // 年代范围 "1958-1969"
  description: string;        // 简介（~500字）
  keyDirectors: Director[];   // 关键导演
  representativeFilms: string[]; // 代表电影 ID 列表
  styleTags: string[];        // 美学风格标签
  influence: string;          // 对后世影响
  posterCollage: string[];    // 用于卡片拼图的电影 posterUrl（2-3张）
  bannerColor: string;        // Banner 底色
}

export interface Director {
  name: string;
  nameEn: string;
  bio: string;
  avatarUrl: string;
}

/** 用户个人标记 */
export interface UserMark {
  movieId: string;
  liked: boolean;       // ♥ 喜欢
  wantToWatch: boolean; // 📌 想看
  watched: boolean;     // ✓ 看过
  collected: boolean;   // ☆ 收藏
  rating: number;       // 1-5 星，0 表示未评分
  watchedDate?: string; // 看过日期
}

export type SortOption = "popular" | "rating" | "date" | "title";
export type FilterState = {
  genres: Genre[];
  years: [number, number];
  regions: Region[];
  language: string | null;
};
```

- [ ] **Step 2: 创建 data/movies.json 骨架（结构示例）**

```json
[
  {
    "id": "the-shawshank-redemption",
    "titleZh": "肖申克的救赎",
    "titleEn": "The Shawshank Redemption",
    "year": 1994,
    "director": ["弗兰克·德拉邦特"],
    "cast": ["蒂姆·罗宾斯", "摩根·弗里曼"],
    "genres": ["剧情", "犯罪"],
    "region": "美国",
    "language": "英语",
    "runtime": 142,
    "rating": 9.7,
    "ratingCount": 2850000,
    "ratingDistribution": [85, 10, 3, 1, 1],
    "synopsis": "一个 banker 被误判谋杀妻子及其情人，关进肖申克监狱...",
    "posterUrl": "https://img1.doubanio.com/view/photo/l/public/p480747492.jpg",
    "backdropUrl": "https://example.com/backdrop/shawshank.jpg",
    "movements": [],
    "isNowShowing": false,
    "isComingSoon": false,
    "releaseDate": "1994-09-23",
    "tags": ["希望", "自由", "友谊", "经典"]
  }
]
```

- [ ] **Step 3: 创建 data/movements.json 骨架（13 个流派的结构示例）**

```json
[
  {
    "id": "french-new-wave",
    "name": "法国新浪潮",
    "nameEn": "French New Wave",
    "years": "1958-1969",
    "description": "法国新浪潮（La Nouvelle Vague）是影史上最具革命性的电影运动之一。1950年代末，一群以《电影手册》为核心的年轻影评人——包括戈达尔、特吕弗、侯麦、夏布洛尔和里维特——厌倦了法国传统'优质电影'的僵化模式，拿起摄影机走上巴黎街头...",
    "keyDirectors": [
      {
        "name": "让-吕克·戈达尔",
        "nameEn": "Jean-Luc Godard",
        "bio": "法国新浪潮的旗手。以《精疲力尽》一举成名，其跳跃剪辑、打破第四面墙等手法彻底颠覆了电影语法。",
        "avatarUrl": "https://example.com/avatars/godard.jpg"
      }
    ],
    "representativeFilms": ["breathless", "the-400-blows", "hiroshima-mon-amour"],
    "styleTags": ["跳切", "手持摄影", "自然光", "即兴对白", "打破第四面墙", "存在主义"],
    "influence": "法国新浪潮彻底改变了全球电影制作方式，启发了日本新浪潮、新好莱坞、香港新浪潮等后续运动。它的作者论、低成本实景拍摄、即兴创作等理念至今仍在影响独立电影人。",
    "posterCollage": [],
    "bannerColor": "#1a1a2e"
  }
]
```

- [ ] **Step 4: Commit**

```bash
git add lib/types.ts data/movies.json data/movements.json
git commit -m "feat: add TypeScript types, movie data skeleton, movement data skeleton"
```

---

## Phase 2: 基础设施层

### Task 3: localStorage 工具层

**Files:**
- Create: `lib/storage.ts`, `lib/utils.ts`, `lib/search.ts`

- [ ] **Step 1: 写 lib/storage.ts — localStorage 读写**

```typescript
// lib/storage.ts
import type { UserMark } from "./types";

const STORAGE_KEYS = {
  userMarks: "cinevault_user_marks",
} as const;

/** 获取所有用户标记 */
export function getAllMarks(): Record<string, UserMark> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.userMarks);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** 获取单部电影的标记（无标记返回默认值） */
export function getMark(movieId: string): UserMark {
  const marks = getAllMarks();
  return marks[movieId] ?? {
    movieId,
    liked: false,
    wantToWatch: false,
    watched: false,
    collected: false,
    rating: 0,
  };
}

/** 更新单部电影的标记 */
export function setMark(movieId: string, patch: Partial<Omit<UserMark, "movieId">>): UserMark {
  const marks = getAllMarks();
  const current = marks[movieId] ?? {
    movieId,
    liked: false,
    wantToWatch: false,
    watched: false,
    collected: false,
    rating: 0,
  };
  const updated: UserMark = { ...current, ...patch };
  marks[movieId] = updated;
  localStorage.setItem(STORAGE_KEYS.userMarks, JSON.stringify(marks));
  return updated;
}

/** 切换布尔标记（喜欢/想看/看过/收藏） */
export function toggleMark(movieId: string, field: "liked" | "wantToWatch" | "watched" | "collected"): UserMark {
  const current = getMark(movieId);
  const patch: Partial<UserMark> = {
    [field]: !current[field],
    // 取消"看过"时清空评分和日期
    ...(field === "watched" && current.watched
      ? { rating: 0 as number, watchedDate: undefined }
      : {}),
  };
  return setMark(movieId, patch);
}

/** 设置评分 (1-5) */
export function setRating(movieId: string, rating: number): UserMark {
  return setMark(movieId, { rating });
}

/** 获取所有标记了某个字段的电影 ID 列表 */
export function getMarkedMovieIds(field: "liked" | "wantToWatch" | "watched" | "collected"): string[] {
  const marks = getAllMarks();
  return Object.values(marks)
    .filter((m) => m[field])
    .map((m) => m.movieId);
}

/** 清除某部电影的所有标记 */
export function clearMark(movieId: string): void {
  const marks = getAllMarks();
  delete marks[movieId];
  localStorage.setItem(STORAGE_KEYS.userMarks, JSON.stringify(marks));
}
```

- [ ] **Step 2: 写 lib/utils.ts — 工具函数**

```typescript
// lib/utils.ts

/** 评分转换：10分制 → 星级数（1-5 半星） */
export function ratingToStars(rating: number): number {
  return Math.round((rating / 2) * 2) / 2; // 0.5 步进
}

/** 格式化评分人数 */
export function formatRatingCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return `${count}`;
}

/** Slug 化字符串 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/** 随机打乱数组 */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 截断文本 */
export function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "..." : text;
}

/** 按年份范围筛选 */
export function isInYearRange(year: number, range: [number, number]): boolean {
  return year >= range[0] && year <= range[1];
}

/** 生成评分分布条形图数据 */
export function ratingBarPercentages(distribution: number[]): { label: string; pct: number }[] {
  const labels = ["5星", "4星", "3星", "2星", "1星"];
  return distribution.map((pct, i) => ({ label: labels[i], pct }));
}

/** 获取电影海报 URL，兜底为空状态 */
export function posterUrl(movie: { posterUrl?: string }): string {
  return movie.posterUrl || "/placeholder-poster.svg";
}
```

- [ ] **Step 3: 写 lib/search.ts — 搜索与筛选引擎**

```typescript
// lib/search.ts
import type { Movie, FilterState, SortOption, Genre, Region } from "./types";
import moviesData from "@/data/movies.json";

const movies: Movie[] = moviesData as Movie[];

/** 全文搜索（片名/导演/演员） */
export function searchMovies(query: string): Movie[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return movies.filter((m) => {
    const searchText = [
      m.titleZh,
      m.titleEn,
      ...m.director,
      ...m.cast,
      ...m.genres,
    ].join(" ").toLowerCase();
    return searchText.includes(q);
  });
}

/** 搜索联想建议（返回最多 8 条） */
export function getSuggestions(query: string): string[] {
  if (query.trim().length < 1) return [];
  const results = searchMovies(query);
  const suggestions = new Set<string>();
  for (const m of results.slice(0, 15)) {
    suggestions.add(m.titleZh);
    if (m.titleEn) suggestions.add(m.titleEn);
    for (const d of m.director) suggestions.add(d);
  }
  return Array.from(suggestions).slice(0, 8);
}

/** 筛选 + 排序 */
export function filterAndSort(
  filters: Partial<FilterState>,
  sort: SortOption,
): Movie[] {
  let result = [...movies];

  // 类型筛选
  if (filters.genres && filters.genres.length > 0) {
    result = result.filter((m) =>
      filters.genres!.some((g) => m.genres.includes(g))
    );
  }

  // 年代范围筛选
  if (filters.years) {
    result = result.filter((m) =>
      m.year >= filters.years![0] && m.year <= filters.years![1]
    );
  }

  // 地区筛选
  if (filters.regions && filters.regions.length > 0) {
    result = result.filter((m) => filters.regions!.includes(m.region));
  }

  // 语言筛选
  if (filters.language) {
    result = result.filter((m) => m.language === filters.language);
  }

  // 排序
  switch (sort) {
    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;
    case "date":
      result.sort((a, b) => b.year - a.year);
      break;
    case "title":
      result.sort((a, b) => a.titleZh.localeCompare(b.titleZh, "zh"));
      break;
    case "popular":
    default:
      result.sort((a, b) => b.ratingCount - a.ratingCount);
      break;
  }

  return result;
}

/** 获取所有可用的 Genre / Region 列表 */
export function getAllGenres(): Genre[] {
  const set = new Set<Genre>();
  for (const m of movies) {
    for (const g of m.genres) set.add(g);
  }
  return Array.from(set).sort();
}

export function getAllRegions(): Region[] {
  const set = new Set<Region>();
  for (const m of movies) set.add(m.region);
  return Array.from(set).sort();
}

/** 根据 ID 获取单部电影 */
export function getMovieById(id: string): Movie | undefined {
  return movies.find((m) => m.id === id);
}

/** 获取相关推荐（同类型 + 同导演，排除自身，最多 6 部） */
export function getRelatedMovies(movieId: string, count = 6): Movie[] {
  const target = getMovieById(movieId);
  if (!target) return [];

  const scored = movies
    .filter((m) => m.id !== movieId)
    .map((m) => {
      let score = 0;
      // 同类型加分
      const sharedGenres = m.genres.filter((g) => target.genres.includes(g));
      score += sharedGenres.length * 3;
      // 同导演加分
      const sharedDirectors = m.director.filter((d) => target.director.includes(d));
      score += sharedDirectors.length * 5;
      // 同年代加分
      if (Math.abs(m.year - target.year) <= 5) score += 2;
      // 同地区加分
      if (m.region === target.region) score += 1;
      return { movie: m, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, count).map((s) => s.movie);
}

/** 首页 — 正在热映 */
export function getNowShowing(limit = 10): Movie[] {
  return movies.filter((m) => m.isNowShowing).slice(0, limit);
}

/** 首页 — 高分推荐（8.5分以上） */
export function getTopRated(limit = 10): Movie[] {
  return movies
    .filter((m) => m.rating >= 8.5)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

/** 首页 — 即将上映 */
export function getComingSoon(limit = 6): Movie[] {
  return movies.filter((m) => m.isComingSoon).slice(0, limit);
}

/** 首页 — 随机高分冷门（评分高但评分人数少） */
export function getDailyPick(): Movie {
  const pool = movies
    .filter((m) => m.rating >= 8.0 && m.ratingCount < 50000)
    .sort((a, b) => b.rating - a.rating);
  return pool[Math.floor(Math.random() * pool.length)] ?? pool[0];
}

/** 按 ID 列表获取电影 */
export function getMoviesByIds(ids: string[]): Movie[] {
  return ids.map((id) => getMovieById(id)).filter(Boolean) as Movie[];
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/
git commit -m "feat: add localStorage helpers, search engine, utility functions"
```

---

## Phase 3: 共享组件

### Task 4: 共享 UI 组件

**Files:**
- Create: `components/shared/MovieCard.tsx`, `components/shared/MovieGrid.tsx`, `components/shared/FilterBar.tsx`, `components/shared/EmptyState.tsx`, `components/shared/LoadingSkeleton.tsx`, `components/shared/SectionHeader.tsx`

- [ ] **Step 1: MovieCard.tsx — 可复用电影卡片**

```tsx
// components/shared/MovieCard.tsx
import Link from "next/link";
import type { Movie } from "@/lib/types";
import { ratingToStars, posterUrl } from "@/lib/utils";

interface MovieCardProps {
  movie: Movie;
  size?: "sm" | "md" | "lg";
}

export default function MovieCard({ movie, size = "sm" }: MovieCardProps) {
  const posterH = size === "lg" ? "h-64" : size === "md" ? "h-52" : "h-44";

  return (
    <Link href={`/movie/${movie.id}`} className="card block group">
      {/* 海报区域 */}
      <div className={`${posterH} relative overflow-hidden bg-bg-elevated`}>
        <img
          src={posterUrl(movie)}
          alt={movie.titleZh}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* 评分角标 */}
        {movie.rating > 0 && (
          <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-gold text-xs font-medium px-1.5 py-0.5 rounded">
            {movie.rating.toFixed(1)}
          </span>
        )}
        {/* 渐变底边 */}
        <div className="absolute bottom-0 left-0 right-0 h-12 gradient-overlay" />
      </div>

      {/* 信息区 */}
      <div className="p-2.5">
        <h3 className="text-text-primary text-sm font-medium truncate">
          {movie.titleZh}
        </h3>
        <p className="text-text-secondary text-xs mt-0.5 truncate">
          {movie.year} / {movie.director[0]}
        </p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: MovieGrid.tsx — 响应式网格容器**

```tsx
// components/shared/MovieGrid.tsx
import type { Movie } from "@/lib/types";
import MovieCard from "./MovieCard";
import EmptyState from "./EmptyState";

interface MovieGridProps {
  movies: Movie[];
  emptyMessage?: string;
  cardSize?: "sm" | "md" | "lg";
}

export default function MovieGrid({
  movies,
  emptyMessage = "暂无电影",
  cardSize = "sm",
}: MovieGridProps) {
  if (movies.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} size={cardSize} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: FilterBar.tsx — 筛选标签栏**

```tsx
// components/shared/FilterBar.tsx
"use client";
import { useState } from "react";
import type { Genre, Region, SortOption } from "@/lib/types";

interface FilterBarProps {
  genres: Genre[];
  regions: Region[];
  activeGenres: Genre[];
  activeRegions: Region[];
  activeSort: SortOption;
  yearRange: [number, number];
  onGenreToggle: (g: Genre) => void;
  onRegionToggle: (r: Region) => void;
  onSortChange: (s: SortOption) => void;
  onYearChange: (range: [number, number]) => void;
  onClearAll: () => void;
}

export default function FilterBar({
  genres, regions, activeGenres, activeRegions,
  activeSort, yearRange, onGenreToggle, onRegionToggle,
  onSortChange, onYearChange, onClearAll,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);
  const hasFilters = activeGenres.length > 0 || activeRegions.length > 0
    || yearRange[0] !== 1900 || yearRange[1] !== 2030;

  return (
    <div className="space-y-3">
      {/* 排序一行 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {( ["popular", "rating", "date", "title"] as SortOption[] ).map((opt) => (
          <button
            key={opt}
            onClick={() => onSortChange(opt)}
            className={`shrink-0 px-3 py-1.5 text-xs rounded-full border transition-colors
              ${activeSort === opt
                ? "border-gold text-gold bg-gold/10"
                : "border-white/10 text-text-secondary hover:border-white/30"
              }`}
          >
            {opt === "popular" && "热门"}
            {opt === "rating" && "评分最高"}
            {opt === "date" && "最新"}
            {opt === "title" && "片名"}
          </button>
        ))}
        <button
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 px-3 py-1.5 text-xs rounded-full border border-white/10 text-text-secondary"
        >
          筛选 {expanded ? "▲" : "▼"}
        </button>
        {hasFilters && (
          <button onClick={onClearAll} className="shrink-0 text-xs text-gold ml-auto">
            清除
          </button>
        )}
      </div>

      {/* 展开的筛选区 */}
      {expanded && (
        <div className="space-y-3 p-3 bg-bg-card rounded-card animate-in fade-in">
          {/* 类型 */}
          <div>
            <p className="text-text-muted text-xs mb-2">类型</p>
            <div className="flex flex-wrap gap-1.5">
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => onGenreToggle(g)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors
                    ${activeGenres.includes(g)
                      ? "border-gold text-gold bg-gold/10"
                      : "border-white/10 text-text-secondary"
                    }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* 地区 */}
          <div>
            <p className="text-text-muted text-xs mb-2">地区</p>
            <div className="flex flex-wrap gap-1.5">
              {regions.map((r) => (
                <button
                  key={r}
                  onClick={() => onRegionToggle(r)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors
                    ${activeRegions.includes(r)
                      ? "border-gold text-gold bg-gold/10"
                      : "border-white/10 text-text-secondary"
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 年代滑块 */}
          <div>
            <p className="text-text-muted text-xs mb-2">
              年代：{yearRange[0]} - {yearRange[1]}
            </p>
            <div className="flex gap-4">
              <input
                type="range" min={1900} max={2030} value={yearRange[0]}
                onChange={(e) => onYearChange([+e.target.value, yearRange[1]])}
                className="flex-1 accent-gold"
              />
              <input
                type="range" min={1900} max={2030} value={yearRange[1]}
                onChange={(e) => onYearChange([yearRange[0], +e.target.value])}
                className="flex-1 accent-gold"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: EmptyState.tsx + LoadingSkeleton.tsx + SectionHeader.tsx**

```tsx
// components/shared/EmptyState.tsx
export default function EmptyState({ message = "暂无内容" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-text-muted">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-4 opacity-40">
        <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 14h40" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="11" r="1.5" fill="currentColor" />
        <circle cx="17" cy="11" r="1.5" fill="currentColor" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}
```

```tsx
// components/shared/LoadingSkeleton.tsx
export default function LoadingSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-bg-card rounded-card overflow-hidden animate-pulse">
          <div className="h-44 bg-bg-elevated" />
          <div className="p-2.5 space-y-2">
            <div className="h-3 bg-bg-elevated rounded w-3/4" />
            <div className="h-2.5 bg-bg-elevated rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

```tsx
// components/shared/SectionHeader.tsx
import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  href?: string;
}

export default function SectionHeader({ title, subtitle, href }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold text-text-primary font-display">{title}</h2>
        {subtitle && <p className="text-text-muted text-xs mt-0.5">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="text-gold text-xs hover:underline shrink-0">
          查看全部 →
        </Link>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/shared/
git commit -m "feat: add shared UI components — MovieCard, MovieGrid, FilterBar, EmptyState, LoadingSkeleton, SectionHeader"
```

---

### Task 5: 导航系统 — BottomTabBar + DesktopSidebar

**Files:**
- Create: `components/layout/BottomTabBar.tsx`, `components/layout/DesktopSidebar.tsx`, `components/layout/PageWrapper.tsx`

- [ ] **Step 1: 生成 Tab SVG 图标**

```tsx
// components/layout/BottomTabBar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "首页", href: "/", icon: HomeIcon },
  { label: "发现", href: "/discover", icon: SearchIcon },
  { label: "影史", href: "/history", icon: HistoryIcon },
  { label: "喜欢", href: "/likes", icon: HeartIcon },
  { label: "我的", href: "/profile", icon: ProfileIcon },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-lg border-t border-white/5 safe-bottom lg:hidden">
      <div className="flex items-center justify-around h-14 max-w-content mx-auto">
        {tabs.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[44px] transition-colors
                ${active ? "text-gold" : "text-text-muted hover:text-text-secondary"}`}
            >
              <Icon active={active} />
              <span className="text-[10px] leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** 首页图标 */
function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c8a951" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

/** 发现图标 */
function SearchIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c8a951" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/** 影史图标 — 胶片框 */
function HistoryIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c8a951" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <line x1="2" y1="8" x2="22" y2="8" />
      <line x1="2" y1="16" x2="22" y2="16" />
      <line x1="8" y1="4" x2="8" y2="20" />
      <line x1="16" y1="4" x2="16" y2="20" />
    </svg>
  );
}

/** 喜欢图标 — 心形 */
function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#c8a951" : "none"} stroke={active ? "#c8a951" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

/** 我的图标 */
function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#c8a951" : "#6b7280"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
```

- [ ] **Step 2: DesktopSidebar.tsx — 桌面端左侧导航**

```tsx
// components/layout/DesktopSidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "首页", href: "/" },
  { label: "发现", href: "/discover" },
  { label: "影史", href: "/history" },
  { label: "喜欢", href: "/likes" },
  { label: "我的", href: "/profile" },
];

export default function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-56 bg-bg/80 backdrop-blur-lg border-r border-white/5 px-6 py-8">
      {/* Logo */}
      <Link href="/" className="mb-12">
        <h1 className="text-xl font-display font-semibold text-gold tracking-wider">
          CineVault
        </h1>
      </Link>

      {/* Nav Links */}
      <nav className="flex flex-col gap-2">
        {navItems.map(({ label, href }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2.5 rounded-btn text-sm transition-all
                ${active
                  ? "bg-gold/10 text-gold font-medium"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
                }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto">
        <p className="text-text-muted text-xs">© 2026 CineVault</p>
        <p className="text-text-muted text-xs mt-1">探索电影之美</p>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: PageWrapper.tsx — 页面容器**

```tsx
// components/layout/PageWrapper.tsx
import type { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  withPadding?: boolean;
}

export default function PageWrapper({ children, withPadding = true }: PageWrapperProps) {
  return (
    <main
      className={`min-h-screen lg:ml-56 pb-20 lg:pb-0 ${
        withPadding ? "px-4 md:px-6 lg:px-8" : ""
      } max-w-content mx-auto`}
    >
      {children}
    </main>
  );
}
```

- [ ] **Step 4: 将导航集成到 layout.tsx 的 body 中**

在 `app/layout.tsx` 的 `<body>` 内，更新为：

```tsx
// app/layout.tsx — 更新 body 内容
import BottomTabBar from "@/components/layout/BottomTabBar";
import DesktopSidebar from "@/components/layout/DesktopSidebar";

// ... 其他 imports 不变 ...

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        <DesktopSidebar />
        {children}
        <BottomTabBar />
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/layout/ app/layout.tsx
git commit -m "feat: add BottomTabBar (mobile), DesktopSidebar (desktop), PageWrapper"
```

---

## Phase 4: 主要页面

### Task 6: 首页 — 热映 + 高分 + 即将 + 每日推荐

**Files:**
- Create: `components/home/NowShowing.tsx`, `components/home/TopRated.tsx`, `components/home/ComingSoon.tsx`, `components/home/DailyPick.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: NowShowing.tsx — 横滑卡片**

```tsx
// components/home/NowShowing.tsx
"use client";
import { useRef } from "react";
import MovieCard from "@/components/shared/MovieCard";
import SectionHeader from "@/components/shared/SectionHeader";
import type { Movie } from "@/lib/types";

export default function NowShowing({ movies }: { movies: Movie[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="mb-section">
      <SectionHeader title="正在热映" subtitle="Now Showing" />
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar -mx-4 px-4"
      >
        {movies.map((movie) => (
          <div key={movie.id} className="snap-start shrink-0 w-36">
            <MovieCard movie={movie} size="sm" />
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: TopRated.tsx — 高分竖排列表**

```tsx
// components/home/TopRated.tsx
import Link from "next/link";
import SectionHeader from "@/components/shared/SectionHeader";
import type { Movie } from "@/lib/types";
import { ratingToStars, posterUrl } from "@/lib/utils";

export default function TopRated({ movies }: { movies: Movie[] }) {
  return (
    <section className="mb-section">
      <SectionHeader title="本周高分" subtitle="Top Rated This Week" href="/discover?sort=rating" />

      <div className="space-y-2">
        {movies.map((movie, i) => (
          <Link
            key={movie.id}
            href={`/movie/${movie.id}`}
            className="flex items-center gap-3 p-2.5 bg-bg-card rounded-card hover:bg-bg-elevated transition-colors group"
          >
            {/* 排名 */}
            <span className={`w-6 text-center text-sm font-display font-semibold shrink-0
              ${i < 3 ? "text-gold" : "text-text-muted"}`}
            >
              {i + 1}
            </span>

            {/* 缩略海报 */}
            <div className="w-10 h-14 rounded overflow-hidden shrink-0 bg-bg-elevated">
              <img
                src={posterUrl(movie)}
                alt={movie.titleZh}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* 信息 */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-text-primary truncate">
                {movie.titleZh}
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                {movie.year} / {movie.director[0]}
              </p>
            </div>

            {/* 评分 */}
            <span className="text-gold text-sm font-semibold font-display shrink-0">
              {movie.rating.toFixed(1)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: ComingSoon.tsx + DailyPick.tsx**

```tsx
// components/home/ComingSoon.tsx
import MovieCard from "@/components/shared/MovieCard";
import SectionHeader from "@/components/shared/SectionHeader";
import type { Movie } from "@/lib/types";

export default function ComingSoon({ movies }: { movies: Movie[] }) {
  return (
    <section className="mb-section">
      <SectionHeader title="即将上映" subtitle="Coming Soon" />
      <div className="grid grid-cols-3 md:grid-cols-3 gap-3">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} size="sm" />
        ))}
      </div>
    </section>
  );
}
```

```tsx
// components/home/DailyPick.tsx
import Link from "next/link";
import type { Movie } from "@/lib/types";
import { posterUrl } from "@/lib/utils";

export default function DailyPick({ movie }: { movie: Movie }) {
  return (
    <Link href={`/movie/${movie.id}`}>
      <section className="relative mb-section rounded-card overflow-hidden h-48 group cursor-pointer">
        {/* 背景图 */}
        <img
          src={posterUrl(movie)}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110 opacity-40 group-hover:opacity-60 transition-opacity duration-500"
        />
        {/* 渐变遮罩 + 文字 */}
        <div className="absolute inset-0 gradient-overlay" />
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <p className="text-gold text-xs font-medium tracking-wider mb-1">
            ✦ 今日推荐 · Daily Pick
          </p>
          <h2 className="text-white text-xl font-display font-semibold">
            {movie.titleZh}
          </h2>
          <p className="text-text-secondary text-xs mt-1 line-clamp-2">
            {movie.synopsis}
          </p>
          <p className="text-gold text-sm font-semibold mt-2">
            {movie.rating.toFixed(1)}
          </p>
        </div>
      </section>
    </Link>
  );
}
```

- [ ] **Step 4: app/page.tsx — 组装首页**

```tsx
// app/page.tsx
import PageWrapper from "@/components/layout/PageWrapper";
import NowShowing from "@/components/home/NowShowing";
import TopRated from "@/components/home/TopRated";
import ComingSoon from "@/components/home/ComingSoon";
import DailyPick from "@/components/home/DailyPick";
import {
  getNowShowing,
  getTopRated,
  getComingSoon,
  getDailyPick,
} from "@/lib/search";

export default function HomePage() {
  const nowShowing = getNowShowing(10);
  const topRated = getTopRated(10);
  const comingSoon = getComingSoon(6);
  const dailyPick = getDailyPick();

  return (
    <PageWrapper>
      <div className="pt-6 lg:pt-10">
        {dailyPick && <DailyPick movie={dailyPick} />}
        {nowShowing.length > 0 && <NowShowing movies={nowShowing} />}
        {topRated.length > 0 && <TopRated movies={topRated} />}
        {comingSoon.length > 0 && <ComingSoon movies={comingSoon} />}
      </div>
    </PageWrapper>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/home/ app/page.tsx
git commit -m "feat: add Home page with NowShowing, TopRated, ComingSoon, DailyPick sections"
```

---

### Task 7: 发现页（搜索 + 筛选 + 网格）

**Files:**
- Create: `app/discover/page.tsx`

- [ ] **Step 1: 发现页 — 客户端组件，含筛选和网格**

```tsx
// app/discover/page.tsx
"use client";
import { useState, useEffect, useMemo } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import MovieGrid from "@/components/shared/MovieGrid";
import FilterBar from "@/components/shared/FilterBar";
import LoadingSkeleton from "@/components/shared/LoadingSkeleton";
import SearchOverlay from "@/components/search/SearchOverlay";
import type { Genre, Region, SortOption, FilterState, Movie } from "@/lib/types";
import { filterAndSort, getAllGenres, getAllRegions } from "@/lib/search";

const ITEMS_PER_PAGE = 20;

export default function DiscoverPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showSearch, setShowSearch] = useState(false);

  // 筛选状态
  const [sort, setSort] = useState<SortOption>("popular");
  const [activeGenres, setActiveGenres] = useState<Genre[]>([]);
  const [activeRegions, setActiveRegions] = useState<Region[]>([]);
  const [yearRange, setYearRange] = useState<[number, number]>([1900, 2030]);

  const genres = useMemo(() => getAllGenres(), []);
  const regions = useMemo(() => getAllRegions(), []);

  // 筛选 + 排序
  const filtered = useMemo(() => {
    return filterAndSort({
      genres: activeGenres.length > 0 ? activeGenres : undefined,
      regions: activeRegions.length > 0 ? activeRegions : undefined,
      years: yearRange,
    }, sort);
  }, [sort, activeGenres, activeRegions, yearRange]);

  // 分页
  const paginatedMovies = useMemo(() => {
    return filtered.slice(0, page * ITEMS_PER_PAGE);
  }, [filtered, page]);

  const hasMore = paginatedMovies.length < filtered.length;

  useEffect(() => {
    setMovies(paginatedMovies);
    setLoading(false);
  }, [paginatedMovies]);

  // 重置分页当筛选变化
  useEffect(() => {
    setPage(1);
  }, [sort, activeGenres, activeRegions, yearRange]);

  const toggleGenre = (g: Genre) => {
    setActiveGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const toggleRegion = (r: Region) => {
    setActiveRegions((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  const clearAll = () => {
    setActiveGenres([]);
    setActiveRegions([]);
    setYearRange([1900, 2030]);
    setSort("popular");
  };

  return (
    <PageWrapper>
      <div className="pt-4 lg:pt-8">
        {/* 搜索栏 */}
        <div className="mb-4">
          <button
            onClick={() => setShowSearch(true)}
            className="w-full flex items-center gap-2 px-4 py-3 bg-bg-card rounded-card border border-white/5 text-text-muted text-sm hover:border-white/10 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            搜索电影、导演、演员...
          </button>
        </div>

        {/* 筛选栏 */}
        <FilterBar
          genres={genres}
          regions={regions}
          activeGenres={activeGenres}
          activeRegions={activeRegions}
          activeSort={sort}
          yearRange={yearRange}
          onGenreToggle={toggleGenre}
          onRegionToggle={toggleRegion}
          onSortChange={setSort}
          onYearChange={setYearRange}
          onClearAll={clearAll}
        />

        {/* 结果计数 */}
        <p className="text-text-muted text-xs my-3">
          共 {filtered.length} 部
        </p>

        {/* 网格 */}
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <MovieGrid movies={paginatedMovies} emptyMessage="没有找到匹配的电影" />

            {/* 加载更多 */}
            {hasMore && (
              <div className="flex justify-center mt-8 mb-4">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-8 py-2.5 border border-white/10 rounded-full text-text-secondary text-sm hover:border-gold hover:text-gold transition-colors"
                >
                  加载更多
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 搜索浮层 */}
      {showSearch && <SearchOverlay onClose={() => setShowSearch(false)} />}
    </PageWrapper>
  );
}
```

- [ ] **Step 2: SearchOverlay.tsx — 全屏搜索浮层**

```tsx
// components/search/SearchOverlay.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { Movie } from "@/lib/types";
import { getSuggestions, searchMovies } from "@/lib/search";

interface SearchOverlayProps {
  onClose: () => void;
}

export default function SearchOverlay({ onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [results, setResults] = useState<Movie[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.trim().length > 0) {
      setSuggestions(getSuggestions(query));
    } else {
      setSuggestions([]);
      setResults([]);
    }
  }, [query]);

  const handleSearch = (q: string) => {
    setSearching(true);
    setResults(searchMovies(q));
    setSuggestions([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col animate-in fade-in">
      {/* 搜索头部 */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSearching(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleSearch(query); }}
          placeholder="搜索电影、导演、演员..."
          className="flex-1 bg-transparent text-text-primary text-base placeholder:text-text-muted outline-none"
        />
        <button onClick={onClose} className="text-text-muted text-sm hover:text-text-primary transition-colors">
          取消
        </button>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto px-4">
        {/* 联想建议 */}
        {!searching && suggestions.length > 0 && (
          <div className="py-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => { setQuery(s); handleSearch(s); }}
                className="block w-full text-left px-3 py-2.5 text-text-secondary text-sm hover:bg-bg-card rounded-btn transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* 搜索结果 */}
        {searching && (
          <div className="py-4">
            <p className="text-text-muted text-xs mb-3">
              搜索"{query}" — 共 {results.length} 个结果
            </p>
            {results.length === 0 ? (
              <div className="text-center py-20 text-text-muted text-sm">
                未找到相关电影
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((movie) => (
                  <Link
                    key={movie.id}
                    href={`/movie/${movie.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2.5 bg-bg-card rounded-card hover:bg-bg-elevated transition-colors"
                  >
                    <div className="w-10 h-14 rounded overflow-hidden shrink-0 bg-bg-elevated">
                      <img src={movie.posterUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{movie.titleZh}</p>
                      <p className="text-xs text-text-muted">{movie.year} / {movie.director[0]}</p>
                    </div>
                    <span className="text-gold text-sm font-semibold">{movie.rating.toFixed(1)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/discover/ components/search/
git commit -m "feat: add Discover page with filters, sorting, pagination, and search overlay"
```

---

### Task 8: 电影详情页

**Files:**
- Create: `components/movie/MovieHero.tsx`, `components/movie/MovieInfo.tsx`, `components/movie/RatingDisplay.tsx`, `components/movie/ActionButtons.tsx`, `components/movie/CastSection.tsx`, `components/movie/RelatedMovies.tsx`
- Create: `app/movie/[slug]/page.tsx`

- [ ] **Step 1: MovieHero.tsx — 全宽海报 + 渐变遮罩**

```tsx
// components/movie/MovieHero.tsx
import { posterUrl } from "@/lib/utils";
import type { Movie } from "@/lib/types";

export default function MovieHero({ movie }: { movie: Movie }) {
  return (
    <div className="relative -mx-4 md:-mx-6 lg:-mx-8 h-[420px] md:h-[500px] lg:h-[400px] overflow-hidden">
      {/* 背景海报 */}
      <img
        src={movie.backdropUrl || posterUrl(movie)}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* 渐变叠加层 */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg/80 via-transparent to-transparent hidden lg:block" />

      {/* 底部信息叠加 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8 lg:max-w-lg">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-semibold text-white leading-tight">
          {movie.titleZh}
        </h1>
        <p className="text-text-secondary text-sm mt-1">{movie.titleEn}</p>
        <div className="flex items-center gap-2 mt-2">
          {movie.genres.slice(0, 3).map((g) => (
            <span key={g} className="text-xs px-2 py-0.5 rounded-full border border-white/20 text-text-secondary">
              {g}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: RatingDisplay.tsx — 星级 + 评分分布条**

```tsx
// components/movie/RatingDisplay.tsx
import { ratingToStars, formatRatingCount, ratingBarPercentages } from "@/lib/utils";

interface RatingDisplayProps {
  rating: number;
  ratingCount: number;
  distribution: number[];
}

export default function RatingDisplay({ rating, ratingCount, distribution }: RatingDisplayProps) {
  const bars = ratingBarPercentages(distribution);

  return (
    <div className="bg-bg-card rounded-card p-4">
      <div className="flex items-center gap-4">
        {/* 大评分数字 */}
        <div className="text-center">
          <span className="text-3xl font-display font-bold text-gold">{rating.toFixed(1)}</span>
        </div>

        {/* 星级 */}
        <div className="flex-1">
          <StarRow stars={ratingToStars(rating)} />
          <p className="text-text-muted text-xs mt-1">{formatRatingCount(ratingCount)} 人评分</p>
        </div>
      </div>

      {/* 分布条 */}
      <div className="mt-4 space-y-1">
        {bars.map((bar) => (
          <div key={bar.label} className="flex items-center gap-2">
            <span className="text-text-muted text-xs w-5">{bar.label}</span>
            <div className="flex-1 h-1.5 bg-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-gold/60 rounded-full transition-all"
                style={{ width: `${bar.pct}%` }}
              />
            </div>
            <span className="text-text-muted text-xs w-8 text-right">{bar.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StarRow({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = stars >= n ? "100%" : stars >= n - 0.5 ? "50%" : "0%";
        return (
          <svg key={n} width="16" height="16" viewBox="0 0 24 24">
            <defs>
              <linearGradient id={`half-${n}-${stars}`}>
                <stop offset={fill} stopColor="#c8a951" />
                <stop offset={fill} stopColor="#333" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={`url(#half-${n}-${stars})`}
            />
          </svg>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: ActionButtons.tsx — 喜欢/想看/看过/收藏**

```tsx
// components/movie/ActionButtons.tsx
"use client";
import { useState, useEffect } from "react";
import { getMark, toggleMark, setRating } from "@/lib/storage";

interface ActionButtonsProps {
  movieId: string;
}

export default function ActionButtons({ movieId }: ActionButtonsProps) {
  const [mark, setMark] = useState(getMark(movieId));

  // 当 movieId 变化时重新读取
  useEffect(() => { setMark(getMark(movieId)); }, [movieId]);

  const handleToggle = (field: "liked" | "wantToWatch" | "watched" | "collected") => {
    const updated = toggleMark(movieId, field);
    setMark(updated);
  };

  const handleRating = (r: number) => {
    const updated = setRating(movieId, r);
    setMark(updated);
  };

  const buttons = [
    { field: "liked" as const, label: "喜欢", activeLabel: "已喜欢", icon: "♥" },
    { field: "wantToWatch" as const, label: "想看", activeLabel: "想看", icon: "📌" },
    { field: "watched" as const, label: "看过", activeLabel: "已看", icon: "✓" },
    { field: "collected" as const, label: "收藏", activeLabel: "已收藏", icon: "☆" },
  ];

  return (
    <div className="space-y-3">
      {/* 操作按钮行 */}
      <div className="flex gap-2">
        {buttons.map(({ field, label, activeLabel, icon }) => (
          <button
            key={field}
            onClick={() => handleToggle(field)}
            className={`flex-1 py-2.5 text-xs font-medium rounded-btn border transition-all
              ${mark[field]
                ? "border-gold bg-gold/10 text-gold"
                : "border-white/10 text-text-secondary hover:border-white/20"
              }`}
          >
            <span className="mr-1">{icon}</span>
            {mark[field] ? activeLabel : label}
          </button>
        ))}
      </div>

      {/* 评分行 — 仅「看过」时可见 */}
      {mark.watched && (
        <div className="flex items-center gap-2 px-1">
          <span className="text-xs text-text-muted shrink-0">我的评分</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => handleRating(n)}
                className={`text-lg transition-colors ${
                  n <= mark.rating ? "text-gold" : "text-text-muted/30"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: CastSection.tsx + RelatedMovies.tsx**

```tsx
// components/movie/CastSection.tsx
import type { Movie } from "@/lib/types";

export default function CastSection({ movie }: { movie: Movie }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-text-primary font-display mb-3">
        演职员
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex">
          <span className="text-text-muted w-16 shrink-0">导演</span>
          <span className="text-text-primary">{movie.director.join(" / ")}</span>
        </div>
        <div className="flex">
          <span className="text-text-muted w-16 shrink-0">主演</span>
          <span className="text-text-primary">{movie.cast.slice(0, 10).join(" / ")}</span>
        </div>
        <div className="flex">
          <span className="text-text-muted w-16 shrink-0">类型</span>
          <span className="text-text-primary">{movie.genres.join(" / ")}</span>
        </div>
        <div className="flex">
          <span className="text-text-muted w-16 shrink-0">地区</span>
          <span className="text-text-primary">{movie.region}</span>
        </div>
        <div className="flex">
          <span className="text-text-muted w-16 shrink-0">语言</span>
          <span className="text-text-primary">{movie.language}</span>
        </div>
        <div className="flex">
          <span className="text-text-muted w-16 shrink-0">片长</span>
          <span className="text-text-primary">{movie.runtime}分钟</span>
        </div>
        <div className="flex">
          <span className="text-text-muted w-16 shrink-0">上映</span>
          <span className="text-text-primary">{movie.releaseDate}</span>
        </div>
      </div>
    </div>
  );
}
```

```tsx
// components/movie/RelatedMovies.tsx
import SectionHeader from "@/components/shared/SectionHeader";
import MovieGrid from "@/components/shared/MovieGrid";
import { getRelatedMovies } from "@/lib/search";

export default function RelatedMovies({ movieId }: { movieId: string }) {
  const related = getRelatedMovies(movieId, 6);

  if (related.length === 0) return null;

  return (
    <section className="mt-section">
      <SectionHeader title="相关推荐" subtitle="你可能也会喜欢" />
      <MovieGrid movies={related} />
    </section>
  );
}
```

- [ ] **Step 5: app/movie/[slug]/page.tsx — 组装详情页**

```tsx
// app/movie/[slug]/page.tsx
import { notFound } from "next/navigation";
import PageWrapper from "@/components/layout/PageWrapper";
import MovieHero from "@/components/movie/MovieHero";
import RatingDisplay from "@/components/movie/RatingDisplay";
import ActionButtons from "@/components/movie/ActionButtons";
import CastSection from "@/components/movie/CastSection";
import RelatedMovies from "@/components/movie/RelatedMovies";
import { getMovieById } from "@/lib/search";
import Link from "next/link";

interface Props {
  params: { slug: string };
}

export default function MovieDetailPage({ params }: Props) {
  const movie = getMovieById(params.slug);

  if (!movie) notFound();

  return (
    <PageWrapper withPadding={false}>
      <MovieHero movie={movie} />

      <div className="px-4 md:px-6 lg:px-8 lg:grid lg:grid-cols-3 lg:gap-8">
        {/* 左侧 — 信息区 */}
        <div className="lg:col-span-2 space-y-6 py-4">
          {/* 操作按钮 */}
          <ActionButtons movieId={movie.id} />

          {/* 简介 */}
          <div>
            <h3 className="text-base font-semibold text-text-primary font-display mb-2">剧情简介</h3>
            <p className="text-text-secondary text-sm leading-relaxed">{movie.synopsis}</p>
          </div>

          {/* 演职员 */}
          <CastSection movie={movie} />

          {/* 所属流派 */}
          {movie.movements.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-text-primary font-display mb-2">所属流派</h3>
              <div className="flex flex-wrap gap-2">
                {movie.movements.map((mid) => (
                  <Link
                    key={mid}
                    href={`/history/${mid}`}
                    className="px-3 py-1.5 text-xs rounded-full border border-gold/30 text-gold hover:bg-gold/10 transition-colors"
                  >
                    {mid}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 标签 */}
          <div className="flex flex-wrap gap-1.5">
            {movie.tags.map((t) => (
              <span key={t} className="px-2.5 py-1 text-xs bg-bg-card rounded-full text-text-muted">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* 右侧 — 评分卡片（桌面端侧边） */}
        <div className="lg:col-span-1 pb-4 lg:pt-4">
          <div className="lg:sticky lg:top-8">
            <RatingDisplay
              rating={movie.rating}
              ratingCount={movie.ratingCount}
              distribution={movie.ratingDistribution}
            />
          </div>
        </div>
      </div>

      {/* 相关推荐（桌面端全宽） */}
      <div className="px-4 md:px-6 lg:px-8">
        <RelatedMovies movieId={movie.id} />
      </div>

      {/* 底部留白 */}
      <div className="h-8" />
    </PageWrapper>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add components/movie/ app/movie/
git commit -m "feat: add Movie Detail page with hero, rating, action buttons, cast, related movies"
```

---

### Task 9: 喜欢页 + 个人中心

**Files:**
- Create: `app/likes/page.tsx`, `app/profile/page.tsx`, `components/profile/StatCards.tsx`, `components/profile/RatingChart.tsx`

- [ ] **Step 1: app/likes/page.tsx — 喜欢列表**

```tsx
// app/likes/page.tsx
"use client";
import { useState, useEffect } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import MovieGrid from "@/components/shared/MovieGrid";
import EmptyState from "@/components/shared/EmptyState";
import { getMarkedMovieIds, getMark } from "@/lib/storage";
import { getMoviesByIds } from "@/lib/search";
import type { Movie } from "@/lib/types";

export default function LikesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = getMarkedMovieIds("liked");
    setMovies(getMoviesByIds(ids));
    setLoading(false);
  }, []);

  return (
    <PageWrapper>
      <div className="pt-6 lg:pt-10">
        <h1 className="text-xl font-display font-semibold text-text-primary mb-1">
          ♥ 我的喜欢
        </h1>
        <p className="text-text-muted text-sm mb-6">你标记为喜欢的电影</p>

        {loading ? null : movies.length === 0 ? (
          <EmptyState message="还没有喜欢的电影，去发现页逛逛吧" />
        ) : (
          <MovieGrid movies={movies} />
        )}
      </div>
    </PageWrapper>
  );
}
```

- [ ] **Step 2: StatCards.tsx + RatingChart.tsx**

```tsx
// components/profile/StatCards.tsx
interface StatCardsProps {
  watched: number;
  wantToWatch: number;
  collected: number;
  liked: number;
}

export default function StatCards({ watched, wantToWatch, collected, liked }: StatCardsProps) {
  const stats = [
    { label: "看过", value: watched },
    { label: "想看", value: wantToWatch },
    { label: "收藏", value: collected },
    { label: "喜欢", value: liked },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map(({ label, value }) => (
        <div key={label} className="bg-bg-card rounded-card p-3 text-center">
          <span className="text-xl font-display font-semibold text-gold block">{value}</span>
          <span className="text-xs text-text-muted mt-1 block">{label}</span>
        </div>
      ))}
    </div>
  );
}
```

```tsx
// components/profile/RatingChart.tsx
"use client";
import { useEffect, useState } from "react";
import { getAllMarks } from "@/lib/storage";

export default function RatingChart() {
  const [distribution, setDistribution] = useState([0, 0, 0, 0, 0]); // 1-5星

  useEffect(() => {
    const marks = getAllMarks();
    const dist = [0, 0, 0, 0, 0];
    for (const mark of Object.values(marks)) {
      if (mark.rating >= 1 && mark.rating <= 5) {
        dist[mark.rating - 1]++;
      }
    }
    setDistribution(dist);
  }, []);

  const max = Math.max(...distribution, 1);

  return (
    <div className="bg-bg-card rounded-card p-4">
      <h3 className="text-sm font-semibold text-text-primary mb-3">评分分布</h3>
      <div className="space-y-1.5">
        {distribution.map((count, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-text-muted w-6 text-right">{5 - i}★</span>
            <div className="flex-1 h-2 bg-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-gold/60 rounded-full transition-all"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
            <span className="text-xs text-text-muted w-6">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: app/profile/page.tsx — 个人中心**

```tsx
// app/profile/page.tsx
"use client";
import { useState, useEffect } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import StatCards from "@/components/profile/StatCards";
import RatingChart from "@/components/profile/RatingChart";
import MovieGrid from "@/components/shared/MovieGrid";
import { getMarkedMovieIds, getMark } from "@/lib/storage";
import { getMoviesByIds } from "@/lib/search";
import type { Movie } from "@/lib/types";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"watched" | "wantToWatch" | "collected" | "liked">("watched");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [watched, setWatched] = useState(0);
  const [wantToWatch, setWantToWatch] = useState(0);
  const [collected, setCollected] = useState(0);
  const [liked, setLiked] = useState(0);

  useEffect(() => {
    setWatched(getMarkedMovieIds("watched").length);
    setWantToWatch(getMarkedMovieIds("wantToWatch").length);
    setCollected(getMarkedMovieIds("collected").length);
    setLiked(getMarkedMovieIds("liked").length);
  }, []);

  useEffect(() => {
    const ids = getMarkedMovieIds(activeTab);
    setMovies(getMoviesByIds(ids));
  }, [activeTab]);

  const tabs = [
    { key: "watched" as const, label: "看过" },
    { key: "wantToWatch" as const, label: "想看" },
    { key: "collected" as const, label: "收藏" },
    { key: "liked" as const, label: "喜欢" },
  ];

  return (
    <PageWrapper>
      <div className="pt-6 lg:pt-10">
        <h1 className="text-xl font-display font-semibold text-text-primary mb-1">
          我的
        </h1>
        <p className="text-text-muted text-sm mb-6">观影记录与统计</p>

        {/* 统计卡片 */}
        <StatCards
          watched={watched}
          wantToWatch={wantToWatch}
          collected={collected}
          liked={liked}
        />

        {/* 评分分布 */}
        <div className="mt-4">
          <RatingChart />
        </div>

        {/* Tab 切换 */}
        <div className="flex gap-2 mt-6 mb-4 overflow-x-auto">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`shrink-0 px-4 py-2 text-sm rounded-full border transition-colors
                ${activeTab === key
                  ? "border-gold text-gold bg-gold/10"
                  : "border-white/10 text-text-secondary hover:border-white/20"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 电影列表 */}
        <MovieGrid movies={movies} emptyMessage="暂无记录" />
      </div>
    </PageWrapper>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/likes/ app/profile/ components/profile/
git commit -m "feat: add Likes page and Profile page with stats, rating chart, tab switching"
```

---

### Task 10: 影史页 — 流派列表 + 流派详情 + 时间线

**Files:**
- Create: `app/history/page.tsx`, `app/history/[movement]/page.tsx`, `components/history/MovementCard.tsx`, `components/history/TimelineView.tsx`, `components/history/DirectorCard.tsx`

- [ ] **Step 1: MovementCard.tsx — 流派卡片**

```tsx
// components/history/MovementCard.tsx
import Link from "next/link";
import type { FilmMovement } from "@/lib/types";

export default function MovementCard({ movement }: { movement: FilmMovement }) {
  return (
    <Link
      href={`/history/${movement.id}`}
      className="card block group"
    >
      {/* 海报拼图 */}
      <div className="h-36 relative overflow-hidden bg-bg-elevated flex">
        {movement.posterCollage.length > 0 ? (
          movement.posterCollage.slice(0, 3).map((url, i) => (
            <img
              key={i}
              src={url}
              alt=""
              className={`object-cover ${movement.posterCollage.length === 1 ? "w-full" : "w-1/2"}`}
              loading="lazy"
            />
          ))
        ) : (
          <div
            className="w-full h-full"
            style={{ backgroundColor: movement.bannerColor }}
          />
        )}
        {/* 遮罩 */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
      </div>

      {/* 信息 */}
      <div className="p-4">
        <h3 className="text-base font-display font-semibold text-text-primary">
          {movement.name}
        </h3>
        <p className="text-gold text-xs mt-0.5">{movement.nameEn}</p>
        <p className="text-text-muted text-xs mt-0.5">{movement.years}</p>
        <p className="text-text-secondary text-xs mt-2 line-clamp-2">
          {movement.description.slice(0, 80)}...
        </p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: DirectorCard.tsx + TimelineView.tsx**

```tsx
// components/history/DirectorCard.tsx
import type { Director } from "@/lib/types";

export default function DirectorCard({ director }: { director: Director }) {
  return (
    <div className="flex gap-3 p-3 bg-bg-card rounded-card">
      <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-bg-elevated">
        {director.avatarUrl ? (
          <img src={director.avatarUrl} alt={director.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
            {director.name[0]}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">{director.name}</p>
        <p className="text-xs text-text-muted">{director.nameEn}</p>
        <p className="text-xs text-text-secondary mt-1 line-clamp-2">{director.bio}</p>
      </div>
    </div>
  );
}
```

```tsx
// components/history/TimelineView.tsx
import Link from "next/link";
import type { FilmMovement } from "@/lib/types";

export default function TimelineView({ movements }: { movements: FilmMovement[] }) {
  const sorted = [...movements].sort((a, b) => {
    const startA = parseInt(a.years.split("-")[0]);
    const startB = parseInt(b.years.split("-")[0]);
    return startA - startB;
  });

  return (
    <div className="relative pl-8">
      {/* 金色竖线 */}
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gold/30" />

      <div className="space-y-8">
        {sorted.map((movement, i) => (
          <div key={movement.id} className="relative">
            {/* 节点圆圈 */}
            <div className="absolute -left-8 top-1 w-3 h-3 rounded-full border-2 border-gold bg-bg" />

            <Link href={`/history/${movement.id}`} className="block group">
              <span className="text-xs text-gold font-medium">
                {movement.years}
              </span>
              <h3 className="text-base font-display font-semibold text-text-primary mt-0.5 group-hover:text-gold transition-colors">
                {movement.name}
              </h3>
              <p className="text-text-secondary text-xs mt-1 line-clamp-2">
                {movement.description.slice(0, 100)}...
              </p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: app/history/page.tsx — 流派列表页**

```tsx
// app/history/page.tsx
"use client";
import { useState } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import MovementCard from "@/components/history/MovementCard";
import TimelineView from "@/components/history/TimelineView";
import movementsData from "@/data/movements.json";
import type { FilmMovement } from "@/lib/types";

const movements: FilmMovement[] = movementsData as FilmMovement[];

type ViewMode = "grid" | "timeline";

export default function HistoryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  return (
    <PageWrapper>
      <div className="pt-6 lg:pt-10">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-display font-semibold text-text-primary">
            影史
          </h1>
          {/* 视图切换 */}
          <div className="flex bg-bg-card rounded-full p-0.5">
            {(["grid", "timeline"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 text-xs rounded-full transition-colors
                  ${viewMode === mode ? "bg-gold/20 text-gold" : "text-text-muted"}`}
              >
                {mode === "grid" ? "网格" : "时间线"}
              </button>
            ))}
          </div>
        </div>
        <p className="text-text-muted text-sm mb-6">
          探索电影史上的重要流派与运动
        </p>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {movements.map((m) => (
              <MovementCard key={m.id} movement={m} />
            ))}
          </div>
        ) : (
          <TimelineView movements={movements} />
        )}
      </div>
    </PageWrapper>
  );
}
```

- [ ] **Step 4: app/history/[movement]/page.tsx — 流派详情页**

```tsx
// app/history/[movement]/page.tsx
import { notFound } from "next/navigation";
import PageWrapper from "@/components/layout/PageWrapper";
import DirectorCard from "@/components/history/DirectorCard";
import MovieGrid from "@/components/shared/MovieGrid";
import { getMoviesByIds } from "@/lib/search";
import movementsData from "@/data/movements.json";
import type { FilmMovement } from "@/lib/types";

const movements: FilmMovement[] = movementsData as FilmMovement[];

interface Props {
  params: { movement: string };
}

export default function MovementDetailPage({ params }: Props) {
  const movement = movements.find((m) => m.id === params.movement);
  if (!movement) notFound();

  const films = getMoviesByIds(movement.representativeFilms);

  return (
    <PageWrapper>
      <div className="pt-4 lg:pt-8">
        {/* Banner */}
        <div
          className="relative -mx-4 md:-mx-6 lg:-mx-8 h-48 md:h-56 overflow-hidden"
          style={{ backgroundColor: movement.bannerColor }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-white">
              {movement.name}
            </h1>
            <p className="text-gold text-sm mt-1">{movement.nameEn}</p>
            <p className="text-text-muted text-xs mt-1">{movement.years}</p>
          </div>
        </div>

        <div className="py-6 space-y-6">
          {/* 简介 */}
          <div>
            <h2 className="text-base font-semibold text-text-primary font-display mb-2">概述</h2>
            <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
              {movement.description}
            </p>
          </div>

          {/* 风格标签 */}
          <div>
            <h2 className="text-base font-semibold text-text-primary font-display mb-2">美学风格</h2>
            <div className="flex flex-wrap gap-1.5">
              {movement.styleTags.map((tag) => (
                <span key={tag} className="px-3 py-1.5 text-xs bg-bg-card rounded-full text-text-secondary border border-white/5">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 关键导演 */}
          {movement.keyDirectors.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-text-primary font-display mb-3">关键导演</h2>
              <div className="space-y-2">
                {movement.keyDirectors.map((d) => (
                  <DirectorCard key={d.name} director={d} />
                ))}
              </div>
            </div>
          )}

          {/* 代表作品 */}
          {films.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-text-primary font-display mb-3">代表作品</h2>
              <MovieGrid movies={films} />
            </div>
          )}

          {/* 影响与传承 */}
          <div>
            <h2 className="text-base font-semibold text-text-primary font-display mb-2">影响与传承</h2>
            <p className="text-text-secondary text-sm leading-relaxed">{movement.influence}</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add app/history/ components/history/
git commit -m "feat: add History page with movement grid, timeline view, and movement detail pages"
```

---

## Phase 5: PWA、图标与收尾

### Task 11: PWA 配置 — Manifest + Service Worker + App 图标

**Files:**
- Create: `public/manifest.json`, `public/sw.js`, App 图标生成脚本

- [ ] **Step 1: public/manifest.json**

```json
{
  "name": "CineVault — 极简高级电影社区",
  "short_name": "CineVault",
  "description": "发现电影之美，探索影史之深",
  "theme_color": "#0a0a0a",
  "background_color": "#0a0a0a",
  "display": "standalone",
  "orientation": "portrait-primary",
  "start_url": "/",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

- [ ] **Step 2: public/sw.js — Service Worker**

```javascript
// public/sw.js
const CACHE_NAME = "cinevault-v1";
const ASSETS = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
});
```

- [ ] **Step 3: 生成 App 图标（SVG → PNG）**

创建 App 图标 SVG 源文件，然后再转为各尺寸 PNG。此处用 Node.js 脚本（借助 sharp 库）批量生成：

```bash
npm install sharp --save-dev
```

创建 `scripts/generate-icons.js`：

```javascript
// scripts/generate-icons.js
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SVG_ICON = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#0a0a0a"/>
  <!-- 抽象光束投射屏幕 -->
  <rect x="128" y="140" width="256" height="180" rx="16" fill="none" stroke="#c8a951" stroke-width="4"/>
  <!-- 屏幕内三角光束 -->
  <polygon points="256,180 180,300 332,300" fill="#c8a951" opacity="0.3" stroke="#c8a951" stroke-width="2"/>
  <!-- 下方光束来源线 -->
  <line x1="256" y1="320" x2="200" y2="380" stroke="#c8a951" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
  <line x1="256" y1="320" x2="256" y2="390" stroke="#c8a951" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
  <line x1="256" y1="320" x2="312" y2="380" stroke="#c8a951" stroke-width="3" stroke-linecap="round" opacity="0.6"/>
</svg>`;

async function generate() {
  const sizes = [512, 192, 180, 152, 120];
  const outDir = path.join(__dirname, "..", "public", "icons");
  fs.mkdirSync(outDir, { recursive: true });

  for (const size of sizes) {
    await sharp(Buffer.from(SVG_ICON))
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }
}

generate().catch(console.error);
```

运行：

```bash
node scripts/generate-icons.js
```

- [ ] **Step 4: 添加 404 / not-found 页面**

```tsx
// app/not-found.tsx
import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";

export default function NotFound() {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-6xl font-display font-bold text-gold/30 mb-4">404</p>
        <h1 className="text-xl font-semibold text-text-primary mb-2">页面不存在</h1>
        <p className="text-text-muted text-sm mb-6">这部电影或页面可能已被移除</p>
        <Link href="/" className="btn-gold text-sm">
          返回首页
        </Link>
      </div>
    </PageWrapper>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add public/ scripts/ app/not-found.tsx
git commit -m "feat: add PWA manifest, service worker, app icons, 404 page"
```

---

## Phase 6: 数据填充

### Task 12: 填充电影数据库（~500 部） + 流派数据（13 个）

**Files:**
- Modify: `data/movies.json`, `data/movements.json`

- [ ] **Step 1: 扩充 movies.json 至 ~500 部高分电影**

采用分批填充策略：每批 50 部，覆盖不同地区/类型/年代。每部电影包含完整字段（id, titleZh, titleEn, year, director, cast, genres, region, language, runtime, rating, ratingCount, ratingDistribution, synopsis, posterUrl, backdropUrl, movements, isNowShowing, isComingSoon, releaseDate, tags）。

数据来源：以 IMDb Top 250 + 豆瓣 Top 250 + 各类型/地区高分片为主。海报 URL 使用豆瓣/IMDb 图片链接。

**第一批 50 部：IMDb Top 50**（肖申克的救赎、教父、黑暗骑士、辛德勒的名单、低俗小说……）

**第二批 50 部：豆瓣华语 Top 50**（霸王别姬、活着、阳光灿烂的日子、一一、牯岭街少年杀人事件……）

**第三批 50 部：日本/韩国高分**（七武士、千与千寻、老男孩、寄生虫、燃烧……）

**第四批 50 部：欧洲经典**（偷自行车的人、八部半、第七封印、精疲力尽、四百击……）

**第五批 50 部：各类型代表**（科幻、恐怖、动画、纪录片等）

**第六至十批：** 继续填充至 500 部，确保类型/地区/年代分布均匀。

每批完成后运行 `npm run build` 确保无 TS 错误。

- [ ] **Step 2: 填充 movements.json 的 13 个流派完整数据**

每个流派包含：完整的长简介（~500 字）、关键导演列表（含头像 URL 和简介）、代表电影 ID 列表（与 movies.json 中的 id 对应）、风格标签、影响描述。

- [ ] **Step 3: 给相关电影添加 `movements` 字段**

为属于各流派的电影在 movies.json 中填充 `movements` 数组（如 `["french-new-wave"]`），确保流派详情页能正确展示代表作品。

- [ ] **Step 4: 验证 + Commit**

```bash
npm run build   # 确保构建成功
git add data/
git commit -m "feat: populate 500+ movies and 13 complete film movements"
```

---

## Phase 7: 响应式打磨与最终检查

### Task 13: 响应式完善 + 交互打磨

- [ ] **Step 1: 检查手机端布局**
  - 底部 Tab Bar 不遮挡内容（已有 PageWrapper 的 `pb-20`）
  - 横滑卡片滚动流畅
  - 触控热区 ≥ 44px（所有可点击元素）
  - 搜索页全屏覆盖正确

- [ ] **Step 2: 检查平板端布局 (640-1024px)**
  - 电影网格 3 列
  - 影史卡片 2 列
  - 底部 Tab 换为顶部导航（通过 CSS media query 实现）

- [ ] **Step 3: 检查桌面端布局 (≥1024px)**
  - 左侧导航栏固定
  - 电影网格 4 列
  - 详情页双栏布局（海报左/信息右）
  - 最大宽度 1280px 居中

- [ ] **Step 4: 交互动画完善**
  - 卡片 hover 上浮效果
  - 页面切换过渡
  - 加载骨架屏平滑出现
  - 按钮点击反馈

- [ ] **Step 5: 最终构建验证**

```bash
npm run build
npm run lint
```

预期：零错误，零警告。

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "polish: responsive layout, interaction animations, final checks"
```

---

## 计划自审结果

1. **Spec 覆盖检查：**
   - ✅ 电影浏览（首页/发现页）— Task 6, 7
   - ✅ 搜索 + 筛选 — Task 7
   - ✅ 电影详情 — Task 8
   - ✅ 喜欢/想过/看过/收藏/评分 — Task 8 (ActionButtons), Task 9
   - ✅ 影史 + 13 流派 + 时间线 — Task 10
   - ✅ PWA 安装 — Task 11
   - ✅ Mobile First 响应式 — 贯穿所有 Task
   - ✅ App 图标 + UI 图标 — Task 5 (Tab 图标), Task 11 (App 图标)
   - ✅ 500+ 电影数据 — Task 12

2. **无占位符：** ✅ 所有步骤均包含实际代码。

3. **类型一致性：** ✅ `lib/types.ts` 定义的类型贯穿所有组件使用。
