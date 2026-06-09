"use client";

const CHINESE_PLATFORMS = [
  {
    name: "爱奇艺",
    searchUrl: (q: string) => `https://so.iqiyi.com/so/q_${encodeURIComponent(q)}`,
    icon: "🎬",
    color: "#00be06",
  },
  {
    name: "腾讯视频",
    searchUrl: (q: string) => `https://v.qq.com/x/search/?q=${encodeURIComponent(q)}`,
    icon: "▶",
    color: "#ff6600",
  },
  {
    name: "优酷",
    searchUrl: (q: string) => `https://so.youku.com/search_video/q_${encodeURIComponent(q)}`,
    icon: "📺",
    color: "#00a0e9",
  },
  {
    name: "哔哩哔哩",
    searchUrl: (q: string) => `https://search.bilibili.com/all?keyword=${encodeURIComponent(q)}`,
    icon: "📼",
    color: "#fb7299",
  },
  {
    name: "芒果TV",
    searchUrl: (q: string) => `https://www.mgtv.com/s?q=${encodeURIComponent(q)}`,
    icon: "🍊",
    color: "#ff7800",
  },
  {
    name: "西瓜视频",
    searchUrl: (q: string) => `https://www.ixigua.com/search?keyword=${encodeURIComponent(q)}`,
    icon: "🍉",
    color: "#e60012",
  },
];

interface WatchProvidersProps {
  movieId: string;
  movieTitle: string;
}

export default function WatchProviders({ movieId, movieTitle }: WatchProvidersProps) {
  const searchQuery = movieTitle || "";

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-text-primary font-display mb-2">
        搜索观看
      </h3>
      <p className="text-text-muted text-[10px] mb-2">点击跳转至国内平台搜索</p>
      <div className="flex flex-wrap gap-2">
        {CHINESE_PLATFORMS.map((p) => (
          <a
            key={p.name}
            href={p.searchUrl(searchQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-card rounded-btn border border-white/5 text-text-secondary text-xs hover:border-gold/30 hover:text-gold transition-colors"
          >
            <span className="text-sm">{p.icon}</span>
            {p.name}
          </a>
        ))}
      </div>
    </div>
  );
}
