"use client";
import { useState, useEffect, useRef, useCallback } from "react";

declare global {
  interface Window {
    electronAPI?: {
      neteaseApi: (endpoint: string, params?: Record<string, string>) => Promise<any>;
      enterFullscreen: () => Promise<boolean>;
      exitFullscreen: () => Promise<boolean>;
      isFullscreen: () => Promise<boolean>;
      onFullscreenChange: (cb: (f: boolean) => void) => void;
      isElectron: boolean;
    };
  }
}

interface SongItem { id: number; name: string; ar: { name: string }[]; al: { name: string; picUrl: string }; dt: number; }
interface PlaylistItem { id: number; name: string; trackCount: number; coverImgUrl: string; }

const COOKIE_KEY = "cinevault_netease_cookie";

function BrowserPlayer() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs"
      style={{ background: "var(--theme-card)", border: "1px solid var(--theme-border)", color: "var(--theme-text-secondary)" }}>
      <span>🎵</span>
      <a href="https://music.163.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">打开网易云音乐</a>
    </div>
  );
}

function ElectronPlayer({ autoPlay, compact = false }: { autoPlay: boolean; compact?: boolean }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingLogin, setCheckingLogin] = useState(true);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrKey, setQrKey] = useState<string | null>(null);
  const [songs, setSongs] = useState<SongItem[]>([]);
  const [currentSong, setCurrentSong] = useState<SongItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cookie, setCookie] = useState("");
  const [loading, setLoading] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<string>("");
  const [nickname, setNickname] = useState("");
  const [viewMode, setViewMode] = useState<"playlists" | "songs" | "search">("playlists");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const api = window.electronAPI!;

  // ====== 初始化 — 检查本地 cookie ======
  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_KEY);
    if (saved) {
      setCookie(saved);
      verifyAndRestore(saved);
    } else {
      setCheckingLogin(false);
    }
  }, []);

  const verifyAndRestore = async (ck: string) => {
    try {
      const acc = await api.neteaseApi('/user/account', { cookie: ck });
      if (acc?.profile?.nickname) {
        setNickname(acc.profile.nickname);
        setLoggedIn(true);
        setCheckingLogin(false);
        fetchPlaylists(ck);
        return;
      }
    } catch {}
    // cookie 过期
    localStorage.removeItem(COOKIE_KEY);
    setCookie("");
    setCheckingLogin(false);
  };

  // ====== 保存 cookie ======
  const saveCookie = (ck: string) => {
    localStorage.setItem(COOKIE_KEY, ck);
    setCookie(ck);
  };

  // ====== 扫码登录 ======
  const startLogin = async () => {
    setLoading(true);
    try {
      const keyData = await api.neteaseApi('/login/qr/key');
      const key = keyData?.data?.unikey;
      if (!key) { setLoading(false); return; }
      setQrKey(key);
      const qrData = await api.neteaseApi('/login/qr/create', { key, qrimg: 'true' });
      if (qrData?.data?.qrimg) { setQrUrl(qrData.data.qrimg); setLoading(false); pollLogin(key); }
      else { setLoading(false); }
    } catch { setLoading(false); }
  };

  const pollLogin = (key: string) => {
    const check = async () => {
      try {
        const res = await api.neteaseApi('/login/qr/check', { key, timestamp: String(Date.now()) });
        if (res.code === 800) setTimeout(check, 3000);
        else if (res.code === 803) {
          const ck = res.cookie || '';
          saveCookie(ck);
          setQrUrl(null); setQrKey(null);
          const acc = await api.neteaseApi('/user/account', { cookie: ck });
          if (acc?.profile?.nickname) setNickname(acc.profile.nickname);
          setLoggedIn(true);
          fetchPlaylists(ck);
        } else if (res.code === 801) setTimeout(check, 2000);
        else setTimeout(check, 3000);
      } catch { setTimeout(check, 3000); }
    };
    check();
  };

  // ====== 获取歌单 ======
  const fetchPlaylists = async (ck = cookie) => {
    try {
      const acc = await api.neteaseApi('/user/account', { cookie: ck });
      const uid = acc?.profile?.userId;
      if (!uid) return;
      const res = await api.neteaseApi('/user/playlist', { uid: String(uid), cookie: ck });
      const list = res?.playlist || [];
      setPlaylists(list.map((p: any) => ({
        id: p.id, name: p.name, trackCount: p.trackCount,
        coverImgUrl: p.coverImgUrl || '',
      })));
    } catch {}
  };

  // ====== 加载歌单中的歌曲 ======
  const loadPlaylistSongs = async (pl: PlaylistItem) => {
    setLoading(true);
    setActivePlaylist(pl.id.toString());
    setViewMode("songs");
    try {
      const res = await api.neteaseApi('/playlist/track/all', { id: String(pl.id), cookie, limit: '50' });
      const tracks = res?.songs || [];
      setSongs(tracks.map((s: any) => ({
        id: s.id, name: s.name,
        ar: s.ar || [], al: s.al || { name: '', picUrl: '' }, dt: s.dt || 0,
      })));
    } catch {} finally { setLoading(false); }
  };

  // ====== 搜索 ======
  const searchSongs = async (q: string) => {
    setLoading(true);
    setViewMode("search");
    try {
      const res = await api.neteaseApi('/search', { keywords: q, limit: '30', type: '1' });
      setSongs((res?.result?.songs || []).map((s: any) => ({
        id: s.id, name: s.name, ar: s.ar || [], al: s.al || { name: '', picUrl: '' }, dt: s.dt || 0,
      })));
    } catch {} finally { setLoading(false); }
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
      setCurrentSong(song); setIsPlaying(true);
    } catch {}
  };

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentSong) { if (songs.length > 0) playSong(songs[0]); return; }
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
    else { audioRef.current.play(); setIsPlaying(true); }
  }, [isPlaying, currentSong, songs]);

  useEffect(() => { if (autoPlay && songs.length > 0 && !isPlaying) playSong(songs[0]); }, [autoPlay]);

  // ====== 登出 ======
  const logout = () => {
    localStorage.removeItem(COOKIE_KEY);
    setLoggedIn(false); setCookie(""); setSongs([]); setPlaylists([]);
    setCurrentSong(null); setIsPlaying(false); setNickname(""); setViewMode("playlists");
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
  };

  // ====== 加载中 ======
  if (checkingLogin) {
    return <p className="text-xs" style={{ color: "var(--theme-text-secondary)" }}>验证登录状态...</p>;
  }

  // ====== UI ======
  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-sm">
      {/* 未登录 */}
      {!loggedIn && (
        <div className="flex flex-col items-center gap-2">
          {qrUrl ? (
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg"
              style={{ background: "var(--theme-card)", border: "1px solid var(--theme-border)" }}>
              <img src={qrUrl} alt="扫码登录" className="w-48 h-48 md:w-56 md:h-56 rounded-lg" />
              <p className="text-xs mt-2" style={{ color: "var(--theme-text-secondary)" }}>请用网易云音乐 APP 扫码登录</p>
            </div>
          ) : (
            <button onClick={startLogin} disabled={loading}
              className="px-5 py-2 rounded-full text-xs transition-all hover:opacity-80"
              style={{ background: "var(--theme-accent)", color: "#fff", opacity: loading ? 0.6 : 1 }}>
              {loading ? "加载中..." : "🔐 登录网易云音乐"}
            </button>
          )}
        </div>
      )}

      {/* 已登录 */}
      {loggedIn && (
        <>
          {compact ? (
            /* ====== 专注模式 — 极简播放条 ====== */
            <div className="flex items-center gap-4 px-6 py-3 rounded-full"
              style={{ background: "var(--theme-card)", border: "1px solid var(--theme-border)" }}>
              <button onClick={togglePlay}
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all hover:scale-110"
                style={{ background: "var(--theme-accent)", color: "#fff" }}>
                {isPlaying ? "⏸" : "▶"}
              </button>
              {currentSong ? (
                <div className="flex flex-col min-w-0">
                  <span className="text-sm truncate max-w-[200px]" style={{ color: "var(--theme-text)" }}>{currentSong.name}</span>
                  <span className="text-[10px] truncate" style={{ color: "var(--theme-text-secondary)" }}>{currentSong.ar?.[0]?.name || ''}</span>
                </div>
              ) : (
                <span className="text-xs" style={{ color: "var(--theme-text-secondary)" }}>未在播放</span>
              )}
            </div>
          ) : (
            /* ====== 完整模式 — 歌单/搜索/播放 ====== */
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="flex items-center justify-between w-full">
                <span className="text-xs" style={{ color: "var(--theme-text)" }}>👤 {nickname || '用户'}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setViewMode("playlists"); fetchPlaylists(); }}
                    className="text-[10px] px-2 py-1 rounded-full transition-all"
                    style={{ background: viewMode === "playlists" ? "var(--theme-accent-light)" : "var(--theme-card)", color: "var(--theme-text-secondary)" }}>我的歌单</button>
                  <button onClick={() => setViewMode("search")}
                    className="text-[10px] px-2 py-1 rounded-full transition-all"
                    style={{ background: viewMode === "search" ? "var(--theme-accent-light)" : "var(--theme-card)", color: "var(--theme-text-secondary)" }}>搜索</button>
                  <button onClick={logout}
                    className="text-[10px] px-2 py-1 rounded-full" style={{ color: "var(--theme-text-secondary)", background: "var(--theme-card)" }}>退出</button>
                </div>
              </div>
              {viewMode === "search" && (
                <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) searchSongs(searchQuery.trim()); }} className="w-full">
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索歌曲..." className="w-full px-3 py-1.5 rounded-full text-xs outline-none"
                    style={{ background: "var(--theme-card)", border: "1px solid var(--theme-border)", color: "var(--theme-text)" }} />
                </form>
              )}
              {viewMode === "playlists" && (
                <div className="w-full max-h-56 overflow-y-auto space-y-1">
                  {playlists.length === 0 ? (
                    <p className="text-center text-xs py-4" style={{ color: "var(--theme-text-secondary)" }}>暂无歌单</p>
                  ) : playlists.map((pl) => (
                    <button key={pl.id} onClick={() => loadPlaylistSongs(pl)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-all hover:opacity-70"
                      style={{ background: activePlaylist === pl.id.toString() ? "var(--theme-accent-light)" : "var(--theme-card)" }}>
                      <span>📋</span>
                      <span className="truncate flex-1" style={{ color: "var(--theme-text)" }}>{pl.name}</span>
                      <span className="text-[10px]" style={{ color: "var(--theme-text-secondary)" }}>{pl.trackCount}首</span>
                    </button>
                  ))}
                </div>
              )}
              {(viewMode === "songs" || viewMode === "search") && (
                <div className="w-full max-h-48 overflow-y-auto space-y-0.5">
                  {loading ? (
                    <p className="text-center text-xs py-4" style={{ color: "var(--theme-text-secondary)" }}>加载中...</p>
                  ) : songs.length === 0 ? (
                    <p className="text-center text-xs py-4" style={{ color: "var(--theme-text-secondary)" }}>暂无歌曲</p>
                  ) : songs.slice(0, 30).map((song) => (
                    <button key={song.id} onClick={() => playSong(song)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-xs transition-all hover:opacity-70"
                      style={{ background: currentSong?.id === song.id ? "var(--theme-accent-light)" : "transparent" }}>
                      <span className="truncate flex-1" style={{ color: currentSong?.id === song.id ? "var(--theme-accent)" : "var(--theme-text)" }}>{song.name}</span>
                      <span className="text-[10px] truncate opacity-60" style={{ color: "var(--theme-text-secondary)" }}>{song.ar?.[0]?.name || ''}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 mt-1">
                <button onClick={togglePlay} className="w-8 h-8 rounded-full flex items-center justify-center text-base transition-all hover:scale-110"
                  style={{ background: "var(--theme-accent)", color: "#fff" }}>{isPlaying ? "⏸" : "▶"}</button>
                {currentSong && (
                  <span className="text-xs truncate max-w-[200px]" style={{ color: "var(--theme-text)" }}>♪ {currentSong.name} - {currentSong.ar?.[0]?.name || '未知'}</span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function NeteasePlayer({ autoPlay = false, compact = false }: { autoPlay?: boolean; compact?: boolean }) {
  const [isElectron, setIsElectron] = useState(false);
  useEffect(() => { setIsElectron(typeof window !== 'undefined' && !!window.electronAPI?.isElectron); }, []);
  if (!isElectron) return <BrowserPlayer />;
  return <ElectronPlayer autoPlay={autoPlay} compact={compact} />;
}
