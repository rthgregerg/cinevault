// ============ TMDb API 原始类型 ============

export interface TmdbMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  original_language: string;
  runtime?: number;
  credits?: TmdbCredits;
  production_countries?: { iso_3166_1: string; name: string }[];
  spoken_languages?: { iso_639_1: string; name: string }[];
}

export interface TmdbListResponse {
  page: number;
  results: TmdbMovie[];
  total_pages: number;
  total_results: number;
}

export interface TmdbCredits {
  cast: { id: number; name: string; character: string; profile_path: string | null }[];
  crew: { id: number; name: string; job: string; profile_path: string | null }[];
}

export interface TmdbGenre {
  id: number;
  name: string;
}

// ============ 应用内部类型 ============

export interface Director {
  name: string;
  nameEn: string;
  bio: string;
  avatarUrl: string;
}

export interface FilmMovement {
  id: string;
  name: string;
  nameEn: string;
  years: string;
  description: string;
  keyDirectors: Director[];
  representativeFilms: string[];
  styleTags: string[];
  influence: string;
  posterCollage: string[];
  bannerColor: string;
}

export interface UserMark {
  movieId: string;
  liked: boolean;
  wantToWatch: boolean;
  watched: boolean;
  collected: boolean;
  rating: number;
  watchedDate?: string;
}

export type SortOption = "popular" | "rating" | "date" | "title";
export type SortValue = "popularity.desc" | "vote_average.desc" | "primary_release_date.desc" | "original_title.asc";
