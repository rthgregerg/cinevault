import type { UserMark } from "./types";

const STORAGE_KEYS = {
  userMarks: "cinevault_user_marks",
} as const;

/** 获取所有用户标记 */
export function getAllMarks(): Record<string, UserMark> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.userMarks);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** 获取单部电影的标记（无标记返回默认值） */
export function getMark(movieId: string): UserMark {
  const marks = getAllMarks();
  return marks[movieId] ?? {
    movieId,
    liked: false,
    wantToWatch: false,
    watched: false,
    collected: false,
    rating: 0,
  };
}

/** 更新单部电影的标记 */
export function setMark(movieId: string, patch: Partial<Omit<UserMark, "movieId">>): UserMark {
  const marks = getAllMarks();
  const current = marks[movieId] ?? {
    movieId,
    liked: false,
    wantToWatch: false,
    watched: false,
    collected: false,
    rating: 0,
  };
  const updated: UserMark = { ...current, ...patch };
  marks[movieId] = updated;
  localStorage.setItem(STORAGE_KEYS.userMarks, JSON.stringify(marks));
  return updated;
}

/** 切换布尔标记（喜欢/想看/看过/收藏） */
export function toggleMark(
  movieId: string,
  field: "liked" | "wantToWatch" | "watched" | "collected"
): UserMark {
  const current = getMark(movieId);
  const patch: Partial<UserMark> = {
    [field]: !current[field],
    // 取消"看过"时清空评分和日期
    ...(field === "watched" && current.watched
      ? { rating: 0 as number, watchedDate: undefined }
      : {}),
  };
  return setMark(movieId, patch);
}

/** 设置评分 (1-5) */
export function setRating(movieId: string, rating: number): UserMark {
  return setMark(movieId, { rating });
}

/** 获取所有标记了某个字段的电影 ID 列表 */
export function getMarkedMovieIds(
  field: "liked" | "wantToWatch" | "watched" | "collected"
): string[] {
  const marks = getAllMarks();
  return Object.values(marks)
    .filter((m) => m[field])
    .map((m) => m.movieId);
}

/** 获取用户所有评分的电影 */
export function getRatedMovies(): { movieId: string; rating: number }[] {
  const marks = getAllMarks();
  return Object.values(marks)
    .filter((m) => m.rating > 0)
    .map((m) => ({ movieId: m.movieId, rating: m.rating }));
}

/** 清除某部电影的所有标记 */
export function clearMark(movieId: string): void {
  const marks = getAllMarks();
  delete marks[movieId];
  localStorage.setItem(STORAGE_KEYS.userMarks, JSON.stringify(marks));
}
