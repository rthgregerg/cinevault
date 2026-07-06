import { NextRequest, NextResponse } from "next/server";
import { getResourceStationMovies, adaptListResponse } from "@/lib/resource-station";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. 尝试资源站 — 用同分类获取同类型电影作为"相关推荐"
  try {
    const rsData = await getResourceStationMovies({ t: "1", pg: 1, pagesize: 6 });
    if (rsData && rsData.list?.length > 0) {
      const adapted = adaptListResponse(rsData);
      adapted.results = adapted.results.filter((m) => m.id !== parseInt(params.id)).slice(0, 6);
      return NextResponse.json(adapted);
    }
  } catch {
    // 继续 TMDB fallback
  }

  // 2. Fallback: TMDB
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

  const url = new URL(`https://api.themoviedb.org/3/movie/${params.id}/similar`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "zh-CN");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
