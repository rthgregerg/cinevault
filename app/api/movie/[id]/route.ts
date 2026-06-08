import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

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
