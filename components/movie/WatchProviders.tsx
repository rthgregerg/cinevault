"use client";
import { useState, useEffect } from "react";

interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export default function WatchProviders({ movieId }: { movieId: string }) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [link, setLink] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProviders() {
      try {
        const res = await fetch(`/api/movie/${movieId}/providers`);
        if (!res.ok) return;
        const data = await res.json();
        // 优先使用 CN 地区，其次 US
        const cn = data.results?.CN;
        const us = data.results?.US;
        const target = cn || us;
        if (target) {
          setLink(target.link || "");
          const all = [
            ...(target.flatrate || []),
            ...(target.rent || []),
            ...(target.buy || []),
          ];
          // 去重
          const seen = new Set<number>();
          const uniq: Provider[] = [];
          for (const p of all) {
            if (!seen.has(p.provider_id)) {
              seen.add(p.provider_id);
              uniq.push(p);
            }
          }
          setProviders(uniq.slice(0, 6));
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    if (movieId) fetchProviders();
  }, [movieId]);

  if (loading) {
    return (
      <div className="mt-4 space-y-2">
        <p className="text-xs text-text-muted">加载播放平台...</p>
      </div>
    );
  }

  if (providers.length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-text-primary font-display mb-2">
        在线观看
      </h3>
      <div className="flex flex-wrap gap-2">
        {providers.map((p) => (
          <a
            key={p.provider_id}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-card rounded-btn border border-white/5 text-text-secondary text-xs hover:border-gold/30 hover:text-gold transition-colors"
          >
            <img
              src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
              alt={p.provider_name}
              className="w-4 h-4 rounded-full object-cover"
            />
            {p.provider_name}
          </a>
        ))}
      </div>
    </div>
  );
}
