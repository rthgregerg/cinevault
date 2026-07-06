# CineVault Electron 桌面版 — 设计规范

**日期**: 2026-07-06
**状态**: 待实施
**目标**: 将 CineVault 转换为 Electron 桌面应用，集成本地 NeteaseCloudMusicApi 实现扫码登录、音乐播放。焦点模式支持全屏沉浸和自动播放。

---

## 1. 架构

```
┌─────────────────────────────────────────────────────────┐
│                  Electron Desktop App                    │
│                                                         │
│  ┌──────────────────┐    IPC     ┌───────────────────┐  │
│  │   Renderer        │◄─────────▶│   Main Process     │  │
│  │   (Vercel 网站)   │           │   (main.js)        │  │
│  │                   │           │                    │  │
│  │   window.         │           │  - 启动/管理 API   │  │
│  │   electronAPI     │           │  - 全屏控制        │  │
│  └──────────────────┘           │  - IPC 路由        │  │
│                                  └────────┬──────────┘  │
│                                           │             │
│                                  ┌────────▼──────────┐  │
│                                  │ NeteaseCloudMusicApi│  │
│                                  │ localhost:3001     │  │
│                                  └───────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

- **Renderer**: 加载 Vercel 部署的 CineVault 网站。所有页面（首页、发现、焦点等）通过 `window.electronAPI` 调用本地 API 和系统功能
- **Main Process**: 启动时自动运行 NeteaseCloudMusicApi 子进程，处理 IPC 请求，控制窗口全屏
- **NeteaseCloudMusicApi**: 独立 Node.js 服务，处理所有网易云通信

## 2. 文件结构

```
E:\ai开发\音乐软件解读\
├── main.js              ← [REWRITE] 主进程
├── preload.js           ← [CREATE] IPC 桥接
├── package.json         ← [MODIFY] 添加依赖
├── netease-api/         ← [CREATE] NeteaseCloudMusicApi
└── node_modules/

E:\ai开发\电影网页\
├── components/focus/
│   ├── NeteasePlayer.tsx  ← [REWRITE] 真实 API 播放
│   ├── FocusTimer.tsx     ← [MODIFY] 触发自动播放
│   ├── QuoteCarousel.tsx  ← [KEEP]
│   ├── Starfield.tsx      ← [KEEP]
│   └── SideDecor.tsx      ← [KEEP]
└── app/focus/page.tsx     ← [MODIFY] 全屏模式
```

## 3. preload.js — IPC 桥接

```js
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // 网易云 API 代理
  neteaseApi: (endpoint, params) => ipcRenderer.invoke('netease-api', endpoint, params),
  
  // 全屏控制
  enterFullscreen: () => ipcRenderer.invoke('enter-fullscreen'),
  exitFullscreen: () => ipcRenderer.invoke('exit-fullscreen'),
  isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),
  
  // 检查是否在 Electron 环境
  isElectron: true,
})
```

## 4. main.js — 主进程

**启动流程**:
1. 启动 NeteaseCloudMusicApi 子进程（监听 localhost:3001）
2. 等待 API 服务就绪
3. 创建 BrowserWindow，配置 preload.js
4. 加载 `https://cinevault-app-six.vercel.app`

**IPC 处理**:
- `netease-api` → 代理请求到 `http://localhost:3001/<endpoint>?<params>`
- `enter-fullscreen` → `win.setFullScreen(true)`
- `exit-fullscreen` → `win.setFullScreen(false)`  
- `is-fullscreen` → 返回当前全屏状态

## 5. NeteasePlayer — 真实网易云播放器

替代现有的 iframe 方案：

```
┌─────────────────────────────────────────┐
│  🔐 未登录状态                           │
│  ┌─────────────────────────────────┐    │
│  │     [二维码图片]                 │    │
│  │  请用网易云音乐APP扫码登录        │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🎵 已登录状态                           │
│  🔍 [搜索歌曲...]                        │
│  ┌─────────────────────────────────┐    │
│  │  ♪ 歌曲名 - 歌手          ▶    │    │
│  │  ♪ 歌曲名 - 歌手          ▶    │    │
│  └─────────────────────────────────┘    │
│  ⏯  ▶/⏸  ⏭  🔊                      │
└─────────────────────────────────────────┘
```

**功能**:
- QR 码扫码登录 (`/login/qr/key` → `/login/qr/create` → `/login/qr/check`)
- 搜索歌曲 (`/search?keywords=xxx`)
- 获取每日推荐歌单 (`/recommend/songs`)
- 获取播放 URL (`/song/url?id=xxx`)
- HTML5 Audio 播放
- 显示歌词 (可选，`/lyric?id=xxx`)

## 6. 焦点模式全屏

点击"开始专注"后：
1. 计时器启动
2. BrowserWindow 进入全屏 (`electronAPI.enterFullscreen()`)
3. 隐藏 SideDecor、返回按钮
4. 自动播放当前选中歌曲/歌单
5. 计时结束 → 音效提醒 → 退出全屏

## 7. 环境检测

前端通过 `window.electronAPI?.isElectron` 判断是否在 Electron 中运行：
- Electron 环境：显示完整网易云播放器、全屏按钮
- 浏览器环境（Vercel）：显示简化版（现有 NeteasePlayer）

## 8. 不做的事情

- 不做 QQ 音乐集成（只做网易云）
- 不做本地音乐文件播放
- 不做 3D 歌单架
- 不做天气推荐
- CineVault 网站仍保留 Vercel 部署，Electron 只是加载它
