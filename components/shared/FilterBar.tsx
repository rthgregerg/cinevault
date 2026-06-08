"use client";
import { useState } from "react";

interface FilterBarProps {
  genres: string[];
  regions: string[];
  activeGenres: string[];
  activeRegions: string[];
  activeSort: string;
  yearRange: [number, number];
  onGenreToggle: (g: string) => void;
  onRegionToggle: (r: string) => void;
  onSortChange: (s: string) => void;
  onYearChange: (range: [number, number]) => void;
  onClearAll: () => void;
}

export default function FilterBar({
  genres, regions, activeGenres, activeRegions,
  activeSort, yearRange, onGenreToggle, onRegionToggle,
  onSortChange, onYearChange, onClearAll,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);
  const hasFilters = activeGenres.length > 0 || activeRegions.length > 0
    || yearRange[0] !== 1900 || yearRange[1] !== 2030;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {( ["popular", "rating", "date", "title"] ).map((opt) => (
          <button key={opt} onClick={() => onSortChange(opt)}
            className={`shrink-0 px-3 py-1.5 text-xs rounded-full border transition-colors
              ${activeSort === opt ? "border-gold text-gold bg-gold/10" : "border-white/10 text-text-secondary hover:border-white/30"}`}
          >
            {opt === "popular" && "热门"}{opt === "rating" && "评分最高"}{opt === "date" && "最新"}{opt === "title" && "片名"}
          </button>
        ))}
        <button onClick={() => setExpanded(!expanded)}
          className="shrink-0 px-3 py-1.5 text-xs rounded-full border border-white/10 text-text-secondary"
        >筛选 {expanded ? "▲" : "▼"}</button>
        {hasFilters && (
          <button onClick={onClearAll} className="shrink-0 text-xs text-gold ml-auto">清除</button>
        )}
      </div>
      {expanded && (
        <div className="space-y-3 p-3 bg-bg-card rounded-card">
          <div>
            <p className="text-text-muted text-xs mb-2">类型</p>
            <div className="flex flex-wrap gap-1.5">
              {genres.map((g) => (
                <button key={g} onClick={() => onGenreToggle(g)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors
                    ${activeGenres.includes(g) ? "border-gold text-gold bg-gold/10" : "border-white/10 text-text-secondary"}`}
                >{g}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-text-muted text-xs mb-2">地区</p>
            <div className="flex flex-wrap gap-1.5">
              {regions.map((r) => (
                <button key={r} onClick={() => onRegionToggle(r)}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors
                    ${activeRegions.includes(r) ? "border-gold text-gold bg-gold/10" : "border-white/10 text-text-secondary"}`}
                >{r}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-text-muted text-xs mb-2">年代：{yearRange[0]} - {yearRange[1]}</p>
            <div className="flex gap-4">
              <input type="range" min={1900} max={2030} value={yearRange[0]}
                onChange={(e) => onYearChange([+e.target.value, yearRange[1]])}
                className="flex-1 accent-gold" />
              <input type="range" min={1900} max={2030} value={yearRange[1]}
                onChange={(e) => onYearChange([yearRange[0], +e.target.value])}
                className="flex-1 accent-gold" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
