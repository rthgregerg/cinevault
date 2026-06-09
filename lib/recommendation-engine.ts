import type { Mood, Scene, MoodSceneMapping } from "@/lib/types";

/** 心情 → TMDb genre IDs 基础映射 */
const MOOD_GENRE_MAP: Record<Mood, number[]> = {
  "放松": [35, 10751, 16, 10402],        // 喜剧, 家庭, 动画, 音乐
  "感动": [18, 10751, 10749, 36],         // 剧情, 家庭, 爱情, 历史
  "刺激": [28, 12, 53, 878],              // 动作, 冒险, 惊悚, 科幻
  "烧脑": [9648, 53, 878, 80],            // 悬疑, 惊悚, 科幻, 犯罪
  "浪漫": [10749, 35, 18, 10402],          // 爱情, 喜剧, 剧情, 音乐
  "怀旧": [18, 36, 10752, 37],             // 剧情, 历史, 战争, 西部
  "励志": [18, 99, 36, 12],                // 剧情, 纪录, 历史, 冒险
  "暗黑": [27, 53, 80, 9648],              // 恐怖, 惊悚, 犯罪, 悬疑
};

/** 场景 → 额外偏好 */
const SCENE_BONUS: Record<Scene, { sortBy: string; voteMin: number; yearBoost: [number, number] }> = {
  "独自观影": { sortBy: "vote_average.desc", voteMin: 7, yearBoost: [1970, 2030] },
  "约会之夜": { sortBy: "popularity.desc", voteMin: 6, yearBoost: [2000, 2030] },
  "家庭时光": { sortBy: "popularity.desc", voteMin: 6, yearBoost: [1980, 2030] },
  "深夜电影": { sortBy: "vote_average.desc", voteMin: 7, yearBoost: [1950, 2030] },
  "周末放松": { sortBy: "popularity.desc", voteMin: 6, yearBoost: [1990, 2030] },
  "通勤路上": { sortBy: "vote_average.desc", voteMin: 7, yearBoost: [2000, 2030] },
  "朋友聚会": { sortBy: "popularity.desc", voteMin: 5, yearBoost: [1990, 2030] },
};

/** 所有心情列表 */
export const ALL_MOODS: Mood[] = ["放松", "感动", "刺激", "烧脑", "浪漫", "怀旧", "励志", "暗黑"];

/** 所有场景列表 */
export const ALL_SCENES: Scene[] = ["独自观影", "约会之夜", "家庭时光", "深夜电影", "周末放松", "通勤路上", "朋友聚会"];

/** 心情 emoji */
export const MOOD_EMOJI: Record<Mood, string> = {
  "放松": "😌", "感动": "😢", "刺激": "⚡", "烧脑": "🧠",
  "浪漫": "💕", "怀旧": "📽️", "励志": "🔥", "暗黑": "🌑",
};

/** 场景 emoji */
export const SCENE_EMOJI: Record<Scene, string> = {
  "独自观影": "🧘", "约会之夜": "🍷", "家庭时光": "👨‍👩‍👧‍👦", "深夜电影": "🌙",
  "周末放松": "🛋️", "通勤路上": "🚇", "朋友聚会": "🎉",
};

/** 根据心情 + 场景生成 TMDb discover 参数 */
export function getRecommendParams(mood: Mood, scene: Scene): {
  with_genres: string;
  sort_by: string;
  "vote_average.gte": string;
  "primary_release_date.gte": string;
  "primary_release_date.lte": string;
} {
  const genres = MOOD_GENRE_MAP[mood];
  const scenePref = SCENE_BONUS[scene];

  return {
    with_genres: genres.join("|"),
    sort_by: scenePref.sortBy,
    "vote_average.gte": String(scenePref.voteMin),
    "primary_release_date.gte": `${scenePref.yearBoost[0]}-01-01`,
    "primary_release_date.lte": `${scenePref.yearBoost[1]}-12-31`,
  };
}

/** 生成当天的确定性种子（保证同一天同一组合返回相同偏移） */
export function dailySeed(mood: Mood, scene: Scene): number {
  const today = new Date().toISOString().slice(0, 10); // "2026-06-09"
  const str = `${today}-${mood}-${scene}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
