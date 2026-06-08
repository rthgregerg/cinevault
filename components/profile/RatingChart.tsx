"use client";
import { useEffect, useState } from "react";
import { getAllMarks } from "@/lib/storage";

export default function RatingChart() {
  const [distribution, setDistribution] = useState([0, 0, 0, 0, 0]);

  useEffect(() => {
    const marks = getAllMarks();
    const dist = [0, 0, 0, 0, 0];
    for (const mark of Object.values(marks)) {
      if (mark.rating >= 1 && mark.rating <= 5) {
        dist[mark.rating - 1]++;
      }
    }
    setDistribution(dist);
  }, []);

  const max = Math.max(...distribution, 1);

  return (
    <div className="bg-bg-card rounded-card p-4">
      <h3 className="text-sm font-semibold text-text-primary mb-3">评分分布</h3>
      <div className="space-y-1.5">
        {distribution.map((count, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-text-muted w-6 text-right">{5 - i}★</span>
            <div className="flex-1 h-2 bg-bg rounded-full overflow-hidden">
              <div className="h-full bg-gold/60 rounded-full" style={{ width: `${(count / max) * 100}%` }} />
            </div>
            <span className="text-xs text-text-muted w-6">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
