"use client";
import { useState } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import MovementCard from "@/components/history/MovementCard";
import TimelineView from "@/components/history/TimelineView";
import movementsData from "@/data/movements.json";
import type { FilmMovement } from "@/lib/types";

const movements: FilmMovement[] = movementsData as FilmMovement[];
type ViewMode = "grid" | "timeline";

export default function HistoryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  return (
    <PageWrapper>
      <div className="pt-6 lg:pt-10">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-display font-semibold text-text-primary">影史</h1>
          <div className="flex bg-bg-card rounded-full p-0.5">
            {(["grid", "timeline"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 text-xs rounded-full transition-colors
                  ${viewMode === mode ? "bg-gold/20 text-gold" : "text-text-muted"}`}
              >
                {mode === "grid" ? "网格" : "时间线"}
              </button>
            ))}
          </div>
        </div>
        <p className="text-text-muted text-sm mb-6">探索电影史上的重要流派与运动</p>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {movements.map((m) => (
              <MovementCard key={m.id} movement={m} />
            ))}
          </div>
        ) : (
          <TimelineView movements={movements} />
        )}
      </div>
    </PageWrapper>
  );
}
