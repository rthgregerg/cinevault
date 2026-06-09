"use client";
import { useState, useEffect, useCallback } from "react";
import { getMark, toggleMark, setRating, recordWatch, unrecordWatch } from "@/lib/storage";
import AddToCollectionSheet from "@/components/collection/AddToCollectionSheet";
import type { UserMark } from "@/lib/types";

interface ActionButtonsProps {
  movieId: string;
  movieTitle?: string;
  runtime?: number;
  genres?: string[];
}

export default function ActionButtons({ movieId, movieTitle = "", runtime = 0, genres = [] }: ActionButtonsProps) {
  const [mark, setMarkState] = useState<UserMark | null>(null);
  const [showCollectionSheet, setShowCollectionSheet] = useState(false);

  useEffect(() => {
    setMarkState(getMark(movieId));
  }, [movieId]);

  const handleToggle = useCallback(
    (field: "liked" | "wantToWatch" | "watched" | "collected") => {
      const current = mark ?? getMark(movieId);

      // 收藏按钮弹出收藏夹选择
      if (field === "collected") {
        setShowCollectionSheet(true);
        return;
      }

      const updated = toggleMark(movieId, field);
      setMarkState(updated);

      if (field === "watched") {
        if (!current.watched) {
          const date = new Date().toISOString().split("T")[0];
          recordWatch(movieId, runtime, genres, date);
        } else {
          unrecordWatch(movieId, runtime, genres);
        }
      }
    },
    [movieId, mark, runtime, genres]
  );

  const handleRating = useCallback(
    (r: number) => {
      const updated = setRating(movieId, r);
      setMarkState(updated);
    },
    [movieId]
  );

  if (!mark) {
    return <div className="h-20 bg-bg-card rounded-card animate-pulse" />;
  }

  const buttons = [
    { field: "liked" as const, label: "喜欢", activeLabel: "已喜欢", icon: "♥" },
    { field: "wantToWatch" as const, label: "想看", activeLabel: "想看", icon: "📌" },
    { field: "watched" as const, label: "看过", activeLabel: "已看", icon: "✓" },
    { field: "collected" as const, label: "收藏", activeLabel: "收藏夹", icon: "☆" },
  ];

  return (
    <>
      <div className="space-y-3">
        <div className="flex gap-2">
          {buttons.map(({ field, label, activeLabel, icon }) => (
            <button
              key={field}
              onClick={() => handleToggle(field)}
              className={`flex-1 py-2.5 text-xs font-medium rounded-btn border transition-all
                ${mark[field]
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-white/10 text-text-secondary hover:border-white/20"
                }`}
            >
              <span className="mr-1">{icon}</span>
              {mark[field] ? activeLabel : label}
            </button>
          ))}
        </div>

        {mark.watched && (
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs text-text-muted shrink-0">我的评分</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => handleRating(n)}
                  className={`text-lg transition-colors ${
                    n <= mark.rating ? "text-gold" : "text-text-muted/30"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        )}

        {runtime > 0 && (
          <div className="flex items-center gap-4 text-xs text-text-muted px-1">
            <span>片长 {runtime} 分钟</span>
            {mark.watched && mark.watchedDate && (
              <span>于 {mark.watchedDate} 标记看过</span>
            )}
          </div>
        )}
      </div>

      {showCollectionSheet && (
        <AddToCollectionSheet
          movieId={movieId}
          movieTitle={movieTitle}
          onClose={() => {
            setShowCollectionSheet(false);
            setMarkState(getMark(movieId));
          }}
        />
      )}
    </>
  );
}
