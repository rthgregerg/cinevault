/**
 * 国家边界数据 — 来自 Natural Earth 50m (via world-atlas)
 * 每个国家 100-200 个精确顶点，用于球面 3D 边界线和 2D SVG 地图
 */

import bordersRaw from "./country-borders.json";
const borders = bordersRaw as unknown as Record<string, [number, number][]>;

// 补充台湾、香港的近似数据（Natural Earth 中属于中国）
const EXTRA: Record<string, [number, number][]> = {
  TW: [
    [25.3,121.5],[25,121.8],[24.5,122],[24,121.7],[23.5,121.5],[23,121],[22.5,120.5],[22,120.3],
    [21.9,120.8],[22,121.3],[22.5,121.5],[23,121.8],[23.5,122],[24,122],[24.5,121.8],[25,121.5],[25.3,121.5],
  ],
  HK: [
    [22.56,114.16],[22.53,114.29],[22.42,114.37],[22.30,114.35],[22.20,114.25],
    [22.15,114.18],[22.15,114.12],[22.20,114.05],[22.28,114.00],[22.38,114.03],
    [22.50,114.08],[22.56,114.16],
  ],
};

export const COUNTRY_BORDERS: Record<string, [number, number][]> = {
  ...borders,
  ...EXTRA,
};
