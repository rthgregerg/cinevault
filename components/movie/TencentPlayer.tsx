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
