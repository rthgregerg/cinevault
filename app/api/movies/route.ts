import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api.themoviedb.org/3";

export async function GET(request: NextRequest) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") || "now_playing";
  const page = searchParams.get("page") || "1";
  const query = searchParams.get("query") || "";
  const sortBy = searchParams.get("sort_by") || "popularity.desc";

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
      params.set("sort_by", sortBy);
      const genre = searchParams.get("with_genres");
      const year = searchParams.get("primary_release_year");
      const region = searchParams.get("region");
      if (genre) params.set("with_genres", genre);
      if (year) params.set("primary_release_year", year);
      if (region) params.set("region", region);
      break;
    case "genres":
      path = "/genre/movie/list";
      params.delete("page");
      break;
    default: path = "/movie/popular";
  }

  try {
    const res = await fetch(`${BASE_URL}${path}?${params}`, { next: { revalidate: 3600 } });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "API request failed" }, { status: 500 });
  }
}
