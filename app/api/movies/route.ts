import { NextRequest, NextResponse } from "next/server";
import { getResourceStationMovies, adaptListResponse } from "@/lib/resource-station";

const TMDB_BASE = "https://api.themoviedb.org/3";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") || "now_playing";
  const page = searchParams.get("page") || "1";
  const query = searchParams.get("query") || "";

  // 1. 尝试从资源站获取
  try {
    if (type === "search" && query) {
      const rsData = await getResourceStationMovies({ wd: query, pg: parseInt(page) });
      if (rsData && rsData.list?.length > 0) {
        return NextResponse.json(adaptListResponse(rsData));
      }
    } else if (type === "now_playing" || type === "popular" || type === "top_rated") {
      const rsData = await getResourceStationMovies({ t: "1", pg: parseInt(page), pagesize: 20 });
      if (rsData && rsData.list?.length > 0) {
        return NextResponse.json(adaptListResponse(rsData));
      }
    }
  } catch {
    // 资源站失败，继续尝试 TMDB
  }

  // 2. Fallback: TMDB
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "No data source available" }, { status: 500 });

  let path = "";
  const params = new URLSearchParams({ api_key: apiKey, language: "zh-CN", page });

  switch (type) {
    case "now_playing": path = "/movie/now_playing"; params.set("region", "CN"); break;
    case "top_rated": path = "/movie/top_rated"; break;
    case "upcoming": path = "/movie/upcoming"; break;
    case "popular": path = "/movie/popular"; break;
    case "search":
      path = "/search/movie";
      params.set("query", query);
      if (!query) return NextResponse.json({ results: [] });
      break;
    case "discover":
      path = "/discover/movie";
      params.set("sort_by", searchParams.get("sort_by") || "popularity.desc");
      const genre = searchParams.get("with_genres");
      const year = searchParams.get("primary_release_year");
      if (genre) params.set("with_genres", genre);
      if (year) params.set("primary_release_year", year);
      break;
    case "genres":
      path = "/genre/movie/list";
      params.delete("page");
      break;
    default: path = "/movie/popular";
  }

  try {
    const res = await fetch(`${TMDB_BASE}${path}?${params}`, { next: { revalidate: 3600 } });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "API request failed" }, { status: 500 });
  }
}
