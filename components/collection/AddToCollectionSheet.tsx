"use client";
import { useState, useEffect } from "react";
import { getCollections, addToCollection, removeFromCollection, getMovieCollections } from "@/lib/storage";
import type { Collection } from "@/lib/types";

interface AddToCollectionSheetProps {
  movieId: string;
  movieTitle: string;
  onClose: () => void;
}

export default function AddToCollectionSheet({ movieId, movieTitle, onClose }: AddToCollectionSheetProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [inCollection, setInCollection] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCollections(getCollections());
    setInCollection(new Set(getMovieCollections(movieId)));
  }, [movieId]);

  const toggle = (collectionId: string) => {
    if (inCollection.has(collectionId)) {
      removeFromCollection(collectionId, movieId);
      setInCollection((prev) => {
        const next = new Set(prev);
        next.delete(collectionId);
        return next;
      });
    } else {
      addToCollection(collectionId, movieId);
      setInCollection((prev) => new Set(prev).add(collectionId));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-bg-card rounded-t-2xl border border-white/10 w-full max-w-md p-6 space-y-4 animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 拖拽指示条 */}
        <div className="w-8 h-1 bg-white/20 rounded-full mx-auto" />

        <div>
          <h3 className="text-base font-display font-semibold text-text-primary">添加到收藏夹</h3>
          <p className="text-text-muted text-xs mt-0.5 truncate">{movieTitle}</p>
        </div>

        {collections.length === 0 ? (
          <div className="text-center py-8 text-text-muted text-sm">
            还没有收藏夹，先去创建吧
          </div>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {collections.map((c) => (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm transition-colors
                  ${inCollection.has(c.id)
                    ? "bg-gold/10 text-gold border border-gold/20"
                    : "text-text-secondary hover:bg-bg hover:text-text-primary border border-transparent"
                  }`}
              >
                <span className={`text-lg ${inCollection.has(c.id) ? "" : "opacity-30"}`}>
                  {inCollection.has(c.id) ? "✓" : "○"}
                </span>
                <span className="flex-1 text-left truncate">{c.name}</span>
                <span className="text-text-muted text-xs">{c.movieIds.length}</span>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          完成
        </button>
      </div>
    </div>
  );
}
