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

// ============ 每日推荐 - 心情/场景 ============

export type Mood =
  | "放松" | "感动" | "刺激" | "烧脑"
  | "浪漫" | "怀旧" | "励志" | "暗黑";

export type Scene =
  | "独自观影" | "约会之夜" | "家庭时光" | "深夜电影"
  | "周末放松" | "通勤路上" | "朋友聚会";

export interface MoodSceneMapping {
  mood: Mood;
  scene: Scene;
  genreIds: number[];
  sortBy: string;
  voteMin: number;
  yearRange: [number, number];
  label: string;
}

// ============ 收藏夹 ============

export interface Collection {
  id: string;
  name: string;
  description: string;
  coverMovieId: string | null;
  movieIds: string[];
  createdAt: string;
  order: number;
}

// ============ 观影统计 ============

export interface UserStats {
  totalRuntime: number;
  totalWatched: number;
  genreDistribution: Record<string, number>;
  monthlyStats: Record<string, MonthlyStat>;
}

export interface MonthlyStat {
  count: number;
  runtime: number;
  genres: Record<string, number>;
  avgRating: number;
}

// ============ 3D 粒子地球仪 ============

export interface CountryFilmData {
  countryCode: string;
  countryName: string;
  countryNameZh: string;
  lat: number;
  lng: number;
  lightIntensity: number;
  filmHistory: string;
  notableDirectors: Array<{
    name: string;
    nameEn: string;
    bio: string;
    representativeWorks: number[];
  }>;
  recommendedFilms: number[];
  styleTags: string[];
}

export interface GlobeCameraState {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
}

// ============ 流媒体供应商 ============

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface CountryWatchProviders {
  link: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}
