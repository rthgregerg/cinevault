import type { UserMark, Collection, UserStats, MonthlyStat } from "./types";

const STORAGE_KEYS = {
  userMarks: "cinevault_user_marks",
  collections: "cinevault_collections",
  userStats: "cinevault_user_stats",
} as const;

// ==================== 用户标记 ====================

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

// ==================== 收藏夹管理 ====================

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** 获取所有收藏夹 */
export function getCollections(): Collection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.collections);
    const arr: Collection[] = raw ? JSON.parse(raw) : [];
    return arr.sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}

/** 创建收藏夹 */
export function createCollection(name: string, description = ""): Collection {
  const collections = getCollections();
  const collection: Collection = {
    id: genId(),
    name,
    description,
    coverMovieId: null,
    movieIds: [],
    createdAt: new Date().toISOString(),
    order: collections.length,
  };
  collections.push(collection);
  localStorage.setItem(STORAGE_KEYS.collections, JSON.stringify(collections));
  return collection;
}

/** 更新收藏夹 */
export function updateCollection(
  id: string,
  patch: Partial<Omit<Collection, "id" | "createdAt">>
): Collection | null {
  const collections = getCollections();
  const idx = collections.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  collections[idx] = { ...collections[idx], ...patch };
  localStorage.setItem(STORAGE_KEYS.collections, JSON.stringify(collections));
  return collections[idx];
}

/** 删除收藏夹 */
export function deleteCollection(id: string): void {
  const collections = getCollections().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.collections, JSON.stringify(collections));
}

/** 向收藏夹添加电影 */
export function addToCollection(collectionId: string, movieId: string): boolean {
  const collections = getCollections();
  const idx = collections.findIndex((c) => c.id === collectionId);
  if (idx === -1) return false;
  if (collections[idx].movieIds.includes(movieId)) return true;
  collections[idx].movieIds.push(movieId);
  // 自动设置封面为首部添加的电影
  if (!collections[idx].coverMovieId) {
    collections[idx].coverMovieId = movieId;
  }
  localStorage.setItem(STORAGE_KEYS.collections, JSON.stringify(collections));
  return true;
}

/** 从收藏夹移除电影 */
export function removeFromCollection(collectionId: string, movieId: string): void {
  const collections = getCollections();
  const idx = collections.findIndex((c) => c.id === collectionId);
  if (idx === -1) return;
  collections[idx].movieIds = collections[idx].movieIds.filter((id) => id !== movieId);
  if (collections[idx].coverMovieId === movieId) {
    collections[idx].coverMovieId = collections[idx].movieIds[0] || null;
  }
  localStorage.setItem(STORAGE_KEYS.collections, JSON.stringify(collections));
}

/** 获取电影所属的收藏夹 ID 列表 */
export function getMovieCollections(movieId: string): string[] {
  return getCollections()
    .filter((c) => c.movieIds.includes(movieId))
    .map((c) => c.id);
}

// ==================== 观影统计 ====================

/** 获取用户统计 */
export function getUserStats(): UserStats {
  if (typeof window === "undefined") {
    return { totalRuntime: 0, totalWatched: 0, genreDistribution: {}, monthlyStats: {} };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.userStats);
    return raw ? JSON.parse(raw) : { totalRuntime: 0, totalWatched: 0, genreDistribution: {}, monthlyStats: {} };
  } catch {
    return { totalRuntime: 0, totalWatched: 0, genreDistribution: {}, monthlyStats: {} };
  }
}

/** 记录观影（标记看过时调用） */
export function recordWatch(movieId: string, runtime: number, genres: string[], watchedDate?: string): void {
  const stats = getUserStats();
  const date = watchedDate || new Date().toISOString().split("T")[0];
  const month = date.slice(0, 7); // "2026-06"

  stats.totalWatched++;
  stats.totalRuntime += runtime;

  // 类型分布
  for (const g of genres) {
    stats.genreDistribution[g] = (stats.genreDistribution[g] || 0) + 1;
  }

  // 月度统计
  if (!stats.monthlyStats[month]) {
    stats.monthlyStats[month] = { count: 0, runtime: 0, genres: {}, avgRating: 0 };
  }
  const ms = stats.monthlyStats[month];
  ms.count++;
  ms.runtime += runtime;
  for (const g of genres) {
    ms.genres[g] = (ms.genres[g] || 0) + 1;
  }

  // 更新平均评分
  const marks = getAllMarks();
  const ratedMovies = Object.values(marks).filter((m) => m.rating > 0);
  const totalRating = ratedMovies.reduce((sum, m) => sum + m.rating, 0);
  ms.avgRating = ratedMovies.length > 0 ? totalRating / ratedMovies.length : 0;

  localStorage.setItem(STORAGE_KEYS.userStats, JSON.stringify(stats));
}

/** 取消观影记录 */
export function unrecordWatch(movieId: string, runtime: number, genres: string[], watchedDate?: string): void {
  const stats = getUserStats();
  const date = watchedDate || new Date().toISOString().split("T")[0];
  const month = date.slice(0, 7);

  stats.totalWatched = Math.max(0, stats.totalWatched - 1);
  stats.totalRuntime = Math.max(0, stats.totalRuntime - runtime);

  for (const g of genres) {
    if (stats.genreDistribution[g]) {
      stats.genreDistribution[g] = Math.max(0, stats.genreDistribution[g] - 1);
    }
  }

  if (stats.monthlyStats[month]) {
    stats.monthlyStats[month].count = Math.max(0, stats.monthlyStats[month].count - 1);
    stats.monthlyStats[month].runtime = Math.max(0, stats.monthlyStats[month].runtime - runtime);
    for (const g of genres) {
      if (stats.monthlyStats[month].genres[g]) {
        stats.monthlyStats[month].genres[g] = Math.max(0, stats.monthlyStats[month].genres[g] - 1);
      }
    }
  }

  localStorage.setItem(STORAGE_KEYS.userStats, JSON.stringify(stats));
}
