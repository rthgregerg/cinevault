# 专注模式 + 全站动效 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完善 CineVault 专注模式页面（大卫雕塑 + 电影名言轮播 + 网易云音景），并将 Unicorn Studio 风格动效集成到全站。

**Architecture:** Next.js App Router + Tailwind CSS。专注页为独立 `/focus` 路由（客户端组件），使用真实大卫雕像 PNG 图片。全站通过 layout 注入 CursorGlow，通过 MovieCard 等关键组件集成 ParallaxTilt。

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS 3, TMDB API

---

## 文件结构

```
修改:
  app/focus/page.tsx              # 大卫 PNG 替换 SVG，微调样式
  components/shared/MovieCard.tsx  # 集成 ParallaxTilt
  components/shared/ParallaxTilt.tsx # 修复 RAF 内存泄漏
  components/home/DailyPick.tsx    # 集成 ParallaxTilt

新增:
  public/sculptures/david-left.png  # 大卫雕像 PNG（左，面向右）
  public/sculptures/david-right.png # 大卫雕像 PNG（右，镜像）

删除:
  public/david-statue.png          # 失败的下载（HTML 错误页）
  public/david-statue2.png         # 失败的下载（HTML 错误页）
```

---

## Task 1: 修复 ParallaxTilt 的内存泄漏

**Files:**
- Modify: `components/shared/ParallaxTilt.tsx`

**问题：** `rafRef.current === 0` 作为模块级检查来启动动画循环是错误的——在 Strict Mode 下会导致多个循环同时运行，且组件卸载时不会清理。

- [ ] **Step 1: 用 useEffect 管理动画生命周期**

把 `components/shared/ParallaxTilt.tsx` 第 73-76 行的模块级检查：

```tsx
// Start animation loop once
if (rafRef.current === 0) {
  rafRef.current = requestAnimationFrame(animate);
}
```

替换为 useEffect（添加在 return 之前，animate 函数定义之后）：

```tsx
useEffect(() => {
  rafRef.current = requestAnimationFrame(animate);
  return () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };
}, []);
```

- [ ] **Step 2: 构建验证**

```bash
npx next build 2>&1 | tail -5
```
Expected: ✓ Compiled successfully

- [ ] **Step 3: Commit**

```bash
git add components/shared/ParallaxTilt.tsx
git commit -m "fix: ParallaxTilt RAF memory leak — move animation loop into useEffect cleanup"
```

---

## Task 2: MovieCard 集成 ParallaxTilt

**Files:**
- Modify: `components/shared/MovieCard.tsx`

- [ ] **Step 1: 包裹卡片在 ParallaxTilt 中**

在 `components/shared/MovieCard.tsx` 顶部添加 import：
```tsx
import ParallaxTilt from "./ParallaxTilt";
```

将 return 中的最外层 `<Link>` 改为：
```tsx
<ParallaxTilt tiltAmount={6} glare={0.06} className="block">
  <Link href={`/movie/${movie.id}`} className="card block group">
    {/* 原有内容不变 */}
  </Link>
</ParallaxTilt>
```

注意：`ParallaxTilt` 需要一个 `relative` 定位容器来让 `data-glare` 层正确覆盖。检查 `ParallaxTilt` 的外层 div 是否已经设置 `position: relative`——如果没有，添加 `className="relative"`。

- [ ] **Step 2: 构建验证**

```bash
npx next build 2>&1 | tail -5
```
Expected: ✓ Compiled successfully

- [ ] **Step 3: Commit**

```bash
git add components/shared/MovieCard.tsx
git commit -m "feat: integrate ParallaxTilt into MovieCard for 3D hover effect"
```

---

## Task 3: DailyPick 集成 ParallaxTilt

**Files:**
- Modify: `components/home/DailyPick.tsx`

- [ ] **Step 1: 包裹每日推荐在 ParallaxTilt 中**

在 `components/home/DailyPick.tsx` 顶部添加 import：
```tsx
import ParallaxTilt from "@/components/shared/ParallaxTilt";
```

将最外层包裹：
```tsx
<ParallaxTilt tiltAmount={4} glare={0.08}>
  <Link href={`/movie/${movie.id}`}>
    <section className="relative mb-section rounded-card overflow-hidden h-48 group cursor-pointer">
      {/* 原有内容不变 */}
    </section>
  </Link>
</ParallaxTilt>
```

- [ ] **Step 2: 构建验证 + 提交**

```bash
npx next build 2>&1 | tail -5
git add components/home/DailyPick.tsx
git commit -m "feat: integrate ParallaxTilt into DailyPick"
```

---

## Task 4: 下载真实大卫雕像 PNG

**Files:**
- Create: `public/sculptures/david-left.png`
- Create: `public/sculptures/david-right.png`
- Delete: `public/david-statue.png`, `public/david-statue2.png`

- [ ] **Step 1: 创建目录并清理失败下载**

```bash
mkdir -p public/sculptures
rm -f public/david-statue.png public/david-statue2.png
```

- [ ] **Step 2: 下载大卫雕像图片**

由于网络限制，需要用户手动操作：

1. 访问 https://www.cleanpng.com 或 https://pngmaker.io 搜索 "David Michelangelo statue"
2. 下载高清透明 PNG（建议 2000px+ 高度）
3. 保存为 `public/sculptures/david-left.png`（面向右）
4. 用图片编辑工具水平翻转得到 `public/sculptures/david-right.png`

或使用在线背景移除工具处理 Wikimedia Commons 的 CC0 图片：
- 原始图片：`https://commons.wikimedia.org/wiki/File:Michelangelo%27s_David_-_right_view_2.jpg`
- 移除背景：https://www.remove.bg

- [ ] **Step 3: Commit**

```bash
git add public/sculptures/
git commit -m "feat: add Michelangelo David statue PNG assets"
```

---

## Task 5: 专注页使用真实大卫 PNG

**Files:**
- Modify: `app/focus/page.tsx`

- [ ] **Step 1: 替换 DavidSculpture 组件**

在 `app/focus/page.tsx` 中，删除整个 `DavidSculpture` 函数定义（约60行 SVG 代码），替换为：

```tsx
function DavidImage({ mirror = false }: { mirror?: boolean }) {
  const src = mirror
    ? "/sculptures/david-right.png"
    : "/sculptures/david-left.png";
  return (
    <img
      src={src}
      alt="Michelangelo's David"
      className="w-full h-full object-contain object-bottom"
      style={{
        filter: "drop-shadow(0 4px 16px rgba(30,20,10,0.06))",
        opacity: 0.92,
      }}
    />
  );
}
```

- [ ] **Step 2: 替换所有 <DavidSculpture /> 为 <DavidImage />**

在 JSX 中搜索 `DavidSculpture` 并替换为 `DavidImage`（共4处：桌面左、桌面右、移动左、移动右）

- [ ] **Step 3: 为图片缺失添加 fallback**

在 `DavidImage` 中添加 onError 处理，图片加载失败时显示大理石色占位块：

```tsx
function DavidImage({ mirror = false }: { mirror?: boolean }) {
  const [failed, setFailed] = useState(false);
  const src = mirror
    ? "/sculptures/david-right.png"
    : "/sculptures/david-left.png";

  if (failed) {
    return (
      <div className="w-full h-full flex items-end justify-center"
        style={{
          background: `linear-gradient(180deg,
            rgba(238,232,220,0.5) 0%, rgba(228,220,208,0.6) 20%,
            rgba(218,210,196,0.55) 50%, rgba(208,200,188,0.4) 100%)`,
          borderRadius: "6px 6px 3px 3px",
          transform: mirror ? "scale(-1, 1)" : "",
        }}
      >
        <span style={{ color: "#b0a090", fontSize: "8px", letterSpacing: "2px", paddingBottom: "8px" }}>
          DAVID
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="Michelangelo's David"
      className="w-full h-full object-contain object-bottom"
      style={{
        filter: "drop-shadow(0 4px 16px rgba(30,20,10,0.06))",
        opacity: 0.92,
        transform: mirror ? "scale(-1, 1)" : "",
      }}
      onError={() => setFailed(true)}
    />
  );
}
```

需要在文件顶部已有 import 处添加 `useState`（当前已有）。

- [ ] **Step 4: 构建验证 + 提交**

```bash
npx next build 2>&1 | tail -5
git add app/focus/page.tsx
git commit -m "feat: replace SVG David with real PNG images with marble fallback"
```

---

## Task 6: 验证 CursorGlow 已正确集成

**Files:**
- 检查: `app/layout.tsx`（已添加 CursorGlow）

- [ ] **Step 1: 确认 layout.tsx 导入正确**

检查 `app/layout.tsx`：
```tsx
import CursorGlow from "@/components/shared/CursorGlow";
```
且在 `<body>` 内第一个子元素是 `<CursorGlow />`。

（该步骤为验证，如果之前提交已包含则跳过）

- [ ] **Step 2: 确认无变更需要提交**

```bash
git status
```
Expected: clean (或只有 .agents/, .superpowers/ 等非代码文件)

---

## Task 7: 最终构建 + 部署

- [ ] **Step 1: 完整构建**

```bash
npx next build 2>&1 | tail -30
```
Expected: ✓ Compiled successfully，所有 12 个路由正常

- [ ] **Step 2: 部署到 Vercel 生产环境**

```bash
vercel --prod --force
```
Expected: 部署到 https://cinevault-app-six.vercel.app

- [ ] **Step 3: 验证线上页面**

访问 https://cinevault-app-six.vercel.app/focus 检查：
- 两侧大卫雕像显示
- 名言自动轮播
- 音景切换
- 网易云链接
- 移动端响应式

- [ ] **Step 4: 最终提交**

```bash
git add -A
git commit -m "chore: finalize focus mode with David sculptures, ParallaxTilt integration, deploy ready"
```
