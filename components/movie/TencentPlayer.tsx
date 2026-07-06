"use client";

import { useState, useMemo } from "react";

interface TencentPlayerProps {
  playUrl?: string;    // 资源站的 vod_play_url（可选）
  movieTitle: string;
}

/**
 * 从 vod_play_url 中提取腾讯视频的 vid
 * 格式: "腾讯视频$https://v.qq.com/x/cover/xxx.html$$爱奇艺$..."
 */
function extractTencentVid(playUrl: string): string | null {
  if (!playUrl) return null;
  const platforms = playUrl.split("$$");
  for (const platform of platforms) {
    if (!platform.includes("腾讯视频") && !platform.includes("v.qq.com")) continue;
    const parts = platform.split("$");
    const url = parts.length > 1 ? parts[1] : parts[0];
    const coverMatch = url.match(/\/cover\/([a-z0-9]+)\.html/i);
    if (coverMatch) return coverMatch[1];
    const pageMatch = url.match(/\/page\/([a-z0-9]+)\.html/i);
    if (pageMatch) return pageMatch[1];
    const vidMatch = url.match(/[?&]vid=([a-z0-9]+)/i);
    if (vidMatch) return vidMatch[1];
  }
  return null;
}

export default function TencentPlayer({ playUrl, movieTitle }: TencentPlayerProps) {
  const [error, setError] = useState(false);

  const vid = useMemo(() => (playUrl ? extractTencentVid(playUrl) : null), [playUrl]);

  // 有 vid → 嵌入播放器
  if (vid && !error) {
    return (
      <div className="w-full bg-black/50 rounded-card overflow-hidden mb-4 border border-white/5">
        <div className="flex items-center gap-2 px-4 py-2 bg-bg-card/50 border-b border-white/5">
          <span className="text-xs text-gold">▶</span>
          <span className="text-xs text-text-secondary">腾讯视频</span>
          <span className="text-[10px] text-text-muted ml-auto">来源: v.qq.com</span>
        </div>
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

  // 播放失败 → 错误提示 + 搜索链接
  if (error) {
    return (
      <div className="w-full bg-bg-card rounded-card border border-white/5 p-4 mb-4">
        <div className="flex items-center gap-2 text-text-muted text-sm">
          <span>⚠</span>
          <span>播放加载失败</span>
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

  // 没有 vid → 显示观看入口
  return (
    <div className="w-full mb-4">
      <a
        href={`https://v.qq.com/x/search/?q=${encodeURIComponent(movieTitle)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 w-full py-3.5 bg-gradient-to-r from-[#ff6600]/20 to-[#ff3300]/10 hover:from-[#ff6600]/30 hover:to-[#ff3300]/20 border border-[#ff6600]/30 hover:border-[#ff6600]/50 rounded-card transition-all group"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff6600" className="group-hover:scale-110 transition-transform">
          <polygon points="5,3 19,12 5,21" />
        </svg>
        <span className="text-[#ff6600] text-sm font-medium group-hover:text-[#ff8833] transition-colors">
          在腾讯视频观看「{movieTitle}」
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6600" strokeWidth="2" className="group-hover:translate-x-0.5 transition-transform">
          <path d="M7 17L17 7M17 7H7m10 0v10" />
        </svg>
      </a>
    </div>
  );
}
