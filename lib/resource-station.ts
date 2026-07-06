/** 苹果CMS 资源站 API 封装 — 服务端使用 */

import type { TmdbMovie, TmdbListResponse, ResourceStationMovie, ResourceStationListResponse } from "./types";

interface RsConfig {
  baseUrl: string;
  timeoutMs: number;
}

function getSources(): RsConfig[] {
  const primary = process.env.RESOURCE_STATION_URL;
  const backups = (process.env.RESOURCE_STATION_BACKUP_URLS || "").split(",").filter(Boolean);
  const urls = [primary, ...backups].filter((v): v is string => Boolean(v));
  return urls.map((url) => ({
    baseUrl: url.replace(/\/+$/, ""),
    timeoutMs: 4000,
  }));
}

async function tryFetch(path: string, source: RsConfig): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), source.timeoutMs);
  try {
    const res = await fetch(`${source.baseUrl}${path}`, {
      signal: controller.signal,
      headers: { "User-Agent": "CineVault/1.0" },
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`Resource station ${source.baseUrl} returned ${res.status}`);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw new Error(`Resource station ${source.baseUrl} unavailable`, { cause: e });
  }
}

/** 带多源切换的请求 */
async function fetchFromResourceStation(path: string): Promise<Response> {
  const sources = getSources();
  if (sources.length === 0) throw new Error("No resource station configured");

  let lastError: Error | null = null;
  for (const source of sources) {
    try {
      const res = await tryFetch(path, source);
      if (res.ok) return res;
      // 非 2xx 也视为失败，尝试下一个源
    } catch (e) {
      lastError = e as Error;
    }
  }
  throw lastError || new Error("All resource stations failed");
}

/** 获取电影列表 */
export async function getResourceStationMovies(params: {
  t?: string;       // 分类ID: 1=电影
  pg?: number;
  pagesize?: number;
  wd?: string;      // 搜索关键词
}): Promise<import("./types").ResourceStationListResponse | null> {
  const searchParams = new URLSearchParams();
  searchParams.set("ac", params.wd ? "videolist" : "list");
  if (params.t) searchParams.set("t", params.t);
  if (params.pg) searchParams.set("pg", String(params.pg));
  if (params.pagesize) searchParams.set("pagesize", String(params.pagesize));
  if (params.wd) searchParams.set("wd", params.wd);

  try {
    const res = await fetchFromResourceStation(
      `/api.php/provide/vod/?${searchParams.toString()}`
    );
    const data = await res.json();
    if (data.code !== 1) return null;
    return data;
  } catch {
    return null;
  }
}

/** 获取电影详情 */
export async function getResourceStationMovieDetail(
  vodId: number
): Promise<import("./types").ResourceStationMovie | null> {
  try {
    const res = await fetchFromResourceStation(
      `/api.php/provide/vod/?ac=detail&ids=${vodId}`
    );
    const data = await res.json();
    if (data.code !== 1 || !data.list?.length) return null;
    return data.list[0];
  } catch {
    return null;
  }
}

/**
 * 将单条资源站电影转换为 TmdbMovie 格式
 * 保证所有现有组件 (MovieCard, MovieHero 等) 无需修改
 */
export function adaptMovie(rs: ResourceStationMovie): TmdbMovie {
  return {
    id: rs.vod_id,
    title: rs.vod_name,
    original_title: rs.vod_name,           // 资源站无原名，用中文名
    overview: rs.vod_content || "",
    poster_path: rs.vod_pic || null,
    backdrop_path: null,                    // 资源站通常无背景图
    release_date: rs.vod_year ? `${rs.vod_year}-01-01` : "",
    vote_average: parseFloat(rs.vod_score || "0") || 0,
    vote_count: 0,
    popularity: 0,
    genre_ids: [],
    genres: rs.type_name
      ? [{ id: rs.type_id || 0, name: rs.type_name }]
      : [],
    original_language: rs.vod_lang || "zh",
    runtime: 0,
    // 扩展字段 — 存储原始播放链接，供 TencentPlayer 使用
    _play_url: rs.vod_play_url,
  } as TmdbMovie & { _play_url: string };
}

/**
 * 将资源站列表响应转换为 TmdbListResponse 格式
 */
export function adaptListResponse(rs: ResourceStationListResponse): TmdbListResponse {
  return {
    page: parseInt(rs.page) || 1,
    results: (rs.list || []).map(adaptMovie),
    total_pages: rs.pagecount || 1,
    total_results: rs.total || 0,
  };
}
