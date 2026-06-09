"use client";
import { useState, useEffect } from "react";

interface Composer {
  name: string;
  job: string;
}

export default function SoundtrackSection({ movieId }: { movieId: string }) {
  const [composers, setComposers] = useState<Composer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCredits() {
      try {
        const res = await fetch(`/api/movie/${movieId}/credits`);
        const data = await res.json();
        const musicCrew = (data.crew || []).filter(
          (c: any) =>
            c.job === "Original Music Composer" ||
            c.job === "Music" ||
            c.job === "Original Music Composer" ||
            c.known_for_department === "Sound"
        );
        setComposers(
          musicCrew.slice(0, 3).map((c: any) => ({
            name: c.name,
            job: c.job === "Original Music Composer" ? "原创配乐" : c.job,
          }))
        );
      } catch {} finally {
        setLoading(false);
      }
    }
    if (movieId) fetchCredits();
  }, [movieId]);

  if (loading) return null;
  if (composers.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-text-primary font-display mb-2">
        电影原声
      </h3>
      <div className="space-y-1.5">
        {composers.map((c, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="text-gold">♪</span>
            <span className="text-text-primary">{c.name}</span>
            <span className="text-text-muted text-xs">· {c.job}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
