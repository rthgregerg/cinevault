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
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar -mx-4 px-4 md:-mx-6 md:px-6 lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-3 lg:overflow-visible lg:px-0 lg:pb-0"
      >
        {movies.map((movie) => (
          <div key={movie.id} className="snap-start shrink-0 w-36 lg:w-auto">
            <MovieCard movie={movie} size="sm" />
          </div>
        ))}
      </div>
    </section>
  );
}
