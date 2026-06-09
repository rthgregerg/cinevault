"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { FilmMovement } from "@/lib/types";

interface PosterData {
  id: number;
  poster: string | null;
  title: string;
}

export default function MovementCard({ movement }: { movement: FilmMovement }) {
  const [posters, setPosters] = useState<PosterData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (movement.representativeFilms.length === 0) {
      setLoading(false);
      return;
    }

    // 取前 3 部代表电影，并行获取海报
    const ids = movement.representativeFilms.slice(0, 3);
    Promise.all(
      ids.map(async (id) => {
        try {
          const res = await fetch(`/api/movie/${id}`);
          if (!res.ok) return null;
          const data = await res.json();
          return {
            id: Number(id),
            poster: data.poster_path
              ? `https://image.tmdb.org/t/p/w342${data.poster_path}`
              : null,
            title: data.title || "",
          };
        } catch {
          return null;
        }
      })
    ).then((results) => {
      setPosters(results.filter(Boolean) as PosterData[]);
      setLoading(false);
    });
  }, [movement.representativeFilms]);

  return (
    <Link href={`/history/${movement.id}`} className="card block group">
      {/* 海报拼图区域 */}
      <div className="h-40 md:h-48 relative overflow-hidden bg-bg-elevated flex">
        {loading ? (
          <div className="w-full h-full" style={{ backgroundColor: movement.bannerColor }}>
            <div className="absolute inset-0 animate-pulse bg-white/5" />
          </div>
        ) : posters.length > 0 ? (
          <>
            <div className={`flex w-full h-full ${posters.length === 1 ? "" : ""}`}>
              {posters.map((p, i) => (
                <div
                  key={p.id}
                  className="relative overflow-hidden"
                  style={{ flex: posters.length === 1 ? 1 : posters.length === 2 ? "1 1 50%" : "1 1 33.33%" }}
                >
                  {p.poster ? (
                    <img
                      src={p.poster}
                      alt={p.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full" style={{ backgroundColor: movement.bannerColor }} />
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: movement.bannerColor }}>
            <span className="text-text-muted text-xs">暂无图片</span>
          </div>
        )}

        {/* 顶部渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
      </div>

      {/* 信息区 */}
      <div className="p-4">
        <h3 className="text-base font-display font-semibold text-text-primary group-hover:text-gold transition-colors">
          {movement.name}
        </h3>
        <p className="text-gold text-xs mt-0.5">{movement.nameEn}</p>
        <p className="text-text-muted text-xs mt-0.5">{movement.years}</p>
        <p className="text-text-secondary text-xs mt-2 line-clamp-2">
          {movement.description.slice(0, 80)}...
        </p>
      </div>
    </Link>
  );
}
