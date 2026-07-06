# CineVault 国内影视资源重构 — 设计文档

**日期**: 2026-07-06
**状态**: 待实施
**目标**: 将数据源从 TMDB 切换到国内影视资源站（苹果CMS API），并在影片详情页嵌入腾讯视频播放器，实现"浏览即观看"体验（类似 Mineradio 模式）。

---

## 1. 背景

### 1.1 现状

CineVault 当前使用 TMDB API 作为唯一数据源。虽然支持 `zh-CN` 语言，但：
- TMDB 的电影目录偏国际，很多电影在国内平台没有资源
- 详情页只有"搜索观看"跳转链接，不能直接播放
- 无法实现 Mineradio 那种"浏览→点击→播放"的闭环体验

### 1.2 目标

- 将数据源从 TMDB 切换到国内影视资源站（苹果CMS 兼容 API）
- 电影详情页嵌入腾讯视频播放器，直接观看
- 保持现有 UI 风格和用户体验
- 资源站不可用时优雅降级

---

## 2. 架构设计

### 2.1 数据流

```
苹果CMS 资源站 API (JSON)
       ↓
Next.js API Routes (代理 + 格式适配)
       ↓
Server/Client Components
       ↓
用户浏览电影目录 → 点击电影 → 详情页 + 腾讯视频 iframe 播放
```

### 2.2 资源站 API 格式

**电影列表接口**:
```
GET /api.php/provide/vod/?ac=list&t=1&pg=1&pagesize=20
```
返回:
```json
{
  "code": 1,
  "total": 1000,
  "list": [
    {
      "vod_id": 12345,
      "vod_name": "流浪地球",
      "vod_pic": "https://pic.example.com/poster.jpg",
      "vod_remarks": "HD",
      "vod_year": "2019",
      "vod_director": "郭帆",
      "vod_actor": "吴京, 屈楚萧",
      "vod_content": "剧情简介...",
      "vod_play_url": "腾讯视频$https://v.qq.com/x/cover/xxx.html$$爱奇艺$https://..."
    }
  ]
}
```

**搜索接口**:
```
GET /api.php/provide/vod/?ac=videolist&wd=流浪地球
```

**详情接口**:
```
GET /api.php/provide/vod/?ac=detail&ids=12345
```

### 2.3 资源站配置

在 `.env.local` 中配置，支持多个备用源：
```env
RESOURCE_STATION_URL=https://example1.com
RESOURCE_STATION_BACKUPS=https://example2.com,https://example3.com
```

---

## 3. 新增/修改文件清单

### 3.1 新建文件

| 文件 | 说明 |
|------|------|
| `lib/resource-station.ts` | 资源站 API 封装，支持多源切换、请求缓存 |
| `components/movie/TencentPlayer.tsx` | 腾讯视频 iframe 播放器组件 |
| `lib/adapters.ts` | 资源站数据 → 组件兼容格式的适配器 |

### 3.2 修改文件

| 文件 | 改动 |
|------|------|
| `lib/types.ts` | 新增 `ResourceStationMovie`、`ResourceStationListResponse` 等类型 |
| `app/api/movies/route.ts` | 数据源改为资源站，保留分类/分页参数 |
| `app/api/movie/[id]/route.ts` | 数据源改为资源站详情接口 |
| `app/api/movie/[id]/similar/route.ts` | 通过资源站同类接口获取 |
| `app/movie/[slug]/page.tsx` | 在 MovieHero 上方插入 `TencentPlayer` |
| `components/movie/MovieHero.tsx` | 适配新数据字段名 |
| `components/shared/MovieCard.tsx` | 适配新数据字段名 |
| `components/home/NowShowing.tsx` | 数据源切换 |
| `components/home/TopRated.tsx` | 数据源切换 |
| `components/home/ComingSoon.tsx` | 数据源切换 |
| `components/movie/RelatedMovies.tsx` | 适配适配器输出 |
| `components/search/SearchOverlay.tsx` | 搜索接口切换 |

### 3.3 保留不变

| 文件 | 原因 |
|------|------|
| `lib/tmdb.ts` | 保留作为 fallback，资源站全部失效时使用 |
| `components/layout/*` | 布局/主题系统不变 |
| `components/focus/*` | Focus 页独立功能不变 |
| `components/globe/*` | 3D 地球独立功能不变 |
| `components/collection/*` | 收藏功能不变（只需适配 ID 格式） |
| `components/history/*` | 影史功能不变 |
| `components/profile/*` | 个人页不变（本地存储数据） |

---

## 4. 核心组件设计

### 4.1 TencentPlayer

```
┌──────────────────────────────────────┐
│  🎬 腾讯视频播放器                    │
│  ┌────────────────────────────────┐  │
│  │                                │  │
│  │   iframe: v.qq.com/txp/       │  │
│  │   iframe/player.html?vid=XXX  │  │
│  │   (16:9 响应式)                │  │
│  │                                │  │
│  └────────────────────────────────┘  │
│  来源: 腾讯视频                       │
└──────────────────────────────────────┘
```

**Props**:
```ts
interface TencentPlayerProps {
  vodPlayUrl: string;   // 资源站返回的播放链接
  movieTitle: string;   // 电影标题（回退搜索用）
}
```

**逻辑**:
1. 解析 `vod_play_url`，提取"腾讯视频"对应的链接
2. 从链接中提取 `vid`（视频ID）
3. 构造 iframe URL: `https://v.qq.com/txp/iframe/player.html?vid=XXX`
4. 如果无法提取 vid → 回退到腾讯视频搜索链接
5. 如果没有腾讯视频源 → 组件返回 null（不渲染）

### 4.2 适配器 (adapters.ts)

资源站的数据字段名与 TMDB 不同，需要适配器统一转换：

```ts
// 资源站格式 → 组件使用的格式
function adaptMovie(rsMovie: ResourceStationMovie): AdaptedMovie {
  return {
    id: rsMovie.vod_id,
    title: rsMovie.vod_name,
    poster: rsMovie.vod_pic,
    year: rsMovie.vod_year,
    director: rsMovie.vod_director,
    actors: rsMovie.vod_actor?.split(",") ?? [],
    overview: rsMovie.vod_content,
    rating: rsMovie.vod_score,
    playUrl: rsMovie.vod_play_url,  // 新增：播放链接
  };
}
```

---

## 5. 播放链接解析

### 5.1 vod_play_url 格式

资源站返回的 `vod_play_url` 是多平台拼接字符串：
```
腾讯视频$https://v.qq.com/x/cover/mzc00200xxx.html$$爱奇艺$https://www.iqiyi.com/v_xxx.html$$优酷$https://v.youku.com/v_show/id_xxx.html
```

分隔规则：`$$` 分隔不同平台，`$` 分隔平台名和链接。

### 5.2 提取腾讯视频 vid

```ts
function extractTencentVid(playUrl: string): string | null {
  // 1. 按 $$ 分割各平台
  // 2. 找到"腾讯视频"那一段
  // 3. 从链接中提取 vid（cover/xxx.html 或 vid=xxx）
  // 4. 返回 vid 或 null
}
```

### 5.3 降级策略

```
有腾讯视频链接 → 提取 vid → iframe 播放
       ↓ 失败
没有腾讯视频 → 尝试其他平台链接 → iframe 播放各自平台
       ↓ 失败
都没有 → 回退到搜索跳转链接（现有 WatchProviders 行为）
```

---

## 6. 错误处理

| 场景 | 处理 |
|------|------|
| 资源站主源不可用 | 自动切换到备用源 |
| 全部资源站不可用 | 回退到 TMDB |
| 单部电影详情获取失败 | 显示"暂无数据"，不崩溃 |
| 播放链接解析失败 | 播放器区域不显示 |
| iframe 加载失败 | 显示"播放失败" + 跳转链接 |

---

## 7. 风险 & 缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 资源站不稳定 | 网站无数据 | 多备用源 + TMDB fallback |
| API 格式变化 | 数据解析失败 | 适配层集中处理，单一修改点 |
| 播放链接失效 | 无法播放 | 降级到搜索链接 |
| 工作量较大 | 开发周期长 | 分阶段实施，核心功能优先 |

---

## 8. 实施阶段

### 阶段一：基础设施（优先）
1. 创建 `lib/resource-station.ts`
2. 创建 `lib/adapters.ts`
3. 更新 `lib/types.ts`
4. 配置环境变量

### 阶段二：核心播放
1. 创建 `TencentPlayer` 组件
2. 更新 `/api/movie/[id]` 和影片详情页
3. 验证播放功能

### 阶段三：全面迁移
1. 更新首页各模块 API
2. 更新搜索功能
3. 更新相关推荐

### 阶段四：完善
1. 多源切换逻辑
2. 错误处理 & 降级
3. TMDB fallback 保留

---

## 9. Fallback 机制

资源站可能不稳定，需要多层降级：

```
资源站主源 (RESOURCE_STATION_URL)
    ↓ 3秒超时/失败
备用源1 (RESOURCE_STATION_BACKUPS[0])
    ↓ 3秒超时/失败
备用源2 (RESOURCE_STATION_BACKUPS[1])
    ↓ 全部失败
TMDB (lib/tmdb.ts 保留，作为最终兜底)
```

- 每次请求只尝试一个源，失败后自动切换下一个
- 在内存中缓存当前可用源，避免每次都从失败的源开始
- 后台定时检测，源恢复后自动切回

## 10. 不做的事情

- 不改变布局/主题系统
- 不改变收藏/历史等本地存储功能
- 不改变 Focus 页、Globe 3D 等独立功能
- 不做用户登录/会员系统
- 不绕过腾讯视频 DRM 或 VIP 限制
