"use client";
import { useState, useEffect, useCallback } from "react";

// ============ 经典电影台词 ============

const QUOTES: { zh: string; en: string; from: string }[] = [
  { zh: "每个人都会死，但不是每个人都真正活过。", en: "Every man dies, not every man really lives.", from: "《勇敢的心》" },
  { zh: "人生就像一盒巧克力，你永远不知道下一颗是什么味道。", en: "Life is like a box of chocolates.", from: "《阿甘正传》" },
  { zh: "记住，希望是好事，也许是世间最好的事。", en: "Hope is a good thing, maybe the best of things.", from: "《肖申克的救赎》" },
  { zh: "让一切随风而逝吧。", en: "After all, tomorrow is another day.", from: "《乱世佳人》" },
  { zh: "世界就是一个舞台，所有的男男女女不过是演员。", en: "All the world's a stage.", from: "《莎翁情史》" },
  { zh: "我见过你们人类绝对无法置信的事物。", en: "I've seen things you people wouldn't believe.", from: "《银翼杀手》" },
  { zh: "保持饥饿，保持愚蠢。", en: "Stay hungry, stay foolish.", from: "《乔布斯》" },
  { zh: "人如果没有梦想，和咸鱼有什么分别？", en: "A man without a dream is just a salted fish.", from: "《少林足球》" },
  { zh: "生而为人，我很抱歉。", en: "Born as a human, I am sorry.", from: "《被嫌弃的松子的一生》" },
  { zh: "这世界真小，小到我们无处可逃。", en: "The world is a fine place and worth fighting for.", from: "《七宗罪》" },
  { zh: "记住你是谁。", en: "Remember who you are.", from: "《狮子王》" },
  { zh: "不疯魔不成活。", en: "You must become mad to survive.", from: "《霸王别姬》" },
  { zh: "有些鸟是关不住的，它们的羽毛太鲜亮了。", en: "Some birds aren't meant to be caged.", from: "《肖申克的救赎》" },
  { zh: "时光易逝，光影永恒。", en: "Time flies, cinema endures.", from: "CineVault" },
];

// ============ 金色装饰线 ============

function GoldLines() {
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden">
      {/* 主横线 */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent mb-2" />
      {/* 短金线阵列 */}
      <div className="flex justify-center gap-3 mb-3">
        {[60, 30, 80, 40, 70].map((w, i) => (
          <div
            key={i}
            className="h-px bg-gold/35"
            style={{ width: w, transform: `rotate(${(i - 2) * 3}deg)` }}
          />
        ))}
      </div>
      {/* 底部金色渐变带 */}
      <div className="h-16 bg-gradient-to-t from-gold/10 to-transparent" />
    </div>
  );
}

// ============ 海报碎片 ============

function PosterFragments() {
  const [posters, setPosters] = useState<string[]>([]);

  const fetchPosters = useCallback(async () => {
    try {
      const res = await fetch("/api/movies?type=popular&page=1");
      const data = await res.json();
      const urls = (data.results || [])
        .filter((m: any) => m.poster_path)
        .slice(0, 8)
        .map((m: any) => `https://image.tmdb.org/t/p/w185${m.poster_path}`);
      setPosters(urls);
    } catch {
      setPosters([]);
    }
  }, []);

  useEffect(() => { fetchPosters(); }, [fetchPosters]);

  if (posters.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 opacity-40">
      {posters.slice(0, 6).map((url, i) => (
        <div
          key={i}
          className="aspect-[2/3] rounded-sm overflow-hidden bg-bg-elevated"
          style={{
            transform: `rotate(${(i % 2 === 0 ? 2 : -2)}deg) translateY(${i * 2}px)`,
          }}
        >
          <img
            src={url}
            alt=""
            className="w-full h-full object-cover grayscale"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}

// ============ 主组件 ============

export default function AtmospherePanel() {
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setQuoteIdx((prev) => (prev + 1) % QUOTES.length);
        setFading(false);
      }, 800);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const quote = QUOTES[quoteIdx];

  return (
    <aside className="hidden xl:flex flex-col fixed right-0 top-0 bottom-0 w-60 bg-bg/50 border-l border-white/5 px-5 py-8 z-30 pointer-events-none select-none">
      {/* 台词区 */}
      <div className="flex-1 flex flex-col justify-center">
        <div className={`transition-opacity duration-800 ${fading ? "opacity-0" : "opacity-100"}`}>
          <p className="text-gold/65 text-[10px] tracking-widest mb-4">经典台词</p>
          <p className="text-text-primary/75 text-sm leading-relaxed font-serif mb-3">
            {quote.zh}
          </p>
          <p className="text-text-muted/55 text-xs leading-relaxed italic mb-2">
            {quote.en}
          </p>
          <p className="text-text-muted/45 text-[10px]">{quote.from}</p>
        </div>
      </div>

      {/* 海报碎片 */}
      <div className="my-6">
        <PosterFragments />
      </div>

      {/* 金色几何线 */}
      <GoldLines />

      {/* 底部品牌 */}
      <div className="text-center mt-auto pt-4">
        <p className="text-gold/35 text-[10px] tracking-widest">CineVault</p>
        <p className="text-text-muted/25 text-[8px] mt-1">探索电影之美</p>
      </div>
    </aside>
  );
}
