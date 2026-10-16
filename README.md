# CineVault 🎬

> 极简高级电影社区 — 发现电影之美，探索影史之深

CineVault 是一个黑色极简风格的电影社区网站，集**电影浏览发现、个人记录、电影史与流派探索**于一体。视觉对标 A24 官网式的暗夜艺术感（深黑底色 + 金色点缀 + 大量留白），通过 PWA 实现移动端 App 级沉浸体验，一套代码响应式适配手机到桌面。

---

## ✨ 功能特性

### 浏览与发现
- **首页**：正在热映、本周高分 Top 10、即将上映、今日推荐（随机高分冷门）
- **发现页**：多条件筛选（类型 / 年代 / 地区 / 语言）+ 多种排序 + 无限滚动
- **搜索**：片名 / 导演 / 演员实时联想，支持流派名称搜索

### 电影史与流派 🎞️
内置 **13 个电影史流派**专题页（法国新浪潮、意大利新现实主义、德国表现主义、黑色电影、台湾新电影……），每个流派包含：简介长文、关键导演、代表作品、美学风格标签、影响与传承，另支持**时间线视图**。

### 个人记录（本地持久化）
- ♥ 喜欢 · 📌 想看 · ✓ 看过 · ☆ 收藏 · ⭐ 评分（1-5 星）
- 自定义**收藏夹（片单）**创建与管理
- **观影统计**：总时长、类型分布、月度图表、评分分布
- 数据存储于 `localStorage`，换浏览器会丢失

### 沉浸体验
- 🌍 **3D 粒子地球**背景（Three.js + React Three Fiber）
- 🎯 **焦点模式**：专注计时器 + 网易云音乐播放器（扫码登录）+ 名言轮播 + 星空，支持全屏沉浸与自动播放
- 🎨 多主题切换、光标辉光、视差卡片等细节

### 移动端
- **PWA**：可安装到主屏幕，全屏沉浸
- Mobile First 响应式：手机 2 列 / 平板 3 列 / 桌面 4 列，底部 Tab Bar ↔ 桌面侧边栏自动切换

---

## 🛠 技术栈

| 项目 | 选型 |
|------|------|
| 框架 | [Next.js 14](https://nextjs.org/)（App Router） |
| 语言 | TypeScript |
| UI | React 18 + Tailwind CSS |
| 3D | Three.js + @react-three/fiber + @react-three/drei |
| 地图数据 | topojson-client |
| PWA | next-pwa |
| 数据源 | TMDb API + 苹果CMS 资源站（多源切换） |
| 部署 | Vercel |
| 桌面端 | Electron + NeteaseCloudMusicApi（焦点模式） |

---

## 🚀 快速开始

### 环境要求
- Node.js 18+（推荐 20+）
- npm / yarn / pnpm

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local.example`（或新建 `.env.local`），填入你的 TMDb API Key：

```env
# TMDb API Key — 从 https://www.themoviedb.org/settings/api 获取
TMDB_API_KEY=你的_TMDB_API_Key

# 苹果CMS 资源站 API（主源 + 备用源，逗号分隔）
RESOURCE_STATION_URL=https://360zy.com
RESOURCE_STATION_BACKUP_URLS=https://example2.com,https://example3.com
```

> 💡 **获取 TMDb API Key**：注册 [themoviedb.org](https://www.themoviedb.org/settings/api) → 申请 API Key → 填入 `TMDB_API_KEY`。

### 3. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看。

---

## 📦 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 运行生产版本 |
| `npm run lint` | 代码检查 |

---

## 🚢 部署到 Vercel

1. 将代码推送到 GitHub 仓库
2. 在 [vercel.com](https://vercel.com) 导入该仓库
3. 配置环境变量 `TMDB_API_KEY`、`RESOURCE_STATION_URL` 等
4. 点击 Deploy 即可

---

## 📁 项目结构

```
├── app/                 # 页面（App Router）
│   ├── page.tsx         # 首页
│   ├── discover/        # 发现页
│   ├── history/         # 影史与流派
│   ├── movie/[slug]/    # 电影详情
│   ├── collections/     # 收藏夹
│   ├── likes/           # 喜欢列表
│   ├── profile/         # 个人中心
│   ├── focus/           # 焦点模式
│   └── api/             # 后端 API 路由（TMDb / 资源站代理）
├── components/          # React 组件
│   ├── home/            # 首页组件
│   ├── globe/           # 3D 地球
│   ├── history/         # 影史组件
│   ├── focus/           # 焦点模式（计时器 / 网易云播放器）
│   ├── movie/           # 电影详情组件
│   ├── layout/          # 布局（侧边栏 / 底部导航 / 主题）
│   └── shared/          # 通用组件
├── lib/                 # 工具库
│   ├── tmdb.ts          # TMDb API 封装
│   ├── resource-station.ts  # 苹果CMS 资源站封装
│   ├── recommendation-engine.ts  # 推荐引擎
│   ├── storage.ts       # localStorage 持久化
│   └── types.ts         # 类型定义
├── data/                # 静态数据（电影 / 流派 / 国家 / 名言）
├── public/              # 静态资源（图标 / PWA / 字体）
└── scripts/             # 构建脚本（图标 / 地球粒子生成）
```

---

## 🙏 致谢

- [The Movie Database (TMDb)](https://www.themoviedb.org/) — 电影元数据
- [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) — 网易云音乐 API
- 电影数据以豆瓣 8.0+ / IMDb 7.5+ 高分片为主

---

## 📄 License

MIT License © 2026 CineVault
