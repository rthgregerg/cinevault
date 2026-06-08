/** TMDb API 封装 — 服务端使用 */

const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p";

function apiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key || key === "your_tmdb_api_key_here") {
    throw new Error("请在 .env.local 中设置 TMDB_API_KEY");
  }
  return key;
}

async function fetchTmdb(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("api_key", apiKey());
  url.searchParams.set("language", "zh-CN");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDb API error: ${res.status}`);
  return res.json();
}

/** 图片 URL */
export function tmdbImage(path: string | null, size: "w92" | "w185" | "w342" | "w500" | "w780" | "w1280" | "original" = "w500"): string {
  if (!path) return "/icons/placeholder-poster.svg";
  return `${IMG_BASE}/${size}${path}`;
}

/** 海报 URL */
export function posterUrl(path: string | null, size: "w185" | "w342" | "w500" = "w342"): string {
  return tmdbImage(path, size);
}

/** 背景 URL */
export function backdropUrl(path: string | null): string {
  return tmdbImage(path, "w1280");
}

// ==================== 电影 API ====================

/** 正在热映 */
export async function getNowShowing(page = 1) {
  return fetchTmdb("/movie/now_playing", { page: String(page), region: "CN" });
}

/** 高分电影 */
export async function getTopRated(page = 1) {
  return fetchTmdb("/movie/top_rated", { page: String(page) });
}

/** 即将上映 */
export async function getUpcoming(page = 1) {
  return fetchTmdb("/movie/upcoming", { page: String(page) });
}

/** 电影详情 */
export async function getMovieDetail(movieId: number) {
  return fetchTmdb(`/movie/${movieId}`);
}

/** 演职员 */
export async function getMovieCredits(movieId: number) {
  return fetchTmdb(`/movie/${movieId}/credits`);
}

/** 相关推荐 */
export async function getSimilarMovies(movieId: number) {
  return fetchTmdb(`/movie/${movieId}/similar`);
}

/** 搜索电影 */
export async function searchMovies(query: string, page = 1) {
  return fetchTmdb("/search/movie", { query, page: String(page) });
}

/** 发现电影（支持筛选/排序） */
export async function discoverMovies(params: {
  with_genres?: string;
  primary_release_year?: string;
  "release_date.gte"?: string;
  "release_date.lte"?: string;
  region?: string;
  sort_by?: string;
  page?: number;
  with_original_language?: string;
}) {
  const p: Record<string, string> = {};
  if (params.with_genres) p.with_genres = params.with_genres;
  if (params.primary_release_year) p.primary_release_year = params.primary_release_year;
  if (params["release_date.gte"]) p["release_date.gte"] = params["release_date.gte"];
  if (params["release_date.lte"]) p["release_date.lte"] = params["release_date.lte"];
  if (params.region) p.region = params.region;
  if (params.sort_by) p.sort_by = params.sort_by;
  if (params.page) p.page = String(params.page);
  if (params.with_original_language) p.with_original_language = params.with_original_language;
  return fetchTmdb("/discover/movie", p);
}

/** 获取类型列表 */
export async function getGenres() {
  return fetchTmdb("/genre/movie/list");
}

/** 热门电影 */
export async function getPopular(page = 1) {
  return fetchTmdb("/movie/popular", { page: String(page) });
}
