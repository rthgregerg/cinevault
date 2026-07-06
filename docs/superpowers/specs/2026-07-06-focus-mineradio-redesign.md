# CineVault 专注模式重构 — 设计文档

**日期**: 2026-07-06
**状态**: 待实施
**目标**: 将 /focus 专注页面彻底重做为 Mineradio 风格的音乐播放器体验——3D粒子星空背景、计时器带音效提醒、电影名言轮播、网易云音乐控制。

---

## 1. 现状

当前 `/focus` 页面（`app/focus/page.tsx`，530行单文件）已包含：
- 电影名言轮播 + TMDB 海报加载
- 番茄钟计时器（25/45/60分钟，环形进度条）
- 网易云音乐 iframe 播放器（场景选择）
- 主题自适应侧边装饰

**问题**：代码全部在一个文件里，缺少 3D 沉浸感，音乐体验不够突出。

## 2. 目标

- 3D 粒子星空背景（缓慢旋转的星系粒子场）
- 计时器带结束音效提醒
- 电影名言轮播 + 海报保留
- 网易云音乐控制保留
- 代码拆分为独立组件

## 3. 架构

```
app/focus/page.tsx         → 页面容器，组装所有组件
components/focus/
├── Starfield.tsx          → [NEW] 3D粒子星空背景（Three.js）
├── FocusTimer.tsx         → [NEW] 计时器（从page.tsx抽出 + 音效）
├── QuoteCarousel.tsx      → [NEW] 名言轮播+海报（从page.tsx抽出）
├── NeteasePlayer.tsx      → [EXIST] 网易云音乐控制
└── SideDecor.tsx          → [NEW] 主题侧边装饰（从page.tsx抽出）
```

## 4. 组件设计

### 4.1 Starfield — 3D粒子星空

- 基于 Three.js / React Three Fiber（项目已有依赖）
- 1000-2000 个粒子散布在 3D 空间中
- 缓慢绕 Y 轴旋转（约 0.1 rad/s）
- 粒子颜色跟随主题 accent color
- 可选：鼠标移动产生微小的视角偏移（parallax）
- 非交互式，纯装饰

### 4.2 FocusTimer — 计时器

- 从 page.tsx 中抽出，逻辑不变
- 预设：25分钟 / 45分钟 / 60分钟
- 环形 SVG 进度条
- 数字倒计时显示（MM:SS）
- **新增**：倒计时结束 → 播放音频提示
  - 使用 Web Audio API 生成简单提示音（无需外部音频文件）
  - 或用 `<audio>` 标签播放内置音效

### 4.3 QuoteCarousel — 名言轮播

- 从 page.tsx 中抽出，逻辑不变
- 电影名言卡片 + TMDB 海报
- 12秒自动轮播（计时器运行中暂停轮播）
- 左右箭头手动切换
- 进度点导航

### 4.4 NeteasePlayer — 音乐控制

- 保留现有 `components/focus/NeteasePlayer.tsx`
- 场景选择：爵士/钢琴/雨声/海浪/森林/咖啡馆
- iframe 外链播放器

### 4.5 SideDecor — 侧边装饰

- 从 page.tsx 中抽出
- 4套主题装饰（classic/nouvelle/noir/deco）

## 5. 页面布局

```
┌──────────────────────────────────────────┐
│              Starfield 3D 背景            │
│                                          │
│   ← 返回          FOCUS MODE            │
│                                          │
│           ┌─────────────────┐            │
│           │  QuoteCarousel  │            │
│           │  名言 + 海报    │            │
│           └─────────────────┘            │
│                                          │
│              FocusTimer                  │
│           ⭕ 环形进度                    │
│           [25] [45] [60]                │
│           [开始专注]                     │
│                                          │
│           NeteasePlayer                 │
│           🎵 爵士 ▾  🎹 网易云          │
│                                          │
│         SideDecor(L)    SideDecor(R)    │
└──────────────────────────────────────────┘
```

## 6. 音效提醒

计时结束时播放音频提示：

**方案**：Web Audio API 生成简单的 "叮叮叮" 提示音
- 无需外部音频文件
- 轻量（几行代码）
- 可循环播放直到用户手动停止

实现：
```ts
function playAlarm() {
  const ctx = new AudioContext();
  [0, 200, 400].forEach((delay, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880 + i * 220;
    gain.gain.value = 0.3;
    osc.start(ctx.currentTime + delay / 1000);
    osc.stop(ctx.currentTime + delay / 1000 + 0.3);
  });
}
```

## 7. 不变的内容

- 主题系统（ThemeProvider）— 不变
- 网易云歌单 ID — 不变
- 名言数据 — 不变
- 番茄钟预设 — 不变

## 8. 不做的事情

- 不做网易云登录/搜索（保持现有 iframe 外链方案）
- 不做天气 API 集成（太复杂）
- 不做歌词同步（需要额外 API）
- 不做 Mineradio 的 3D 歌单架（web 端实现成本太高）
- 不改变现有主题系统
