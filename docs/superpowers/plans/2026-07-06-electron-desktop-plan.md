# CineVault Electron 桌面版 — 实施计划

> **For agentic workers:** 每个 Task 需独立实现并审查。Task 1-3 在 `E:\ai开发\音乐软件解读\` 目录操作，Task 4-5 在 `E:\ai开发\电影网页\` 目录操作。

**Goal:** 将 CineVault 转为真正的 Electron 桌面应用，集成本地 NeteaseCloudMusicApi，实现扫码登录/音乐播放/全屏专注。

**Architecture:** Electron Main Process 启动时 fork NeteaseCloudMusicApi 子进程，通过 IPC 暴露 API 给 Renderer（Vercel 前端）。Focus 页面支持二维码登录、HTML5 Audio 播放、全屏沉浸模式。

**Tech Stack:** Electron, NeteaseCloudMusicApi, IPC, Next.js 14, React 18, HTML5 Audio

---

### Task 1: 安装 NeteaseCloudMusicApi 并配置 package.json

**目录:** `E:\ai开发\音乐软件解读\`

**Files:**
- Modify: `package.json`
- Create: `netease-api/` (由 npm 创建)

- [ ] **Step 1: 安装 NeteaseCloudMusicApi**

```bash
cd "E:\ai开发\音乐软件解读"
npm install NeteaseCloudMusicApi
```

- [ ] **Step 2: 更新 package.json 的 scripts**

```bash
# main 字段已存在，确认无误后即可
```

package.json 内容应为：
```json
{
  "name": "cinevault-desktop",
  "version": "1.0.0",
  "description": "CineVault - 电影发现平台桌面版",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac",
    "build:linux": "electron-builder --linux"
  },
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "electron": "^33.4.0",
    "electron-builder": "^26.15.3"
  },
  "dependencies": {
    "NeteaseCloudMusicApi": "^4.0.0"
  },
  "build": { ... }
}
```

- [ ] **Step 3: 提交**

```bash
cd "E:\ai开发\音乐软件解读"
git init  # 如果还没有 git
git add -A && git commit -m "chore: add NeteaseCloudMusicApi dependency"
```

---

### Task 2: 创建 preload.js — IPC 桥接

**目录:** `E:\ai开发\音乐软件解读\`

**Files:**
- Create: `preload.js`

- [ ] **Step 1: 创建 preload.js**

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 网易云 API 代理 — 前端调用此方法，主进程代理到 localhost:3001
  neteaseApi: (endpoint, params) =>
    ipcRenderer.invoke('netease-api', endpoint, params),

  // 全屏控制
  enterFullscreen: () => ipcRenderer.invoke('enter-fullscreen'),
  exitFullscreen: () => ipcRenderer.invoke('exit-fullscreen'),
  isFullscreen: () => ipcRenderer.invoke('is-fullscreen'),

  // 轮询全屏状态变化
  onFullscreenChange: (callback) => {
    ipcRenderer.on('fullscreen-changed', (event, isFullscreen) => callback(isFullscreen));
  },

  // 环境标识
  isElectron: true,
});
```

- [ ] **Step 2: 提交**

```bash
git add preload.js && git commit -m "feat: add preload.js IPC bridge"
```

---

### Task 3: 重写 main.js — 主进程

**目录:** `E:\ai开发\音乐软件解读\`

**Files:**
- Modify: `main.js`

- [ ] **Step 1: 重写 main.js**

```javascript
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const http = require('http');

const SITE_URL = 'https://cinevault-app-six.vercel.app';
const API_PORT = 3001;
let apiProcess = null;
let mainWindow = null;

// ==================== 启动网易云 API 服务 ====================
function startNeteaseApi() {
  return new Promise((resolve, reject) => {
    // NeteaseCloudMusicApi 入口文件
    const apiEntry = require.resolve('NeteaseCloudMusicApi/app.js');
    
    apiProcess = fork(apiEntry, [], {
      env: { ...process.env, PORT: String(API_PORT) },
      silent: true,
    });

    apiProcess.stdout.on('data', (data) => {
      console.log(`[NeteaseAPI] ${data}`);
    });
    apiProcess.stderr.on('data', (data) => {
      console.error(`[NeteaseAPI] ${data}`);
    });

    // 轮询等待 API 服务就绪
    let attempts = 0;
    const checkReady = setInterval(() => {
      http.get(`http://localhost:${API_PORT}/search?keywords=test`, (res) => {
        clearInterval(checkReady);
        console.log('[NeteaseAPI] Service ready on port', API_PORT);
        resolve();
      }).on('error', () => {
        attempts++;
        if (attempts > 50) {
          clearInterval(checkReady);
          console.warn('[NeteaseAPI] Timeout, proceeding without API');
          resolve();
        }
      });
    }, 200);
  });
}

// ==================== IPC 处理 ====================
function setupIPC() {
  // 代理所有网易云 API 请求
  ipcMain.handle('netease-api', async (event, endpoint, params = {}) => {
    const url = new URL(`http://localhost:${API_PORT}${endpoint}`);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
    
    try {
      const res = await fetch(url.toString());
      return await res.json();
    } catch (e) {
      return { code: -1, msg: `API error: ${e.message}` };
    }
  });

  // 全屏控制
  ipcMain.handle('enter-fullscreen', () => {
    if (mainWindow) mainWindow.setFullScreen(true);
    return true;
  });
  ipcMain.handle('exit-fullscreen', () => {
    if (mainWindow) mainWindow.setFullScreen(false);
    return true;
  });
  ipcMain.handle('is-fullscreen', () => {
    return mainWindow ? mainWindow.isFullScreen() : false;
  });
}

// ==================== 创建窗口 ====================
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'CineVault',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(SITE_URL);

  // 监听全屏变化
  mainWindow.on('enter-full-screen', () => {
    mainWindow.webContents.send('fullscreen-changed', true);
  });
  mainWindow.on('leave-full-screen', () => {
    mainWindow.webContents.send('fullscreen-changed', false);
  });

  // 外部链接用默认浏览器
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

// ==================== 启动 ====================
app.whenReady().then(async () => {
  setupIPC();
  await startNeteaseApi();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (apiProcess) apiProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});
```

- [ ] **Step 2: 验证 Electron 能启动**

```bash
cd "E:\ai开发\音乐软件解读"
npm start
```

- [ ] **Step 3: 提交**

```bash
git add main.js && git commit -m "feat: rewrite main.js with NeteaseCloudMusicApi + IPC + fullscreen"
```

---

### Task 4: 重写 NeteasePlayer 组件 — 真实网易云播放器

**目录:** `E:\ai开发\电影网页\`

**Files:**
- Modify: `components/focus/NeteasePlayer.tsx`

- [ ] **Step 1: 重写 NeteasePlayer.tsx**

新的播放器：
- 检测 `window.electronAPI.isElectron`
- Electron 环境：二维码登录 → 搜索歌单/歌曲 → HTML5 Audio 播放
- 浏览器环境：保持现有简单 UI

```tsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ============ 类型声明 ============
declare global {
  interface Window {
    electronAPI?: {
      neteaseApi: (endpoint: string, params?: Record<string, string>) => Promise<any>;
      enterFullscreen: () => Promise<boolean>;
      exitFullscreen: () => Promise<boolean>;
      isFullscreen: () => Promise<boolean>;
      onFullscreenChange: (cb: (isFullscreen: boolean) => void) => void;
      isElectron: boolean;
    };
  }
}

interface SongItem {
  id: number;
  name: string;
  ar: { name: string }[];
  al: { name: string; picUrl: string };
  dt: number; // duration in ms
}

// ============ 浏览器环境简化版 ============
function BrowserPlayer() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs"
      style={{ background: "var(--theme-card)", border: "1px solid var(--theme-border)", color: "var(--theme-text-secondary)" }}>
      <span>🎵</span>
      <a href="https://music.163.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">
        打开网易云音乐
      </a>
    </div>
  );
}

// ============ Electron 完整播放器 ============
function ElectronPlayer({ autoPlay }: { autoPlay: boolean }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrKey, setQrKey] = useState<string | null>(null);
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [currentSong, setCurrentSong] = useState<SongItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cookie, setCookie] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const api = window.electronAPI!;

  // ====== 扫码登录 ======
  const startLogin = async () => {
    const keyData = await api.neteaseApi('/login/qr/key');
    const key = keyData?.data?.unikey;
    if (!key) return;
    setQrKey(key);
    const qrData = await api.neteaseApi('/login/qr/create', { key, qrimg: 'true' });
    if (qrData?.data?.qrimg) {
      setQrUrl(qrData.data.qrimg);
    }
    // 轮询检查扫码状态
    pollLogin(key);
  };

  const pollLogin = async (key: string) => {
    const check = async () => {
      const res = await api.neteaseApi('/login/qr/check', { key, timestamp: String(Date.now()) });
      if (res.code === 800) { setLoggedIn(false); setQrUrl(null); setTimeout(check, 3000); }
      else if (res.code === 803) {
        // 登录成功，保存 cookie
        setCookie(res.cookie || '');
        setLoggedIn(true);
        setQrUrl(null);
        setQrKey(null);
        // 加载每日推荐
        loadDailySongs(res.cookie);
      }
      else if (res.code === 801) { setTimeout(check, 2000); } // 等待扫码
    };
    check();
  };

  // ====== 加载推荐歌曲 ======
  const loadDailySongs = async (ck = cookie) => {
    try {
      const res = await api.neteaseApi('/recommend/songs', { cookie: ck });
      const list = res?.data?.dailySongs || [];
      setSongs(list.slice(0, 30));
    } catch {
      // 推荐不可用，搜索热门歌曲
      searchSongs('轻音乐');
    }
  };

  // ====== 搜索 ======
  const searchSongs = async (q: string) => {
    const res = await api.neteaseApi('/search', { keywords: q, limit: '20', type: '1' });
    const list = res?.result?.songs || [];
    setSongs(list.map((s: any) => ({
      id: s.id,
      name: s.name,
      ar: s.ar || [],
      al: s.al || { name: '', picUrl: '' },
      dt: s.dt || 0,
    })));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) searchSongs(searchQuery.trim());
  };

  // ====== 播放 ======
  const playSong = async (song: SongItem) => {
    const res = await api.neteaseApi('/song/url', { id: String(song.id), cookie });
    const url = res?.data?.[0]?.url;
    if (!url) return;
    
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    audioRef.current.src = url;
    audioRef.current.play();
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentSong) {
      // 有歌单没在放 → 播放第一首
      if (songs.length > 0) playSong(songs[0]);
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // ====== 自动播放 ======
  useEffect(() => {
    if (autoPlay && songs.length > 0 && !currentSong) {
      playSong(songs[0]);
    }
  }, [autoPlay, songs]);

  // ====== UI ======
  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-md">
      {/* 未登录 → 二维码 */}
      {!loggedIn && (
        <div className="flex flex-col items-center gap-2">
          {qrUrl ? (
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg" style={{ background: "var(--theme-card)" }}>
              <img src={qrUrl} alt="扫码登录" className="w-40 h-40" />
              <p className="text-[10px]" style={{ color: "var(--theme-text-secondary)" }}>
                请用网易云音乐APP扫码登录
              </p>
            </div>
          ) : (
            <button
              onClick={startLogin}
              className="px-4 py-2 rounded-full text-xs transition-all"
              style={{ background: "var(--theme-accent)", color: "#fff" }}
            >
              🔐 登录网易云音乐
            </button>
          )}
        </div>
      )}

      {/* 已登录 → 搜索 + 播放 */}
      {loggedIn && (
        <>
          <form onSubmit={handleSearch} className="w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索歌曲..."
              className="w-full px-3 py-1.5 rounded-full text-xs outline-none"
              style={{ background: "var(--theme-card)", border: "1px solid var(--theme-border)", color: "var(--theme-text)" }}
            />
          </form>

          <div className="w-full max-h-40 overflow-y-auto space-y-1">
            {songs.slice(0, 15).map((song) => (
              <button
                key={song.id}
                onClick={() => playSong(song)}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-xs transition-all hover:opacity-70"
                style={{
                  background: currentSong?.id === song.id ? "var(--theme-accent-light)" : "transparent",
                  color: "var(--theme-text)",
                }}
              >
                <span className="truncate flex-1">{song.name}</span>
                <span className="text-[10px] truncate" style={{ color: "var(--theme-text-secondary)" }}>
                  {song.ar?.[0]?.name || ''}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-lg transition-all hover:scale-110"
              style={{ color: "var(--theme-accent)" }}>
              {isPlaying ? "⏸" : "▶"}
            </button>
            {currentSong && (
              <span className="text-xs truncate max-w-[200px]" style={{ color: "var(--theme-text)" }}>
                {currentSong.name} - {currentSong.ar?.[0]?.name}
              </span>
            )}
          </div>
        </>
      )}

      {audioRef.current && null}
    </div>
  );
}

// ============ 导出 ============
export default function NeteasePlayer({ autoPlay = false }: { autoPlay?: boolean }) {
  const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

  if (!isElectron) return <BrowserPlayer />;
  return <ElectronPlayer autoPlay={autoPlay} />;
}
```

- [ ] **Step 2: 验证编译**

```bash
cd "E:\ai开发\电影网页"
npx tsc --noEmit
```

- [ ] **Step 3: 提交**

```bash
git add components/focus/NeteasePlayer.tsx
git commit -m "feat: real NeteaseCloudMusicApi player with QR login + HTML5 audio"
```

---

### Task 5: 焦点页面 — 全屏模式 + 自动播放

**目录:** `E:\ai开发\电影网页\`

**Files:**
- Modify: `app/focus/page.tsx`

- [ ] **Step 1: 修改 page.tsx 增加全屏模式**

在现有 page.tsx 中添加：
- `isElectron` 检测
- 计时器启动时 → 全屏 + 隐藏装饰和返回按钮
- 计时器暂停/结束时 → 退出全屏
- 传递 `autoPlay` prop 给 NeteasePlayer

修改后的关键部分：

```tsx
// 在 FocusPage 组件中添加:
const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;
const [isFullscreen, setIsFullscreen] = useState(false);

// 监听全屏变化
useEffect(() => {
  if (!isElectron) return;
  window.electronAPI!.onFullscreenChange(setIsFullscreen);
}, [isElectron]);

// 计时器切换
const handleTimerToggle = () => {
  if (!timerRunning && isElectron) {
    // 开始专注 → 全屏
    window.electronAPI!.enterFullscreen();
  } else if (timerRunning && isElectron) {
    // 暂停 → 退出全屏
    window.electronAPI!.exitFullscreen();
  }
  setTimerRunning(!timerRunning);
};

// JSX 中:
// 非全屏时显示返回按钮和侧边装饰
{!isFullscreen && (
  <Link href="/" ...>返回</Link>
)}
{!isFullscreen && (
  <>
    <SideDecor side="left" />
    <SideDecor side="right" />
  </>
)}

// 底部音乐 — 传递 autoPlay
<NeteasePlayer autoPlay={timerRunning && isElectron} />
```

- [ ] **Step 2: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: 提交**

```bash
git add app/focus/page.tsx
git commit -m "feat: fullscreen focus mode + auto-play in Electron"
```

---

### Task 6: 构建验证 + 部署

- [ ] **Step 1: 构建 Next.js**

```bash
cd "E:\ai开发\电影网页"
npx next build
```

- [ ] **Step 2: 部署到 Vercel**

```bash
npx vercel deploy --prod --yes
```

- [ ] **Step 3: 测试 Electron 桌面端**

```bash
cd "E:\ai开发\音乐软件解读"
npm start
```

验证：
1. 网易云 API 是否在后台启动（终端有 `[NeteaseAPI] Service ready` 日志）
2. 桌面窗口是否正常加载 CineVault
3. 进入 Focus 页面 → 点"登录网易云音乐" → 扫码
4. 登录后搜索/播放歌曲
5. 点"开始专注" → 全屏 → 音乐自动播放 → 计时结束 → 音效

- [ ] **Step 4: 提交**

```bash
git add -A && git commit -m "feat: complete Electron desktop app with NeteaseCloudMusicApi integration"
```

---

## 实施顺序

```
Task 1 (安装依赖)
  → Task 2 (preload.js)
    → Task 3 (main.js 重写)
      → Task 4 (NeteasePlayer 重写)
        → Task 5 (page.tsx 全屏)
          → Task 6 (构建+部署+测试)
```
