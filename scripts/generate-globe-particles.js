/**
 * 生成粒子地球仪数据
 * 从世界地图图片中采样，区分海洋和大陆粒子
 *
 * 用法: node scripts/generate-globe-particles.js
 * 输出: public/globe-particles.json
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const OUTPUT = path.join(__dirname, "..", "public", "globe-particles.json");
const SIZE = 1024; // 采样分辨率
const OCEAN_COUNT = 18000;
const LAND_COUNT = 10000;

// 使用简单的内建世界地图数据（经纬度边界的大陆近似多边形）
// 这里我们使用 Canvas 2D API 或者用 sharp 处理图片
// 作为替代方案，我们直接在 JS 中做数学判断

// ============ 方案：基于经纬度的简化大陆判断 ============
// 使用多个矩形/椭圆区域近似各大陆

const LAND_REGIONS = [
  // 北美洲
  { latRange: [15, 72], lonRange: [-168, -52] },
  // 中美洲
  { latRange: [7, 30], lonRange: [-118, -77] },
  // 南美洲
  { latRange: [-56, 12], lonRange: [-81, -34] },
  // 欧洲
  { latRange: [35, 71], lonRange: [-10, 40] },
  // 英国/冰岛
  { latRange: [50, 66], lonRange: [-25, -5] },
  // 斯堪的纳维亚
  { latRange: [55, 72], lonRange: [5, 32] },
  // 非洲
  { latRange: [-35, 37], lonRange: [-18, 51] },
  // 马达加斯加
  { latRange: [-26, -12], lonRange: [43, 51] },
  // 亚洲大陆
  { latRange: [10, 75], lonRange: [25, 180] },
  // 东南亚群岛（简化）
  { latRange: [-10, 20], lonRange: [95, 150] },
  // 日本
  { latRange: [30, 46], lonRange: [129, 146] },
  // 印度
  { latRange: [8, 35], lonRange: [68, 90] },
  // 中东
  { latRange: [12, 40], lonRange: [35, 60] },
  // 澳大利亚
  { latRange: [-40, -10], lonRange: [113, 155] },
  // 新西兰
  { latRange: [-47, -34], lonRange: [166, 179] },
  // 新几内亚
  { latRange: [-10, -1], lonRange: [130, 151] },
  // 格陵兰
  { latRange: [60, 83], lonRange: [-73, -12] },
  // 加勒比群岛
  { latRange: [10, 27], lonRange: [-85, -59] },
  // 台湾
  { latRange: [21.5, 25.5], lonRange: [120, 122] },
  // 斯里兰卡
  { latRange: [5.5, 10], lonRange: [79.5, 82] },
  // 菲律宾
  { latRange: [5, 20], lonRange: [117, 127] },
  // 韩国
  { latRange: [33, 39], lonRange: [126, 130] },
  // 古巴
  { latRange: [20, 23.5], lonRange: [-85, -74] },
];

function isLand(lat, lon) {
  for (const region of LAND_REGIONS) {
    if (lat >= region.latRange[0] && lat <= region.latRange[1] &&
        lon >= region.lonRange[0] && lon <= region.lonRange[1]) {
      // 对某些区域做额外的挖空处理（海洋/湖泊）

      // 地中海
      if (lat >= 30 && lat <= 46 && lon >= -6 && lon <= 36) return false;
      // 黑海
      if (lat >= 40 && lat <= 47 && lon >= 28 && lon <= 42) return false;
      // 里海
      if (lat >= 36 && lat <= 47 && lon >= 47 && lon <= 55) return false;
      // 红海
      if (lat >= 12 && lat <= 30 && lon >= 32 && lon <= 44) return false;
      // 波斯湾
      if (lat >= 24 && lat <= 31 && lon >= 48 && lon <= 57) return false;
      // 哈德逊湾
      if (lat >= 51 && lat <= 65 && lon >= -95 && lon <= -76) return false;
      // 墨西哥湾
      if (lat >= 18 && lat <= 30 && lon >= -98 && lon <= -82) return false;
      // 北海/波罗的海
      if (lat >= 53 && lat <= 60 && lon >= -5 && lon <= 5) return false;
      // 孟加拉湾
      if (lat >= 5 && lat <= 22 && lon >= 80 && lon <= 95) return false;
      // 南中国海挖空
      if (lat >= -5 && lat <= 22 && lon >= 105 && lon <= 122) return false;
      // 日本海
      if (lat >= 35 && lat <= 46 && lon >= 130 && lon <= 140) return false;

      return true;
    }
  }
  return false;
}

// ============ 生成粒子 ============

/** 经纬度 → 3D 球面坐标 */
function latLonToVec3(lat, lon, radius = 1.5) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return {
    x: -radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}

/** Fibonacci 球面均匀采样 */
function fibonacciSphere(n) {
  const points = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;
    points.push({
      x: Math.cos(theta) * radiusAtY,
      y: y,
      z: Math.sin(theta) * radiusAtY,
    });
  }
  return points;
}

/** 3D 单位向量 → 经纬度 */
function vec3ToLatLon(v) {
  const lat = Math.asin(v.y) * (180 / Math.PI);
  const lon = Math.atan2(v.z, v.x) * (180 / Math.PI);
  return { lat, lon: -lon }; // 修正方向
}

function generate() {
  const totalPoints = OCEAN_COUNT + LAND_COUNT;
  const spherePoints = fibonacciSphere(totalPoints);

  const ocean = [];
  const land = [];

  for (const pt of spherePoints) {
    const { lat, lon } = vec3ToLatLon(pt);
    const r = 1.5;
    const pos = { x: pt.x * r, y: pt.y * r, z: pt.z * r };

    if (isLand(lat, lon)) {
      land.push(pos);
    } else {
      ocean.push(pos);
    }
  }

  // 如果大陆粒子不够，从海洋转移一些
  while (land.length < LAND_COUNT && ocean.length > 0) {
    const idx = Math.floor(Math.random() * ocean.length);
    land.push(ocean.splice(idx, 1)[0]);
  }

  // 如果大陆粒子太多，转移回海洋
  while (land.length > LAND_COUNT) {
    const idx = Math.floor(Math.random() * land.length);
    ocean.push(land.splice(idx, 1)[0]);
  }

  const result = {
    ocean: ocean.slice(0, OCEAN_COUNT),
    land: land.slice(0, LAND_COUNT),
  };

  console.log(`Generated: ${result.ocean.length} ocean, ${result.land.length} land particles`);

  fs.writeFileSync(OUTPUT, JSON.stringify(result));
  console.log(`Written to ${OUTPUT}`);
}

generate();
