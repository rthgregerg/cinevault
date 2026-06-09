import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API key not configured" }, { status: 500 });

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${params.id}/watch/providers?api_key=${apiKey}`,
      { next: { revalidate: 86400 } }
    );
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
