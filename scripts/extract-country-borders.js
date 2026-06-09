/**
 * 从 Natural Earth TopoJSON 提取国家边界数据
 *
 * 用法: node scripts/extract-country-borders.js
 * 输入: data/world-countries.json (Natural Earth 50m via world-atlas)
 * 输出: data/country-borders.json
 */

const { feature } = require("topojson-client");
const fs = require("fs");
const path = require("path");

const INPUT = path.join(__dirname, "..", "data", "world-countries.json");
const OUTPUT = path.join(__dirname, "..", "data", "country-borders.json");

const topo = JSON.parse(fs.readFileSync(INPUT, "utf8"));

// 转换 TopoJSON → GeoJSON FeatureCollection
const countries = feature(topo, topo.objects.countries);

// 我们需要的国家列表 (Natural Earth NAME 字段)
const TARGET_NAMES = {
  "United States of America": "US",
  "France": "FR",
  "Japan": "JP",
  "South Korea": "KR",
  "United Kingdom": "GB",
  "Italy": "IT",
  "Germany": "DE",
  "India": "IN",
  "China": "CN",
  "Russia": "RU",
  "Australia": "AU",
  "Brazil": "BR",
  "Mexico": "MX",
  "Spain": "ES",
  "Sweden": "SE",
  "Canada": "CA",
  "Argentina": "AR",
  "Thailand": "TH",
  "Egypt": "EG",
  "South Africa": "ZA",
  "Turkey": "TR",
  "Poland": "PL",
  "Denmark": "DK",
  "Nigeria": "NG",
  "Iran": "IR",
  "New Zealand": "NZ",
};

// ISO 3166-1 alpha-2 代码反查
const TARGET_CODES = Object.fromEntries(
  Object.entries(TARGET_NAMES).map(([name, code]) => [code, name])
);

// 还需要通过 ISO code 尝试匹配一些国家
const CODE_MAP = {
  "US": "United States of America",
  "FR": "France",
  "JP": "Japan",
  "KR": "South Korea",
  "GB": "United Kingdom",
  "IT": "Italy",
  "DE": "Germany",
  "IN": "India",
  "CN": "China",
  "RU": "Russia",
  "AU": "Australia",
  "BR": "Brazil",
  "MX": "Mexico",
  "ES": "Spain",
  "SE": "Sweden",
  "CA": "Canada",
  "AR": "Argentina",
  "TH": "Thailand",
  "EG": "Egypt",
  "ZA": "South Africa",
  "TR": "Turkey",
  "PL": "Poland",
  "DK": "Denmark",
  "NG": "Nigeria",
  "IR": "Iran",
  "NZ": "New Zealand",
};

// 分离岛屿/飞地的辅助函数
function extractMainPolygon(geometry) {
  if (!geometry) return null;

  // Polygon → 取外环
  if (geometry.type === "Polygon") {
    return geometry.coordinates[0]; // 外环
  }

  // MultiPolygon → 取面积最大的
  if (geometry.type === "MultiPolygon") {
    let largest = null;
    let largestArea = 0;
    for (const poly of geometry.coordinates) {
      const ring = poly[0];
      let area = 0;
      for (let i = 0; i < ring.length; i++) {
        const j = (i + 1) % ring.length;
        area += ring[i][0] * ring[j][1] - ring[j][0] * ring[i][1];
      }
      area = Math.abs(area);
      if (area > largestArea) {
        largestArea = area;
        largest = ring;
      }
    }
    return largest; // 主多边形外环
  }

  return null;
}

// 简化多边形：保留最多 N 个顶点
function simplifyRing(ring, maxPoints = 200) {
  if (ring.length <= maxPoints) return ring;

  const step = ring.length / maxPoints;
  const result = [];
  for (let i = 0; i < maxPoints; i++) {
    result.push(ring[Math.floor(i * step)]);
  }
  return result;
}

// 处理
const result = {};

for (const feature of countries.features) {
  const props = feature.properties;
  const name = props.name || props.NAME || "";
  const iso = props.adm0_a3 || props.iso_a3 || props.ISO_A3 || "";

  // 按名称或 ISO 代码匹配
  let countryCode = TARGET_NAMES[name];
  if (!countryCode && iso && CODE_MAP[iso]) {
    countryCode = iso;
  }

  if (!countryCode) continue;

  const mainPolygon = extractMainPolygon(feature.geometry);
  if (!mainPolygon) continue;

  // 转换为 [lat, lon] 格式并简化
  const simplified = simplifyRing(
    mainPolygon.map(([lon, lat]) => [lat, lon]),
    200
  );

  result[countryCode] = simplified;
  console.log(`${countryCode} (${name}): ${simplified.length} vertices`);
}

// 额外处理：台湾、香港可能不在数据集中（属中国），手动从中国多边形中粗略标记
// 保留之前的近似多边形作为备用
console.log(`\nTotal extracted: ${Object.keys(result).length} countries`);
fs.writeFileSync(OUTPUT, JSON.stringify(result));
console.log(`Written to ${OUTPUT}`);
