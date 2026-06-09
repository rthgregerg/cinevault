import { notFound } from "next/navigation";
import PageWrapper from "@/components/layout/PageWrapper";
import DirectorCard from "@/components/history/DirectorCard";
import MovieGrid from "@/components/shared/MovieGrid";
import movementsData from "@/data/movements.json";
import type { FilmMovement, TmdbMovie } from "@/lib/types";

const movements: FilmMovement[] = movementsData as FilmMovement[];

interface Props { params: { movement: string } }

async function fetchMovie(id: string): Promise<TmdbMovie | null> {
  try {
    const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}&language=zh-CN`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    return await res.json();
  } catch { return null; }
}

export default async function MovementDetailPage({ params }: Props) {
  const movement = movements.find((m) => m.id === params.movement);
  if (!movement) notFound();

  let films: TmdbMovie[] = [];
  if (movement.representativeFilms.length > 0) {
    const results = await Promise.all(movement.representativeFilms.map(fetchMovie));
    films = results.filter(Boolean) as TmdbMovie[];
  }

  return (
    <PageWrapper>
      <div className="pt-4 lg:pt-8">
        {/* Banner 海报拼图 */}
        <div className="relative -mx-4 md:-mx-6 lg:-mx-8 h-48 md:h-56 lg:h-64 overflow-hidden" style={{ backgroundColor: movement.bannerColor }}>
          {/* 海报拼图背景 */}
          {films.length > 0 && (
            <div className="absolute inset-0 flex opacity-30">
              {films.slice(0, 4).map((f, i) => (
                <div key={f.id} className="flex-1 overflow-hidden">
                  {f.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w342${f.poster_path}`}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full" style={{ backgroundColor: movement.bannerColor }} />
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
            <h1 className="text-2xl md:text-3xl font-display font-semibold text-white">{movement.name}</h1>
            <p className="text-gold text-sm mt-1">{movement.nameEn}</p>
            <p className="text-text-muted text-xs mt-1">{movement.years}</p>
          </div>
        </div>
        <div className="py-6 space-y-6">
          <div>
            <h2 className="text-base font-semibold text-text-primary font-display mb-2">概述</h2>
            <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">{movement.description}</p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary font-display mb-2">美学风格</h2>
            <div className="flex flex-wrap gap-1.5">
              {movement.styleTags.map((tag) => (
                <span key={tag} className="px-3 py-1.5 text-xs bg-bg-card rounded-full text-text-secondary border border-white/5">{tag}</span>
              ))}
            </div>
          </div>
          {movement.keyDirectors.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-text-primary font-display mb-3">关键导演</h2>
              <div className="space-y-2">{movement.keyDirectors.map((d) => <DirectorCard key={d.name} director={d} />)}</div>
            </div>
          )}
          {films.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-text-primary font-display mb-3">代表作品</h2>
              <MovieGrid movies={films} />
            </div>
          )}
          <div>
            <h2 className="text-base font-semibold text-text-primary font-display mb-2">影响与传承</h2>
            <p className="text-text-secondary text-sm leading-relaxed">{movement.influence}</p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
