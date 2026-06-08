/** 评分转换：TMDb 10分制 → 星级数 */
export function ratingToStars(rating: number): number {
  return Math.round((rating / 2) * 2) / 2;
}

/** 格式化评分人数 */
export function formatRatingCount(count: number): string {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}万`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return `${count}`;
}

/** TMDb 图片 CDN */
const IMG_BASE = "https://image.tmdb.org/t/p";
export function posterUrl(path: string | null, size: "w185" | "w342" | "w500" = "w342"): string {
  if (!path) return "/icons/placeholder-poster.svg";
  return `${IMG_BASE}/${size}${path}`;
}
export function backdropUrl(path: string | null): string {
  if (!path) return "";
  return `${IMG_BASE}/w1280${path}`;
}

/** 年代提取 */
export function getYear(dateStr: string): number {
  if (!dateStr) return 0;
  return parseInt(dateStr.split("-")[0]) || 0;
}

/** 截断文本 */
export function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "..." : text;
}

/** 生成评分分布数据（模拟） */
export function ratingBarPercentages(voteAverage: number, voteCount: number): { label: string; pct: number }[] {
  const labels = ["5星", "4星", "3星", "2星", "1星"];
  const base = voteAverage / 2;
  return labels.map((label, i) => {
    const starVal = 5 - i;
    const diff = Math.abs(starVal - base);
    const pct = Math.max(2, Math.round(35 - diff * 12 + Math.random() * 5));
    return { label, pct };
  });
}
