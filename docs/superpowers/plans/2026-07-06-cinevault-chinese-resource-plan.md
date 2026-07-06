# CineVault 国内影视资源重构 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将数据源从 TMDB 切换到苹果 CMS 资源站 API，并在影片详情页嵌入腾讯视频 iframe 播放器。

**Architecture:** 新建 `lib/resource-station.ts` 封装资源站 API 请求，API Routes 优先从资源站拉数据并转换为 TMDB 兼容格式（保证现有组件无需改动），TMDB 作为 fallback。新增 `TencentPlayer` 组件解析播放链接并嵌入腾讯视频 iframe。

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, 苹果CMS 资源站 API

---

## 文件结构总览

```
lib/
├── resource-station.ts    [CREATE] 资源站 API 封装 + 多源切换
├── tmdb.ts                [KEEP]   保留作为 fallback
├── types.ts               [MODIFY] 新增 ResourceStationMovie 等类型
└── utils.ts               [KEEP]   不变

app/api/
├── movies/route.ts        [MODIFY] 优先使用资源站，TMDB fallback
├── movie/[id]/route.ts    [MODIFY] 优先使用资源站详情，TMDB fallback
└── movie/[id]/similar/route.ts [MODIFY] 资源站同类推荐

components/movie/
├── TencentPlayer.tsx      [CREATE] 腾讯视频 iframe 嵌入播放器
└── WatchProviders.tsx     [KEEP]   保留搜索链接作为回退

app/movie/[slug]/
└── page.tsx               [MODIFY] 在 MovieHero 上方插入 TencentPlayer

.env.local                 [MODIFY] 新增 RESOURCE_STATION_URL
```

**组件层面改动极小**：因为 API Routes 将资源站数据转换为 TMDB 兼容格式，MovieCard、MovieHero、NowShowing、TopRated 等所有现有组件**不需要任何修改**。

---

### Task 1: 环境变量 — 配置资源站地址

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: 添加资源站 URL 配置**

在 `.env.local` 末尾追加：

```env
# 苹果CMS 资源站 API（主源 + 备用源，逗号分隔）
RESOURCE_STATION_URL=https://360zy.com
RESOURCE_STATION_BACKUPS=https://example2.com,https://example3.com
```

> 注：`360zy.com` 是示例域名，实际可用的资源站需要自行寻找。资源站只需支持标准的苹果CMS V10 API 格式（`/api.php/provide/vod/`）。可在 Task 10 综合验证中确认配置是否生效。

---

### Task 2: 类型定义 — 新增资源站数据类型

**Files:**
- Modify: `lib/types.ts`

- [ ] **Step 1: 在 types.ts 末尾追加资源站相关类型**

```ts
// ============ 苹果CMS 资源站类型 ============

/** 资源站返回的单条视频 */
export interface ResourceStationMovie {
  vod_id: number;
  vod_name: string;
  vod_pic: string;
  vod_remarks: string;       // e.g. "HD", "TC"
  vod_year: string;
  vod_director: string;
  vod_actor: string;          // comma-separated
  vod_content: string;        // overview
  vod_play_url: string;       // "腾讯视频$url$$爱奇艺$url"
  vod_score?: string;
  vod_lang?: string;
  vod_area?: string;
  type_id?: number;
  type_name?: string;
}

/** 资源站列表响应 */
export interface ResourceStationListResponse {
  code: number;
  msg: string;
  page: string;
  pagecount: number;
  limit: string;
  total: number;
  list: ResourceStationMovie[];
}
```

---

### Task 3: 资源站 API 封装

**Files:**
- Create: `lib/resource-station.ts`

- [ ] **Step 1: 创建资源站 API 客户端**

```ts
/** 苹果CMS 资源站 API 封装 — 服务端使用 */

interface RsConfig {
  baseUrl: string;
  timeoutMs: number;
}

function getSources(): RsConfig[] {
  const primary = process.env.RESOURCE_STATION_URL;
  const backups = (process.env.RESOURCE_STATION_BACKUPS || "").split(",").filter(Boolean);
  const urls = [primary, ...backups].filter(Boolean) as string[];
  return urls.map((url) => ({
    baseUrl: url.replace(/\/+$/, ""),
    timeoutMs: 4000,
  }));
}

async function tryFetch(path: string, source: RsConfig): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), source.timeoutMs);
  try {
    const res = await fetch(`${source.baseUrl}${path}`, {
      signal: controller.signal,
      headers: { "User-Agent": "CineVault/1.0" },
    });
    clearTimeout(timer);
    return res;
  } catch {
    clearTimeout(timer);
    throw new Error(`Resource station ${source.baseUrl} unavailable`);
  }
}

/** 带多源切换的请求 */
async function fetchFromResourceStation(path: string): Promise<Response> {
  const sources = getSources();
  if (sources.length === 0) throw new Error("No resource station configured");

  let lastError: Error | null = null;
  for (const source of sources) {
    try {
      const res = await tryFetch(path, source);
      if (res.ok) return res;
      // 非 2xx 也视为失败，尝试下一个源
    } catch (e) {
      lastError = e as Error;
    }
  }
  throw lastError || new Error("All resource stations failed");
}

/** 获取电影列表 */
export async function getResourceStationMovies(params: {
  t?: string;       // 分类ID: 1=电影
  pg?: number;
  pagesize?: number;
  wd?: string;      // 搜索关键词
}): Promise<import("./types").ResourceStationListResponse | null> {
  const searchParams = new URLSearchParams();
  searchParams.set("ac", params.wd ? "videolist" : "list");
  if (params.t) searchParams.set("t", params.t);
  if (params.pg) searchParams.set("pg", String(params.pg));
  if (params.pagesize) searchParams.set("pagesize", String(params.pagesize));
  if (params.wd) searchParams.set("wd", params.wd);

  try {
    const res = await fetchFromResourceStation(
      `/api.php/provide/vod/?${searchParams.toString()}`
    );
    const data = await res.json();
    if (data.code !== 1) return null;
    return data;
  } catch {
    return null;
  }
}

/** 获取电影详情 */
export async function getResourceStationMovieDetail(
  vodId: number
): Promise<import("./types").ResourceStationMovie | null> {
  try {
    const res = await fetchFromResourceStation(
      `/api.php/provide/vod/?ac=detail&ids=${vodId}`
    );
    const data = await res.json();
    if (data.code !== 1 || !data.list?.length) return null;
    return data.list[0];
  } catch {
    return null;
  }
}
```

---

### Task 4: 数据适配器 — 资源站 → TMDB 兼容格式

**Files:**
- Modify: `lib/resource-station.ts`（追加到同一文件末尾）

- [ ] **Step 1: 追加适配器函数**

在 `lib/resource-station.ts` 末尾追加：

```ts
import type { TmdbMovie, TmdbListResponse, ResourceStationMovie, ResourceStationListResponse } from "./types";

/**
 * 将单条资源站电影转换为 TmdbMovie 格式
 * 保证所有现有组件 (MovieCard, MovieHero 等) 无需修改
 */
export function adaptMovie(rs: ResourceStationMovie): TmdbMovie {
  return {
    id: rs.vod_id,
    title: rs.vod_name,
    original_title: rs.vod_name,           // 资源站无原名，用中文名
    overview: rs.vod_content || "",
    poster_path: rs.vod_pic || null,
    backdrop_path: null,                    // 资源站通常无背景图
    release_date: rs.vod_year ? `${rs.vod_year}-01-01` : "",
    vote_average: parseFloat(rs.vod_score || "0") || 0,
    vote_count: 0,
    popularity: 0,
    genre_ids: [],
    genres: rs.type_name
      ? [{ id: rs.type_id || 0, name: rs.type_name }]
      : [],
    original_language: rs.vod_lang || "zh",
    runtime: 0,
    // 扩展字段 — 存储原始播放链接，供 TencentPlayer 使用
    _play_url: rs.vod_play_url,
  } as TmdbMovie & { _play_url: string };
}

/**
 * 将资源站列表响应转换为 TmdbListResponse 格式
 */
export function adaptListResponse(rs: ResourceStationListResponse): TmdbListResponse {
  return {
    page: parseInt(rs.page) || 1,
    results: (rs.list || []).map(adaptMovie),
    total_pages: rs.pagecount || 1,
    total_results: rs.total || 0,
  };
}
```

- [ ] **Step 2: 扩展 TmdbMovie 类型以支持可选播放链接**

在 `lib/types.ts` 的 `TmdbMovie` 接口中追加可选字段（兼容现有代码）：

```ts
export interface TmdbMovie {
  // ... existing fields ...
  _play_url?: string;  // 资源站播放链接（非TMDB字段，仅供 TencentPlayer 使用）
}
```

---

### Task 5: API Route — 电影列表切换到资源站

**Files:**
- Modify: `app/api/movies/route.ts`

- [ ] **Step 1: 重写 movies API Route，资源站优先**

完整替换 `app/api/movies/route.ts`：

```ts
import { NextRequest, NextResponse } from "next/server";
import { getResourceStationMovies, adaptListResponse } from "@/lib/resource-station";

const TMDB_BASE = "https://api.themoviedb.org/3";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") || "now_playing";
  const page = searchParams.get("page") || "1";
  const query = searchParams.get("query") || "";

  // 1. 尝试从资源站获取
  try {
    if (type === "search" && query) {
      const rsData = await getResourceStationMovies({ wd: query, pg: parseInt(page) });
      if (rsData && rsData.list?.length > 0) {
        return NextResponse.json(adaptListResponse(rsData));
      }
    } else if (type === "now_playing" || type === "popular" || type === "top_rated") {
      const rsData = await getResourceStationMovies({ t: "1", pg: parseInt(page), pagesize: 20 });
      if (rsData && rsData.list?.length > 0) {
        return NextResponse.json(adaptListResponse(rsData));
      }
    }
  } catch {
    // 资源站失败，继续尝试 TMDB
  }

  // 2. Fallback: TMDB
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "No data source available" }, { status: 500 });

  let path = "";
  const params = new URLSearchParams({ api_key: apiKey, language: "zh-CN", page });

  switch (type) {
    case "now_playing": path = "/movie/now_playing"; params.set("region", "CN"); break;
    case "top_rated": path = "/movie/top_rated"; break;
    case "upcoming": path = "/movie/upcoming"; break;
    case "popular": path = "/movie/popular"; break;
    case "search":
      path = "/search/movie";
      params.set("query", query);
      if (!query) return NextResponse.json({ results: [] });
      break;
    case "discover":
      path = "/discover/movie";
      params.set("sort_by", searchParams.get("sort_by") || "popularity.desc");
      const genre = searchParams.get("with_genres");
      const year = searchParams.get("primary_release_year");
      if (genre) params.set("with_genres", genre);
      if (year) params.set("primary_release_year", year);
      break;
    case "genres":
      path = "/genre/movie/list";
      params.delete("page");
      break;
    default: path = "/movie/popular";
  }

  try {
    const res = await fetch(`${TMDB_BASE}${path}?${params}`, { next: { revalidate: 3600 } });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "API request failed" }, { status: 500 });
  }
}
```

- [ ] **Step 2: 验证**

Run: `npm run dev`
访问 `http://localhost:3000/api/movies?type=popular&page=1` 验证返回数据格式。

---

### Task 6: API Route — 电影详情切换到资源站

**Files:**
- Modify: `app/api/movie/[id]/route.ts`

- [ ] **Step 1: 重写电影详情 API Route**

完整替换 `app/api/movie/[id]/route.ts`：

```ts
import { NextRequest, NextResponse } from "next/server";
import { getResourceStationMovieDetail, adaptMovie } from "@/lib/resource-station";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const movieId = parseInt(params.id);
  if (isNaN(movieId)) {
    return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
  }

  // 1. 尝试资源站
  try {
    const rsMovie = await getResourceStationMovieDetail(movieId);
    if (rsMovie) {
      return NextResponse.json(adaptMovie(rsMovie));
    }
  } catch {
    // 继续 TMDB fallback
  }

  // 2. Fallback: TMDB
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "No data source available" }, { status: 500 });

  const url = new URL(`https://api.themoviedb.org/3/movie/${params.id}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "zh-CN");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

- [ ] **Step 2: 验证**

访问 `http://localhost:3000/api/movie/12345` 验证详情数据包含 `_play_url` 字段。

---

### Task 7: API Route — 相关推荐

**Files:**
- Modify: `app/api/movie/[id]/similar/route.ts`

- [ ] **Step 1: 更新相关推荐 API Route**

完整替换 `app/api/movie/[id]/similar/route.ts`：

```ts
import { NextRequest, NextResponse } from "next/server";
import { getResourceStationMovies, adaptListResponse } from "@/lib/resource-station";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. 尝试资源站 — 用随机分类获取同类型电影作为"相关推荐"
  try {
    const rsData = await getResourceStationMovies({ t: "1", pg: 1, pagesize: 6 });
    if (rsData && rsData.list?.length > 0) {
      const adapted = adaptListResponse(rsData);
      adapted.results = adapted.results.filter((m) => m.id !== parseInt(params.id)).slice(0, 6);
      return NextResponse.json(adapted);
    }
  } catch {
    // 继续 TMDB fallback
  }

  // 2. Fallback: TMDB
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

  const url = new URL(`https://api.themoviedb.org/3/movie/${params.id}/similar`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "zh-CN");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

---

### Task 8: TencentPlayer 组件 — 腾讯视频嵌入播放器

**Files:**
- Create: `components/movie/TencentPlayer.tsx`

- [ ] **Step 1: 创建 TencentPlayer 组件**

```tsx
"use client";

import { useState, useMemo } from "react";

interface TencentPlayerProps {
  playUrl: string;    // 资源站的 vod_play_url
  movieTitle: string;
}

/**
 * 从 vod_play_url 中提取腾讯视频的 vid
 * 格式: "腾讯视频$https://v.qq.com/x/cover/xxx.html$$爱奇艺$..."
 */
function extractTencentVid(playUrl: string): string | null {
  if (!playUrl) return null;

  // 按 $$ 分割各平台
  const platforms = playUrl.split("$$");

  for (const platform of platforms) {
    if (!platform.includes("腾讯视频") && !platform.includes("v.qq.com")) continue;

    // 提取链接部分 (平台名$url 格式)
    const parts = platform.split("$");
    const url = parts.length > 1 ? parts[1] : parts[0];

    // 从链接提取 vid
    // 格式1: https://v.qq.com/x/cover/mzc00200xxx.html
    // 格式2: https://v.qq.com/x/page/vid.html
    const coverMatch = url.match(/\/cover\/([a-z0-9]+)\.html/i);
    if (coverMatch) return coverMatch[1];

    const pageMatch = url.match(/\/page\/([a-z0-9]+)\.html/i);
    if (pageMatch) return pageMatch[1];

    // 格式3: vid=xxx
    const vidMatch = url.match(/[?&]vid=([a-z0-9]+)/i);
    if (vidMatch) return vidMatch[1];
  }

  return null;
}

export default function TencentPlayer({ playUrl, movieTitle }: TencentPlayerProps) {
  const [error, setError] = useState(false);

  const vid = useMemo(() => extractTencentVid(playUrl), [playUrl]);

  if (error || !vid) {
    // 降级: 显示搜索链接
    if (!vid && !error) return null; // 无腾讯视频源，不渲染

    return (
      <div className="w-full bg-bg-card rounded-card border border-white/5 p-4 mb-4">
        <div className="flex items-center gap-2 text-text-muted text-sm">
          <span>▶</span>
          <span>{error ? "播放加载失败" : "暂无腾讯视频资源"}</span>
          <a
            href={`https://v.qq.com/x/search/?q=${encodeURIComponent(movieTitle)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-gold text-xs hover:underline"
          >
            去腾讯视频搜索 →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black/50 rounded-card overflow-hidden mb-4 border border-white/5">
      {/* 标签栏 */}
      <div className="flex items-center gap-2 px-4 py-2 bg-bg-card/50 border-b border-white/5">
        <span className="text-xs text-gold">▶</span>
        <span className="text-xs text-text-secondary">腾讯视频</span>
        <span className="text-[10px] text-text-muted ml-auto">来源: v.qq.com</span>
      </div>

      {/* 播放器 iframe */}
      <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
        <iframe
          src={`https://v.qq.com/txp/iframe/player.html?vid=${vid}`}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen"
          onError={() => setError(true)}
          title={movieTitle}
        />
      </div>
    </div>
  );
}
```

---

### Task 9: 影片详情页 — 插入 TencentPlayer

**Files:**
- Modify: `app/movie/[slug]/page.tsx`

- [ ] **Step 1: 在详情页顶部插入播放器**

修改 `app/movie/[slug]/page.tsx`，在 `<PageWrapper>` 内、`<MovieHero>` 前插入 `TencentPlayer`：

找到以下位置：
```tsx
<PageWrapper withPadding={false}>
  <MovieHero movie={movie} />
```

替换为：
```tsx
<PageWrapper withPadding={false}>
  {"_play_url" in movie && movie._play_url && (
    <div className="px-4 md:px-6 lg:px-8 pt-4">
      <TencentPlayer
        playUrl={movie._play_url!}
        movieTitle={movie.title}
      />
    </div>
  )}
  <MovieHero movie={movie} />
```

并在文件顶部新增 import：
```tsx
import TencentPlayer from "@/components/movie/TencentPlayer";
```

- [ ] **Step 2: 验证编译**

Run: `npx tsc --noEmit` — 确保无类型错误。

---

### Task 10: 综合验证 & 测试

**Files:**
- 无需修改，手动验证

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

- [ ] **Step 2: 验证资源站数据接入**

打开 `http://localhost:3000`，检查首页是否展示电影列表。
打开浏览器 DevTools → Network → 检查 `/api/movies` 请求返回的数据格式是否正确。

- [ ] **Step 3: 验证电影详情 + 播放器**

点击任意电影进入详情页，检查：
- 顶部是否出现腾讯视频播放器（如果该电影在资源站有腾讯视频链接）
- 如果没有腾讯视频链接，播放器区域是否不显示（或显示降级搜索链接）

- [ ] **Step 4: 验证 TMDB fallback**

在 `.env.local` 中将 `RESOURCE_STATION_URL` 设为一个不可达的域名：
```env
RESOURCE_STATION_URL=https://no-such-station-12345.com
```
重启 dev server，验证网站仍能正常工作（使用 TMDB 数据）。

恢复正确的 `RESOURCE_STATION_URL`。

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: switch to 苹果CMS resource station API + Tencent Video embed player"
```

---

### Task 11: utils.ts 适配 — posterUrl 支持直链

**Files:**
- Modify: `lib/utils.ts`

- [ ] **Step 1: 让 posterUrl 兼容资源站的直链图片**

资源站返回的 `vod_pic` 是完整的 HTTP URL（如 `https://pic.example.com/poster.jpg`），但现有的 `posterUrl` 函数会把它当成 TMDB path 拼接成 `https://image.tmdb.org/t/p/w342/https://pic.example.com/poster.jpg`，导致图片加载失败。

修改 `posterUrl` 函数：

找到：
```ts
export function posterUrl(path: string | null, size: "w185" | "w342" | "w500" = "w342"): string {
  if (!path) return "/icons/placeholder-poster.svg";
  return `${IMG_BASE}/${size}${path}`;
}
```

替换为：
```ts
export function posterUrl(path: string | null, size: "w185" | "w342" | "w500" = "w342"): string {
  if (!path) return "/icons/placeholder-poster.svg";
  // 如果已经是完整 URL（资源站直链），直接返回
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${IMG_BASE}/${size}${path}`;
}
```

同理修改 `backdropUrl`：

```ts
export function backdropUrl(path: string | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${IMG_BASE}/w1280${path}`;
}
```

> 注：`lib/tmdb.ts` 中也有同名的 `posterUrl` 和 `backdropUrl`，但这两套函数是独立的——`tmdb.ts` 的版本用于服务端直接调用 TMDB 的路径；`utils.ts` 的版本用于客户端组件渲染图片。两者都需要修改。

---

## 实施顺序

```
Task 1 (环境变量)
  → Task 2 (类型定义)
    → Task 3 (资源站 API 封装)
      → Task 11 (utils 直链适配)
        → Task 4 (适配器)
          → Task 5 (电影列表 API)
          → Task 6 (电影详情 API)
          → Task 7 (相关推荐 API)
            → Task 8 (TencentPlayer 组件)
              → Task 9 (详情页插入播放器)
                → Task 10 (综合验证)
```
