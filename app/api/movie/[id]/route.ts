import { NextRequest, NextResponse } from "next/server";
import { getResourceStationMovieDetail, adaptMovie } from "@/lib/resource-station";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const movieId = parseInt(params.id);
  if (isNaN(movieId)) {
    return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
  }

  // 1. 尝试资源站
  try {
    const rsMovie = await getResourceStationMovieDetail(movieId);
    if (rsMovie) {
      return NextResponse.json(adaptMovie(rsMovie));
    }
  } catch {
    // 继续 TMDB fallback
  }

  // 2. Fallback: TMDB
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "No data source available" }, { status: 500 });

  const url = new URL(`https://api.themoviedb.org/3/movie/${params.id}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "zh-CN");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
