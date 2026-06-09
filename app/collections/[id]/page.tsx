"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import PageWrapper from "@/components/layout/PageWrapper";
import MovieGrid from "@/components/shared/MovieGrid";
import { getCollections, updateCollection, deleteCollection, removeFromCollection } from "@/lib/storage";
import type { TmdbMovie, Collection } from "@/lib/types";

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  useEffect(() => {
    const cols = getCollections();
    const col = cols.find((c) => c.id === id);
    if (!col) { router.push("/collections"); return; }
    setCollection(col);
    setEditName(col.name);
    setEditDesc(col.description);

    if (col.movieIds.length > 0) {
      Promise.all(
        col.movieIds.map(async (mid) => {
          try {
            const res = await fetch(`/api/movie/${mid}`);
            return await res.json();
          } catch { return null; }
        })
      ).then((results) => {
        setMovies(results.filter(Boolean) as TmdbMovie[]);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id, router]);

  const handleSave = () => {
    if (!editName.trim() || !collection) return;
    updateCollection(collection.id, { name: editName.trim(), description: editDesc.trim() });
    setCollection({ ...collection, name: editName.trim(), description: editDesc.trim() });
    setEditing(false);
  };

  const handleDelete = () => {
    if (!collection) return;
    if (confirm(`确定删除收藏夹「${collection.name}」？`)) {
      deleteCollection(collection.id);
      router.push("/collections");
    }
  };

  const handleRemoveMovie = (movieId: string) => {
    if (!collection) return;
    removeFromCollection(collection.id, String(movieId));
    setMovies((prev) => prev.filter((m) => String(m.id) !== String(movieId)));
    setCollection((prev) => prev ? { ...prev, movieIds: prev.movieIds.filter((mid) => String(mid) !== String(movieId)) } : null);
  };

  if (!collection) return null;

  return (
    <PageWrapper>
      <div className="pt-6 lg:pt-10">
        {/* 头部 */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/collections")}
            className="text-text-muted text-xs hover:text-text-primary transition-colors mb-3"
          >
            ← 返回收藏夹列表
          </button>

          {editing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={30}
                className="w-full px-3 py-2 bg-bg-card border border-white/10 rounded-btn text-lg font-display font-semibold text-text-primary outline-none focus:border-gold/50"
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                maxLength={100}
                rows={2}
                className="w-full px-3 py-2 bg-bg-card border border-white/10 rounded-btn text-sm text-text-secondary outline-none focus:border-gold/50 resize-none"
              />
              <div className="flex gap-2">
                <button onClick={handleSave} className="px-4 py-2 text-xs bg-gold text-black font-medium rounded-btn">保存</button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 text-xs text-text-muted hover:text-text-primary">取消</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-display font-semibold text-text-primary">{collection.name}</h1>
              {collection.description && (
                <p className="text-text-muted text-sm mt-0.5">{collection.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-text-muted text-xs">{collection.movieIds.length} 部电影</span>
                <button onClick={() => setEditing(true)} className="text-gold text-xs hover:underline">编辑</button>
                <button onClick={handleDelete} className="text-red-400 text-xs hover:underline">删除</button>
              </div>
            </>
          )}
        </div>

        {/* 电影列表 */}
        {loading ? (
          <div className="text-center py-10 text-text-muted text-sm">加载中...</div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-3 opacity-30">🎬</div>
            <p className="text-text-muted text-sm">收藏夹是空的，去发现页添加电影吧</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {movies.map((movie) => (
              <div key={movie.id} className="relative group/card">
                <div onClick={() => router.push(`/movie/${movie.id}`)} className="cursor-pointer">
                  <div className="card block group">
                    <div className="h-44 relative overflow-hidden bg-bg-elevated">
                      {movie.poster_path && (
                        <img
                          src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                          alt={movie.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      )}
                      {movie.vote_average > 0 && (
                        <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-gold text-xs font-medium px-1.5 py-0.5 rounded">
                          {movie.vote_average.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <div className="p-2.5">
                      <h3 className="text-text-primary text-sm font-medium truncate">{movie.title}</h3>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveMovie(String(movie.id))}
                  className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/70 backdrop-blur-sm text-text-muted hover:text-red-400 text-xs flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity"
                  title="移除"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
