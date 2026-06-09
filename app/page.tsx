import PageWrapper from "@/components/layout/PageWrapper";
import DailyRecommend from "@/components/home/DailyRecommend";
import NowShowing from "@/components/home/NowShowing";
import TopRated from "@/components/home/TopRated";
import ComingSoon from "@/components/home/ComingSoon";
import DailyPick from "@/components/home/DailyPick";
import { getNowShowing, getTopRated, getUpcoming } from "@/lib/tmdb";
import type { TmdbMovie } from "@/lib/types";

export default async function HomePage() {
  let nowShowing: TmdbMovie[] = [];
  let topRated: TmdbMovie[] = [];
  let comingSoon: TmdbMovie[] = [];
  let dailyPick: TmdbMovie | undefined;

  try {
    const [ns, tr, up] = await Promise.all([
      getNowShowing().catch(() => null),
      getTopRated().catch(() => null),
      getUpcoming().catch(() => null),
    ]);
    nowShowing = ns?.results?.slice(0, 10) ?? [];
    topRated = tr?.results?.slice(0, 10) ?? [];
    comingSoon = up?.results?.slice(0, 6) ?? [];
    dailyPick = tr?.results?.[Math.floor(Math.random() * Math.min(10, tr?.results?.length || 0))];
  } catch {
    // 无 API Key 时静默降级
  }

  return (
    <PageWrapper>
      <div className="pt-6 lg:pt-10">
        {/* 每日推荐专区 — 双维度筛选 */}
        <DailyRecommend />
        {dailyPick && <DailyPick movie={dailyPick} />}
        {nowShowing.length > 0 && <NowShowing movies={nowShowing} />}
        {topRated.length > 0 && <TopRated movies={topRated} />}
        {comingSoon.length > 0 && <ComingSoon movies={comingSoon} />}
      </div>
    </PageWrapper>
  );
}
