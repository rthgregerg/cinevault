/**
 * 粒子地球仪数据生成器 v3 — 多边形边界采样 + 边缘检测
 *
 * 策略：
 *   1. 多边形边界上密集采样 → 大陆边缘粒子 (edge)
 *   2. 多边形内部随机采样 → 大陆内部粒子 (interior)
 *   3. 球面剩余区域 → 海洋粒子 (ocean)
 *
 * 用法: node scripts/generate-globe-particles.js
 * 输出: public/globe-particles.json
 */

const fs = require("fs");
const path = require("path");

const OUTPUT = path.join(__dirname, "..", "public", "globe-particles.json");
const RADIUS = 1.5;
const EDGE_PARTICLES = 1500;
const LAND_INTERIOR_PARTICLES = 2500;
const OCEAN_PARTICLES = 8000;
const TOTAL = EDGE_PARTICLES + LAND_INTERIOR_PARTICLES + OCEAN_PARTICLES;

// ============ 大陆多边形 (经纬度坐标) ============

const CONTINENTS = [
  ["NorthAmerica", [[72,-168],[70,-142],[72,-125],[71,-95],[68,-85],[64,-78],[60,-65],[55,-58],[50,-56],[47,-53],[44,-66],[42,-70],[38,-76],[33,-79],[28,-83],[26,-80],[24,-82],[18,-87],[16,-89],[14,-90],[10,-84],[8,-80],[9,-78],[14,-84],[16,-88],[20,-97],[22,-98],[25,-103],[27,-105],[30,-112],[31,-116],[34,-120],[37,-123],[40,-124],[44,-124],[48,-125],[52,-128],[55,-132],[58,-136],[60,-140],[62,-143],[64,-148],[67,-155],[69,-162],[72,-168]]],
  ["SouthAmerica", [[12,-71],[11,-72],[9,-76],[8,-77],[5,-77],[3,-77],[0,-80],[-3,-80],[-5,-81],[-7,-78],[-9,-78],[-12,-77],[-15,-75],[-18,-72],[-20,-70],[-23,-68],[-25,-66],[-28,-63],[-30,-60],[-33,-60],[-35,-57],[-37,-56],[-40,-55],[-42,-64],[-44,-66],[-47,-68],[-50,-70],[-52,-70],[-54,-70],[-55,-68],[-55,-65],[-53,-60],[-48,-52],[-42,-50],[-38,-50],[-34,-50],[-28,-45],[-24,-43],[-18,-40],[-14,-38],[-10,-37],[-6,-35],[-3,-40],[0,-46],[3,-50],[5,-52],[7,-58],[8,-61],[10,-64],[12,-71]]],
  ["Africa", [[37,-7],[35,-5],[33,-4],[31,-3],[29,-2],[26,-3],[22,-6],[16,-6],[12,-5],[8,-6],[5,-2],[2,5],[0,6],[-2,11],[-4,15],[-6,17],[-8,20],[-10,23],[-15,28],[-18,30],[-20,32],[-25,34],[-28,34],[-30,30],[-33,28],[-35,25],[-35,22],[-34,18],[-31,12],[-28,8],[-24,6],[-20,8],[-16,6],[-12,8],[-8,6],[-4,5],[0,6],[5,8],[10,5],[15,10],[18,15],[22,18],[25,20],[28,22],[30,26],[32,30],[34,34],[36,36],[37,28],[37,18],[37,10],[37,0],[37,-7]]],
  ["Europe", [[71,25],[70,30],[69,32],[66,32],[64,35],[60,28],[58,22],[55,15],[52,10],[50,2],[48,-5],[44,-7],[43,-3],[42,-2],[38,-8],[37,-9],[36,-5],[35,-5],[36,-4],[37,0],[38,5],[37,6],[36,10],[37,14],[38,18],[40,22],[41,26],[42,30],[43,34],[44,38],[45,40],[47,38],[50,40],[53,42],[55,45],[57,50],[59,54],[61,57],[63,60],[64,57],[66,55],[68,50],[70,40],[71,35],[71,25]]],
  ["Asia", [[72,50],[73,60],[72,72],[70,85],[68,100],[70,120],[72,140],[71,160],[68,175],[64,180],[62,175],[60,155],[55,140],[48,135],[42,128],[35,130],[32,126],[30,122],[28,118],[26,115],[22,110],[18,105],[15,100],[10,95],[6,90],[2,85],[0,80],[-2,75],[-4,70],[5,68],[10,65],[15,60],[20,55],[25,50],[28,45],[30,40],[32,35],[35,32],[37,30],[39,32],[42,35],[45,38],[48,42],[50,45],[52,50],[54,52],[56,55],[58,58],[60,60],[62,62],[64,58],[66,52],[68,48],[70,44],[72,38],[72,50]]],
  ["Australia", [[-12,130],[-14,128],[-17,124],[-20,120],[-23,115],[-26,114],[-30,116],[-33,118],[-35,122],[-35,128],[-33,135],[-30,140],[-28,145],[-24,148],[-22,150],[-18,148],[-15,146],[-13,144],[-12,140],[-12,138],[-12,130]]],
  ["Greenland", [[83,-50],[81,-40],[78,-20],[75,-18],[70,-22],[60,-43],[60,-50],[62,-55],[65,-55],[70,-60],[75,-65],[80,-60],[83,-50]]],
  ["UK", [[58.5,-6.5],[58,-5],[57,-3],[55.5,-2],[54,-1.5],[52.5,-2],[51,0],[50,-1],[50.5,-4],[51.5,-5.5],[52.5,-5.5],[54,-5],[55.5,-6],[57,-7],[58.5,-6.5]]],
  ["Japan", [[45.5,142],[44,144],[42.5,143],[40,141],[38,140],[36,138],[34,137],[32,132],[31,131],[31.5,130],[33,130],[34,131],[35,133],[36,135],[37,136],[38,138],[39,139],[41,140],[43,141],[45.5,142]]],
  ["Madagascar", [[-12,49],[-14,47],[-17,45],[-20,45],[-24,46],[-25.5,48],[-25,50],[-23,50],[-20,50],[-18,50],[-15,50],[-12,49]]],
  ["NZ", [[-34.5,173],[-36,174],[-38,176],[-40,176],[-42,174],[-43,172],[-45,170],[-46.5,168],[-46,167],[-44,168],[-42,169],[-40,171],[-38,173],[-36,172],[-34.5,173]]],
  ["Indonesia", [[7,115],[5,115],[3,112],[0,110],[-1,110],[-3,110],[-4,112],[-3,114],[1,116],[4,117],[6,117],[7,115]]],
  ["NewGuinea", [[0,132],[-1,132],[-3,135],[-4,138],[-5,141],[-6,144],[-7,146],[-6,148],[-4,148],[-2,146],[0,143],[1,140],[2,137],[1,134],[0,132]]],
  ["Sumatra", [[5,96],[4,97],[2,100],[0,102],[-2,104],[-4,105],[-6,105],[-5,104],[-3,102],[-1,100],[2,98],[5,96]]],
  ["Java", [[-6,106],[-7,106],[-7.5,108],[-8,110],[-8.5,113],[-8,114],[-7.5,113],[-7,110],[-6.5,108],[-6,106]]],
  ["India", [[35,72],[33,68],[28,68],[24,70],[22,72],[20,75],[15,77],[10,78],[8,78],[7,80],[8,82],[10,84],[13,85],[16,88],[20,90],[22,90],[23,88],[25,85],[27,82],[28,78],[30,74],[33,72],[35,72]]],
  ["SEAsia", [[28,98],[25,98],[22,100],[20,104],[18,106],[16,108],[14,109],[12,108],[10,106],[8,104],[6,104],[4,104],[2,104],[1,108],[3,110],[4,112],[6,114],[8,115],[10,115],[12,112],[14,110],[16,107],[18,104],[20,102],[22,100],[24,98],[28,98]]],
  ["Philippines", [[20,121],[18,122],[16,120],[13,122],[10,122],[8,124],[7,126],[7,124],[8,122],[10,120],[13,119],[16,119],[18,120],[20,121]]],
  ["Taiwan", [[25.3,121.5],[25,121],[24,120.5],[23,120],[22,120.5],[22,121],[22.5,121.5],[23.5,122],[24.5,122],[25.3,121.5]]],
  ["Korea", [[38.5,126],[37.5,126],[35,127],[34.5,127],[34.5,128.5],[35.5,129],[37,129.5],[38,129],[39,128.5],[39.5,127.5],[38.5,126]]],
  ["SriLanka", [[9.8,79.7],[9,80],[7.5,80.5],[6,81],[6,81.5],[7,82],[8,81.5],[9,81],[9.8,79.7]]],
  ["Cuba", [[23,-85],[22.5,-83],[22,-81],[21.5,-78],[20.5,-75],[20,-74],[20,-75.5],[20.5,-77],[21,-79],[22,-82],[23,-85]]],
  ["Iceland", [[66.5,-24],[66,-22],[65,-20],[64,-15],[63.5,-18],[64,-21],[64.5,-23],[65.5,-24],[66.5,-24]]],
  ["Scandinavia", [[71,25],[70,27],[68,30],[65,32],[63,22],[60,10],[58,8],[57,10],[56,12],[57,15],[58,18],[60,20],[62,25],[65,28],[68,28],[70,25],[71,25]]],
  ["Hispaniola", [[20,-72],[19.5,-70],[19,-69],[18,-69],[17.5,-71],[18,-72],[19,-73],[20,-72]]],
  ["CentralAmerica", [[18,-88],[16,-88],[14,-86],[12,-84],[11,-83],[10,-83],[9,-82],[8,-82],[8,-84],[9,-85],[11,-87],[13,-88],[15,-90],[16,-91],[18,-90],[18,-88]]],
];

// 海洋排除区
const OCEAN_HOLES = [
  [[30,-6],[46,-6],[46,36],[30,36]],   // Mediterranean
  [[40,28],[47,28],[47,42],[40,42]],   // BlackSea
  [[36,47],[47,47],[47,55],[36,55]],   // Caspian
  [[51,-95],[65,-95],[65,-76],[51,-76]], // HudsonBay
  [[18,-98],[30,-98],[30,-82],[18,-82]], // GulfMexico
  [[-5,105],[22,105],[22,122],[-5,122]], // SouthChinaSea
  [[35,130],[46,130],[46,140],[35,140]], // JapanSea
  [[12,32],[30,32],[30,44],[12,44]],   // RedSea
  [[24,48],[31,48],[31,57],[24,57]],   // PersianGulf
  [[5,80],[18,80],[18,93],[5,93]],     // BayOfBengal
  [[53,-5],[60,-5],[60,5],[53,5]],     // NorthSea
  [[54,10],[66,10],[66,30],[54,30]],    // Baltic
  [[10,-85],[22,-85],[22,-60],[10,-60]], // Caribbean
];

// ============ 工具函数 ============

function latLonToVec3(lat, lon, r = RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return { x: -r * Math.sin(phi) * Math.cos(theta), y: r * Math.cos(phi), z: r * Math.sin(phi) * Math.sin(theta) };
}

function pointInPolygon(lat, lon, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [lati, loni] = polygon[i];
    const [latj, lonj] = polygon[j];
    if ((loni > lon) !== (lonj > lon) && lat < (latj - lati) * (lon - loni) / (lonj - loni) + lati) inside = !inside;
  }
  return inside;
}

function isLand(lat, lon) {
  for (const [, poly] of CONTINENTS) {
    if (pointInPolygon(lat, lon, poly)) {
      for (const hole of OCEAN_HOLES) {
        if (pointInPolygon(lat, lon, hole)) return false;
      }
      return true;
    }
  }
  return false;
}

/** Fibonacci 球面采样 */
function fibonacciSphere(n) {
  const pts = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    pts.push({ x: Math.cos(phi * i) * r, y, z: Math.sin(phi * i) * r });
  }
  return pts;
}

function vec3ToLatLon(v) {
  return { lat: Math.asin(v.y) * (180 / Math.PI), lon: -Math.atan2(v.z, v.x) * (180 / Math.PI) };
}

/** 在多边形边界上采样 */
function samplePolygonBoundary(polygon, count) {
  // 计算边长
  const segments = [];
  let totalLen = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    const [lat1, lon1] = polygon[i];
    const [lat2, lon2] = polygon[j];
    const dlat = lat2 - lat1;
    const dlon = lon2 - lon1;
    const len = Math.sqrt(dlat * dlat + dlon * dlon);
    segments.push({ i, len, cumLen: totalLen });
    totalLen += len;
  }

  const points = [];
  for (let k = 0; k < count; k++) {
    const t = k / count;
    const target = t * totalLen;
    // 找到对应的线段
    let segIdx = 0;
    for (let s = 1; s < segments.length; s++) {
      if (segments[s].cumLen >= target) { segIdx = s - 1; break; }
      if (s === segments.length - 1) segIdx = s;
    }
    const seg = segments[segIdx];
    const localT = seg.len > 0 ? (target - seg.cumLen) / seg.len : 0;
    const clampedT = Math.max(0, Math.min(1, localT));
    const [lat1, lon1] = polygon[seg.i];
    const j = (seg.i + 1) % polygon.length;
    const [lat2, lon2] = polygon[j];
    const lat = lat1 + (lat2 - lat1) * clampedT;
    const lon = lon1 + (lon2 - lon1) * clampedT;
    points.push(latLonToVec3(lat, lon));
  }
  return points;
}

/** 在多边形内部均匀采样 */
function samplePolygonInterior(polygon, count) {
  // 找包围盒
  let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
  for (const [lat, lon] of polygon) {
    minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
    minLon = Math.min(minLon, lon); maxLon = Math.max(maxLon, lon);
  }

  const points = [];
  let attempts = 0;
  while (points.length < count && attempts < count * 20) {
    const lat = minLat + Math.random() * (maxLat - minLat);
    const lon = minLon + Math.random() * (maxLon - minLon);
    if (pointInPolygon(lat, lon, polygon)) {
      // 检查不被海洋排除区覆盖
      let inHole = false;
      for (const hole of OCEAN_HOLES) {
        if (pointInPolygon(lat, lon, hole)) { inHole = true; break; }
      }
      if (!inHole) {
        points.push(latLonToVec3(lat, lon));
      }
    }
    attempts++;
  }
  return points;
}

// ============ 生成 ============

function generate() {
  // 1. 大陆边缘粒子 — 在每个多边形的边界上采样
  const edgeParticles = [];
  const edgePerContinent = Math.floor(EDGE_PARTICLES / CONTINENTS.length);
  for (const [, poly] of CONTINENTS) {
    const pts = samplePolygonBoundary(poly, edgePerContinent);
    edgeParticles.push(...pts);
  }

  // 2. 大陆内部粒子
  const interiorParticles = [];
  // 计算每个大陆的面积比例来分配内部粒子数
  const areas = CONTINENTS.map(([, poly]) => {
    let area = 0;
    for (let i = 0; i < poly.length; i++) {
      const j = (i + 1) % poly.length;
      area += poly[i][0] * poly[j][1] - poly[j][0] * poly[i][1];
    }
    return Math.abs(area);
  });
  const totalArea = areas.reduce((a, b) => a + b, 0);

  for (let ci = 0; ci < CONTINENTS.length; ci++) {
    const [, poly] = CONTINENTS[ci];
    const count = Math.floor((areas[ci] / totalArea) * LAND_INTERIOR_PARTICLES);
    const pts = samplePolygonInterior(poly, count);
    interiorParticles.push(...pts);
  }

  // 3. 海洋粒子 — 球面均匀采样，排除陆地
  const oceanParticles = [];
  const spherePts = fibonacciSphere(OCEAN_PARTICLES * 3); // 过采样
  for (const pt of spherePts) {
    if (oceanParticles.length >= OCEAN_PARTICLES) break;
    const { lat, lon } = vec3ToLatLon(pt);
    if (!isLand(lat, lon)) {
      oceanParticles.push({ x: pt.x * RADIUS, y: pt.y * RADIUS, z: pt.z * RADIUS });
    }
  }

  console.log(`Edge: ${edgeParticles.length} | Interior: ${interiorParticles.length} | Ocean: ${oceanParticles.length}`);

  fs.writeFileSync(OUTPUT, JSON.stringify({
    ocean: oceanParticles,
    landInterior: interiorParticles,
    landEdge: edgeParticles,
  }));
  console.log(`Written to ${OUTPUT}`);
}

generate();
