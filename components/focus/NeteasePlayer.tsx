"use client";
import { useState, useEffect, useRef } from "react";

// ============ 全局类型声明 ============
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
  dt: number;
}

interface NeteasePlayerProps {
  autoPlay?: boolean;
}

// ============ 浏览器环境 — 简化版 ============
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
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const api = window.electronAPI!;

  // ====== 扫码登录 ======
  const startLogin = async () => {
    setLoading(true);
    try {
      const keyData = await api.neteaseApi('/login/qr/key');
      const key = keyData?.data?.unikey;
      if (!key) { setLoading(false); return; }
      setQrKey(key);
      const qrData = await api.neteaseApi('/login/qr/create', { key, qrimg: 'true' });
      if (qrData?.data?.qrimg) {
        setQrUrl(qrData.data.qrimg);
        setLoading(false);
        pollLogin(key);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  const pollLogin = (key: string) => {
    const check = async () => {
      try {
        const res = await api.neteaseApi('/login/qr/check', { key, timestamp: String(Date.now()) });
        if (res.code === 800) {
          setTimeout(check, 3000);
        } else if (res.code === 803) {
          const ck = res.cookie || '';
          setCookie(ck);
          setLoggedIn(true);
          setQrUrl(null);
          setQrKey(null);
          loadDailySongs(ck);
        } else if (res.code === 801) {
          setTimeout(check, 2000);
        } else {
          setTimeout(check, 3000);
        }
      } catch {
        setTimeout(check, 3000);
      }
    };
    check();
  };

  // ====== 加载推荐 ======
  const loadDailySongs = async (ck = cookie) => {
    try {
      const res = await api.neteaseApi('/recommend/songs', { cookie: ck });
      const list = res?.data?.dailySongs || [];
      if (list.length > 0) {
        setSongs(list.slice(0, 30));
        return;
      }
    } catch {}
    // 推荐不可用 → 搜索轻音乐
    searchSongs('轻音乐 纯音乐');
  };

  // ====== 搜索 ======
  const searchSongs = async (q: string) => {
    setLoading(true);
    try {
      const res = await api.neteaseApi('/search', { keywords: q, limit: '20', type: '1' });
      const list = res?.result?.songs || [];
      setSongs(list.map((s: any) => ({
        id: s.id,
        name: s.name,
        ar: s.ar || [],
        al: s.al || { name: '', picUrl: '' },
        dt: s.dt || 0,
      })));
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) searchSongs(searchQuery.trim());
  };

  // ====== 播放 ======
  const playSong = async (song: SongItem) => {
    try {
      const res = await api.neteaseApi('/song/url', { id: String(song.id), cookie });
      const url = res?.data?.[0]?.url;
      if (!url) return;

      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.addEventListener('ended', () => setIsPlaying(false));
      }
      audioRef.current.src = url;
      audioRef.current.play();
      setCurrentSong(song);
      setIsPlaying(true);
    } catch {}
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentSong) {
      if (songs.length > 0) playSong(songs[0]);
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // ====== 自动播放 ======
  useEffect(() => {
    if (autoPlay && songs.length > 0 && !isPlaying) {
      playSong(songs[0]);
    }
  }, [autoPlay]);

  // ====== UI ======
  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm">
      {/* 未登录 → 二维码登录 */}
      {!loggedIn && (
        <div className="flex flex-col items-center gap-2">
          {qrUrl ? (
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg"
              style={{ background: "var(--theme-card)", border: "1px solid var(--theme-border)" }}>
              <img src={qrUrl} alt="扫码登录" className="w-36 h-36 rounded" />
              <p className="text-[10px]" style={{ color: "var(--theme-text-secondary)" }}>
                请用网易云音乐 APP 扫码登录
              </p>
            </div>
          ) : (
            <button
              onClick={startLogin}
              disabled={loading}
              className="px-5 py-2 rounded-full text-xs transition-all hover:opacity-80"
              style={{ background: "var(--theme-accent)", color: "#fff", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "加载中..." : "🔐 登录网易云音乐"}
            </button>
          )}
        </div>
      )}

      {/* 已登录 → 搜索 + 歌单 + 播放控制 */}
      {loggedIn && (
        <>
          {/* 搜索框 */}
          <form onSubmit={handleSearch} className="w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索歌曲..."
              className="w-full px-3 py-1.5 rounded-full text-xs outline-none"
              style={{
                background: "var(--theme-card)",
                border: "1px solid var(--theme-border)",
                color: "var(--theme-text)",
              }}
            />
          </form>

          {/* 歌单 */}
          <div className="w-full max-h-48 overflow-y-auto space-y-0.5">
            {loading ? (
              <p className="text-center text-xs py-4" style={{ color: "var(--theme-text-secondary)" }}>加载中...</p>
            ) : songs.length === 0 ? (
              <p className="text-center text-xs py-4" style={{ color: "var(--theme-text-secondary)" }}>暂无歌曲</p>
            ) : (
              songs.slice(0, 20).map((song) => (
                <button
                  key={song.id}
                  onClick={() => playSong(song)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-xs transition-all hover:opacity-70"
                  style={{
                    background: currentSong?.id === song.id ? "var(--theme-accent-light)" : "transparent",
                    color: currentSong?.id === song.id ? "var(--theme-accent)" : "var(--theme-text)",
                  }}
                >
                  <span className="truncate flex-1">{song.name}</span>
                  <span className="text-[10px] truncate opacity-60" style={{ color: "var(--theme-text-secondary)" }}>
                    {song.ar?.[0]?.name || ''}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* 播放控制 */}
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={togglePlay}
              className="text-lg transition-all hover:scale-110"
              style={{ color: "var(--theme-accent)" }}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
            {currentSong && (
              <span className="text-xs truncate max-w-[200px]" style={{ color: "var(--theme-text)" }}>
                ♪ {currentSong.name} - {currentSong.ar?.[0]?.name || '未知'}
              </span>
            )}
            {!currentSong && songs.length > 0 && (
              <span className="text-xs" style={{ color: "var(--theme-text-secondary)" }}>
                选择歌曲开始播放
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ============ 导出 ============
export default function NeteasePlayer({ autoPlay = false }: NeteasePlayerProps) {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    setIsElectron(typeof window !== 'undefined' && !!window.electronAPI?.isElectron);
  }, []);

  if (!isElectron) return <BrowserPlayer />;
  return <ElectronPlayer autoPlay={autoPlay} />;
}
