"use client";
import { useRef } from "react";
import MovieCard from "@/components/shared/MovieCard";
import SectionHeader from "@/components/shared/SectionHeader";
import type { TmdbMovie } from "@/lib/types";

export default function NowShowing({ movies }: { movies: TmdbMovie[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <section className="mb-section">
      <SectionHeader title="正在热映" subtitle="Now Showing" />
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar -mx-4 px-4">
        {movies.map((movie) => (
          <div key={movie.id} className="snap-start shrink-0 w-36">
            <MovieCard movie={movie} size="sm" />
          </div>
        ))}
      </div>
    </section>
  );
}
