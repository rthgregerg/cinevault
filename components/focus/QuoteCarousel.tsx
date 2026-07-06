"use client";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/layout/ThemeProvider";

interface Quote {
  id: string; quoteZh: string; quoteEn: string;
  film: string; filmEn: string; year: number; tmdbId: number;
}

const quotes: Quote[] = [
  { id: "q1", quoteZh: "希望是美好的，也许是人间至善，而美好的事物永不消逝。", quoteEn: "Hope is a good thing, maybe the best of things, and no good thing ever dies.", film: "肖申克的救赎", filmEn: "The Shawshank Redemption", year: 1994, tmdbId: 278 },
  { id: "q2", quoteZh: "人生就像一盒巧克力，你永远不知道下一颗是什么味道。", quoteEn: "Life is like a box of chocolates. You never know what you're gonna get.", film: "阿甘正传", filmEn: "Forrest Gump", year: 1994, tmdbId: 13 },
  { id: "q3", quoteZh: "我们读诗写诗，并不是因为它们好玩，而是因为我们是人类的一分子。", quoteEn: "We don't read and write poetry because it's cute. We read and write poetry because we are members of the human race.", film: "死亡诗社", filmEn: "Dead Poets Society", year: 1989, tmdbId: 207 },
  { id: "q4", quoteZh: "每个人都会死，但不是每个人都真正活过。", quoteEn: "Every man dies. Not every man really lives.", film: "勇敢的心", filmEn: "Braveheart", year: 1995, tmdbId: 197 },
  { id: "q5", quoteZh: "如果你有梦想，就要去捍卫它。", quoteEn: "You got a dream, you gotta protect it.", film: "当幸福来敲门", filmEn: "The Pursuit of Happyness", year: 2006, tmdbId: 1402 },
  { id: "q6", quoteZh: "世界上只有一种真正的英雄主义，那就是在认清生活真相之后依然热爱生活。", quoteEn: "There is only one heroism in the world: to see the world as it is, and to love it.", film: "闻香识女人", filmEn: "Scent of a Woman", year: 1992, tmdbId: 9475 },
  { id: "q7", quoteZh: "我们一路奋战，不是为了改变世界，而是为了不让世界改变我们。", quoteEn: "We fight not to change the world, but to keep the world from changing us.", film: "熔炉", filmEn: "Silenced", year: 2011, tmdbId: 91070 },
  { id: "q8", quoteZh: "活着本身就是一种胜利。", quoteEn: "To live is itself a victory.", film: "活着", filmEn: "To Live", year: 1994, tmdbId: 11104 },
  { id: "q9", quoteZh: "这世界很糟，但是你会爱上它的。", quoteEn: "The world is a bad place, but you're going to love it.", film: "海上钢琴师", filmEn: "The Legend of 1900", year: 1998, tmdbId: 10376 },
  { id: "q10", quoteZh: "我不知道将去何方，但我已在路上。", quoteEn: "I don't know where I'm going, but I'm on my way.", film: "千与千寻", filmEn: "Spirited Away", year: 2001, tmdbId: 129 },
  { id: "q11", quoteZh: "回忆之所以美好，是因为我们都回不去了。", quoteEn: "Memory is so beautiful because we can never go back.", film: "一代宗师", filmEn: "The Grandmaster", year: 2013, tmdbId: 44865 },
  { id: "q12", quoteZh: "时间可以伸缩和折叠，唯独不能倒退。", quoteEn: "Time can stretch and fold, but it can never go backwards.", film: "星际穿越", filmEn: "Interstellar", year: 2014, tmdbId: 157336 },
  { id: "q13", quoteZh: "爱是我们唯一能够感知的，超越时空维度的事物。", quoteEn: "Love is the one thing we're capable of perceiving that transcends dimensions of time and space.", film: "星际穿越", filmEn: "Interstellar", year: 2014, tmdbId: 157336 },
  { id: "q14", quoteZh: "所有大人都曾经是小孩，虽然只有少数人记得。", quoteEn: "All grown-ups were once children, although few of them remember it.", film: "小王子", filmEn: "The Little Prince", year: 2015, tmdbId: 309809 },
  { id: "q15", quoteZh: "一件事无论太晚，或者对于我来说太早，都不会阻拦你成为你想成为的那个人。", quoteEn: "For what it's worth, it's never too late to be whoever you want to be.", film: "本杰明·巴顿奇事", filmEn: "The Curious Case of Benjamin Button", year: 2008, tmdbId: 4922 },
  { id: "q16", quoteZh: "过去只是我们说给自己听的一个故事。", quoteEn: "The past is just a story we tell ourselves.", film: "她", filmEn: "Her", year: 2013, tmdbId: 152601 },
  { id: "q17", quoteZh: "真正的自由，不是你能做什么，而是你能不做什么。", quoteEn: "True freedom is not being able to do what you want, but being able to not do what you don't want.", film: "荒野生存", filmEn: "Into the Wild", year: 2007, tmdbId: 5915 },
  { id: "q18", quoteZh: "你得决定自己是什么。别人给你贴的标签不重要。", quoteEn: "You have to decide what you are. The labels other people give you don't matter.", film: "月光男孩", filmEn: "Moonlight", year: 2016, tmdbId: 376867 },
];

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: Math.min(total, 18) }).map((_, i) => (
        <div
          key={i}
          className="transition-all duration-1000 rounded-full"
          style={{
            width: i === current ? "5px" : "3px",
            height: i === current ? "5px" : "3px",
            background: i === current ? "var(--theme-accent)" : "var(--theme-border)",
            transform: i === current ? "scale(1.4)" : "scale(1)",
          }}
        />
      ))}
    </div>
  );
}

function MoviePoster({ tmdbId }: { tmdbId: number }) {
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch(`/api/movie/${tmdbId}`, { signal: ac.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data.poster_path) {
          setPosterUrl(`https://image.tmdb.org/t/p/w342${data.poster_path}`);
        }
      })
      .catch(() => {});
    return () => ac.abort();
  }, [tmdbId]);

  if (!posterUrl) {
    return (
      <div
        className="w-24 h-36 md:w-32 md:h-48 rounded-sm flex items-center justify-center"
        style={{ background: "var(--theme-accent-light)" }}
      >
        <span className="text-xs" style={{ color: "var(--theme-text-secondary)" }}>🎬</span>
      </div>
    );
  }

  return (
    <img
      src={posterUrl}
      alt=""
      className="w-24 h-36 md:w-32 md:h-48 object-cover rounded-sm shadow-lg animate-in fade-in duration-500"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
    />
  );
}

interface QuoteCarouselProps {
  timerRunning: boolean;
}

export default function QuoteCarousel({ timerRunning }: QuoteCarouselProps) {
  const { theme } = useTheme();
  const [current, setCurrent] = useState(0);
  const [animStage, setAnimStage] = useState<"enter" | "hold" | "exit">("enter");
  const quote = quotes[current];
  const isNoir = theme === "noir";

  useEffect(() => {
    if (timerRunning) return;
    const t = setInterval(() => {
      setAnimStage("exit");
      setTimeout(() => {
        setCurrent((c) => (c + 1) % quotes.length);
        setAnimStage("enter");
      }, 600);
    }, 12000);
    return () => clearInterval(t);
  }, [timerRunning]);

  useEffect(() => { setAnimStage("enter"); }, []);

  const goTo = (index: number) => {
    setAnimStage("exit");
    setTimeout(() => {
      setCurrent(index);
      setAnimStage("enter");
    }, 600);
  };

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6">
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 max-w-lg">
        <div
          className="shrink-0 transition-all duration-600"
          style={{
            opacity: animStage === "exit" ? 0 : 1,
            transform: animStage === "exit"
              ? "translateY(-16px) scale(0.95)"
              : animStage === "enter"
              ? "translateY(8px) scale(1.02)"
              : "translateY(0) scale(1)",
            transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <MoviePoster tmdbId={quote.tmdbId} />
        </div>

        <div
          className="text-center px-5 py-5 md:px-7 md:py-6 max-w-xs transition-all duration-600"
          style={{
            opacity: animStage === "exit" ? 0 : 1,
            transform: animStage === "exit"
              ? "translateY(12px)"
              : animStage === "enter"
              ? "translateY(-4px)"
              : "translateY(0)",
            transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            background: "var(--theme-card)",
            backdropFilter: "blur(10px)",
            border: "1px solid var(--theme-border)",
            borderTop: `2px solid var(--theme-accent)`,
            borderBottom: `2px solid var(--theme-accent)`,
            borderRadius: "4px",
            boxShadow: isNoir
              ? "0 4px 24px rgba(255,45,120,0.05)"
              : "0 4px 20px rgba(0,0,0,0.04)",
          }}
        >
          <div className="text-2xl md:text-3xl leading-none mb-2"
            style={{ color: "var(--theme-accent)", opacity: 0.4, fontFamily: "Georgia, serif" }}>
            &ldquo;
          </div>
          <p className="leading-[2] md:leading-[2.1] mb-3 tracking-wide"
            style={{
              color: "var(--theme-text)",
              fontSize: "clamp(0.95rem, 2vw, 1.2rem)",
            }}>
            {quote.quoteZh}
          </p>
          <p className="italic leading-relaxed mb-3 text-xs md:text-sm font-light"
            style={{ color: "var(--theme-text-secondary)" }}>
            "{quote.quoteEn}"
          </p>
          <div className="flex items-center justify-center gap-2 mb-3">
            <div style={{ width: "12px", height: "0.5px", background: "var(--theme-accent)", opacity: 0.3 }} />
            <div style={{ width: "3px", height: "3px", background: "var(--theme-accent)", transform: "rotate(45deg)", opacity: 0.5 }} />
            <div style={{ width: "12px", height: "0.5px", background: "var(--theme-accent)", opacity: 0.3 }} />
          </div>
          <p className="text-xs tracking-[0.2em]" style={{ color: "var(--theme-text-secondary)" }}>
            《{quote.film}》· {quote.year}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button onClick={() => goTo((current - 1 + quotes.length) % quotes.length)} className="p-2 transition-opacity hover:opacity-50" style={{ color: "var(--theme-text-secondary)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <ProgressDots total={quotes.length} current={current} />
        <button onClick={() => goTo((current + 1) % quotes.length)} className="p-2 transition-opacity hover:opacity-50" style={{ color: "var(--theme-text-secondary)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>
    </div>
  );
}
