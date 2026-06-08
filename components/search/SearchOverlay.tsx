"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { TmdbMovie } from "@/lib/types";
import { posterUrl, getYear } from "@/lib/utils";

interface SearchOverlayProps {
  onClose: () => void;
}

export default function SearchOverlay({ onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TmdbMovie[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/movies?type=search&query=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch { setResults([]); } finally { setSearching(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input ref={inputRef} type="text" value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索电影..."
          className="flex-1 bg-transparent text-text-primary text-base placeholder:text-text-muted outline-none"
        />
        <button onClick={onClose} className="text-text-muted text-sm hover:text-text-primary transition-colors">取消</button>
      </div>
      <div className="flex-1 overflow-y-auto px-4">
        {searching ? (
          <div className="text-center py-20 text-text-muted text-sm">搜索中...</div>
        ) : results.length === 0 && query ? (
          <div className="text-center py-20 text-text-muted text-sm">未找到相关电影</div>
        ) : (
          <div className="py-4 space-y-2">
            {results.map((movie) => (
              <Link key={movie.id} href={`/movie/${movie.id}`} onClick={onClose}
                className="flex items-center gap-3 p-2.5 bg-bg-card rounded-card hover:bg-bg-elevated transition-colors"
              >
                <div className="w-10 h-14 rounded overflow-hidden shrink-0 bg-bg-elevated">
                  <img src={posterUrl(movie.poster_path)} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{movie.title}</p>
                  <p className="text-xs text-text-muted">{getYear(movie.release_date)} / {movie.original_title}</p>
                </div>
                <span className="text-gold text-sm font-semibold">{movie.vote_average.toFixed(1)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
