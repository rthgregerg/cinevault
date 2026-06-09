"use client";
import { useEffect, useState } from "react";
import { getUserStats } from "@/lib/storage";
import type { MonthlyStat } from "@/lib/types";

export default function MonthlyChart() {
  const [months, setMonths] = useState<[string, MonthlyStat][]>([]);
  const [maxCount, setMaxCount] = useState(1);
  const [maxRuntime, setMaxRuntime] = useState(1);

  useEffect(() => {
    const stats = getUserStats();
    // 最近12个月
    const entries = Object.entries(stats.monthlyStats)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12);

    if (entries.length === 0) {
      // 生成当前月占位
      const now = new Date().toISOString().slice(0, 7);
      entries.push([now, { count: 0, runtime: 0, genres: {}, avgRating: 0 }]);
    }

    setMonths(entries);
    setMaxCount(Math.max(...entries.map((e) => e[1].count), 1));
    setMaxRuntime(Math.max(...entries.map((e) => e[1].runtime), 1));
  }, []);

  if (months.length === 0) return null;

  return (
    <div className="bg-bg-card rounded-card p-4">
      <h3 className="text-sm font-semibold text-text-primary mb-4">月度观影统计</h3>

      {/* 柱状图 — 每月观影数量 */}
      <div className="mb-4">
        <p className="text-text-muted text-xs mb-2">观影数量（部）</p>
        <div className="flex items-end gap-1.5 h-28">
          {months.map(([month, stat]) => {
            const h = Math.max(4, (stat.count / maxCount) * 100);
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[10px] text-gold font-medium">{stat.count}</span>
                <div
                  className="w-full rounded-t-sm bg-gold/60 transition-all hover:bg-gold/80"
                  style={{ height: `${h}%`, minHeight: 2 }}
                  title={`${month}: ${stat.count}部`}
                />
                <span className="text-[9px] text-text-muted">{month.slice(5)}月</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 观影时长趋势 */}
      <div className="mb-4">
        <p className="text-text-muted text-xs mb-2">观影时长（分钟）</p>
        <div className="flex items-end gap-1.5 h-28">
          {months.map(([month, stat]) => {
            const h = Math.max(4, (stat.runtime / maxRuntime) * 100);
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[10px] text-gold font-medium">
                  {stat.runtime >= 60 ? `${Math.round(stat.runtime / 60)}h` : `${stat.runtime}m`}
                </span>
                <div
                  className="w-full rounded-t-sm bg-blue-500/50 transition-all hover:bg-blue-500/70"
                  style={{ height: `${h}%`, minHeight: 2 }}
                  title={`${month}: ${stat.runtime}分钟`}
                />
                <span className="text-[9px] text-text-muted">{month.slice(5)}月</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 类型分布 */}
      {months.length > 0 && months[months.length - 1][1].genres && (
        <div>
          <p className="text-text-muted text-xs mb-2">本月类型 Top 5</p>
          <div className="space-y-1">
            {Object.entries(months[months.length - 1][1].genres)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([genre, count]) => (
                <div key={genre} className="flex items-center gap-2">
                  <span className="text-text-muted text-xs w-14 shrink-0">{genre}</span>
                  <div className="flex-1 h-1.5 bg-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold/60 rounded-full"
                      style={{ width: `${(count / (months[months.length - 1][1].count || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-text-muted text-xs w-4 text-right">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
