import { NextRequest, NextResponse } from "next/server";
import { getRecommendParams, dailySeed } from "@/lib/recommendation-engine";
import type { Mood, Scene } from "@/lib/types";

const BASE_URL = "https://api.themoviedb.org/3";

export async function GET(request: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

  const { searchParams } = request.nextUrl;
  const mood = searchParams.get("mood") as Mood | null;
  const scene = searchParams.get("scene") as Scene | null;

  if (!mood || !scene) {
    return NextResponse.json({ error: "mood and scene required" }, { status: 400 });
  }

  const params = getRecommendParams(mood, scene);
  const seed = dailySeed(mood, scene);
  const page = (seed % 10) + 1; // 确定性随机页（1-10）

  const tmdbParams = new URLSearchParams({
    api_key: apiKey,
    language: "zh-CN",
    page: String(page),
    sort_by: params.sort_by,
    "vote_average.gte": params["vote_average.gte"],
    "vote_count.gte": "100",
    with_genres: params.with_genres,
    "primary_release_date.gte": params["primary_release_date.gte"],
    "primary_release_date.lte": params["primary_release_date.lte"],
  });

  try {
    const res = await fetch(`${BASE_URL}/discover/movie?${tmdbParams}`, {
      next: { revalidate: 86400 }, // 24小时缓存
    });
    const data = await res.json();
    // 用种子打乱结果，同一天同一组合顺序固定
    const results = data.results || [];
    const shuffled = seededShuffle(results, seed);
    return NextResponse.json({ results: shuffled.slice(0, 6), mood, scene });
  } catch {
    return NextResponse.json({ error: "API request failed" }, { status: 500 });
  }
}

/** 确定性种子洗牌 */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
