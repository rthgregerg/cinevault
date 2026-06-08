import { ratingToStars, formatRatingCount, ratingBarPercentages } from "@/lib/utils";

interface RatingDisplayProps {
  rating: number;
  ratingCount: number;
}

export default function RatingDisplay({ rating, ratingCount }: RatingDisplayProps) {
  const bars = ratingBarPercentages(rating, ratingCount);

  return (
    <div className="bg-bg-card rounded-card p-4">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <span className="text-3xl font-display font-bold text-gold">{rating.toFixed(1)}</span>
        </div>
        <div className="flex-1">
          <StarRow stars={ratingToStars(rating)} />
          <p className="text-text-muted text-xs mt-1">{formatRatingCount(ratingCount)} 人评分</p>
        </div>
      </div>
      <div className="mt-4 space-y-1">
        {bars.map((bar) => (
          <div key={bar.label} className="flex items-center gap-2">
            <span className="text-text-muted text-xs w-5">{bar.label}</span>
            <div className="flex-1 h-1.5 bg-bg rounded-full overflow-hidden">
              <div className="h-full bg-gold/60 rounded-full" style={{ width: `${bar.pct}%` }} />
            </div>
            <span className="text-text-muted text-xs w-8 text-right">{bar.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StarRow({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = stars >= n ? "100%" : stars >= n - 0.5 ? "50%" : "0%";
        return (
          <svg key={n} width="16" height="16" viewBox="0 0 24 24">
            <defs>
              <linearGradient id={`s-${n}-${stars}`}>
                <stop offset={fill} stopColor="#c8a951" />
                <stop offset={fill} stopColor="#333" />
              </linearGradient>
            </defs>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={`url(#s-${n}-${stars})`} />
          </svg>
        );
      })}
    </div>
  );
}
