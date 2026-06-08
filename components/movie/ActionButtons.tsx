"use client";
import { useState, useEffect } from "react";
import { getMark, toggleMark, setRating } from "@/lib/storage";

interface ActionButtonsProps {
  movieId: string;
}

export default function ActionButtons({ movieId }: ActionButtonsProps) {
  const [mark, setMarkState] = useState(getMark(movieId));

  useEffect(() => { setMarkState(getMark(movieId)); }, [movieId]);

  const handleToggle = (field: "liked" | "wantToWatch" | "watched" | "collected") => {
    const updated = toggleMark(movieId, field);
    setMarkState(updated);
  };

  const handleRating = (r: number) => {
    const updated = setRating(movieId, r);
    setMarkState(updated);
  };

  const buttons = [
    { field: "liked" as const, label: "喜欢", activeLabel: "已喜欢", icon: "♥" },
    { field: "wantToWatch" as const, label: "想看", activeLabel: "想看", icon: "📌" },
    { field: "watched" as const, label: "看过", activeLabel: "已看", icon: "✓" },
    { field: "collected" as const, label: "收藏", activeLabel: "已收藏", icon: "☆" },
  ];

  return (
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
    </div>
  );
}
