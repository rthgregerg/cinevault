"use client";
import { useTheme } from "@/components/layout/ThemeProvider";

export default function HeroBanner() {
  const { theme } = useTheme();
  const isNoir = theme === "noir";

  return (
    <section
      className="relative text-center py-14 md:py-20 overflow-hidden"
      style={{ background: "var(--theme-hero)" }}
    >
      {/* ===== 主题装饰 ===== */}
      {theme === "classic" && (
        <div className="flex justify-center gap-1.5 mb-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{
                background: "var(--theme-accent)",
                boxShadow: "0 0 6px var(--theme-accent)",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      )}

      {theme === "nouvelle" && (
        <div className="flex items-center justify-center gap-3 mb-5" style={{ opacity: 0.25 }}>
          <div className="w-6 h-px" style={{ background: "var(--theme-text)" }} />
          <div className="w-1 h-1 rounded-full" style={{ background: "var(--theme-text)" }} />
          <div className="w-6 h-px" style={{ background: "var(--theme-text)" }} />
        </div>
      )}

      {theme === "noir" && (
        <div className="flex justify-center gap-2 mb-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full"
              style={{
                background: i % 2 === 0 ? "#ff2d78" : "#00d4ff",
                boxShadow: `0 0 8px ${i % 2 === 0 ? "#ff2d78" : "#00d4ff"}`,
              }}
            />
          ))}
        </div>
      )}

      {theme === "deco" && (
        <div className="mb-5">
          <div
            className="inline-block border-t-2 border-b-2 py-1.5 px-6"
            style={{ borderColor: "var(--theme-accent)" }}
          >
            <div className="flex gap-1 justify-center mb-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-px"
                  style={{ background: "var(--theme-accent)" }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== 主标题 ===== */}
      <h1
        className="text-2xl md:text-4xl font-display tracking-[0.12em] mb-3"
        style={{
          color: "var(--theme-text)",
          fontFamily:
            theme === "nouvelle"
              ? "'Courier New', monospace"
              : "Georgia, 'Noto Serif SC', serif",
          textShadow: isNoir ? "0 0 20px rgba(0,180,255,0.3)" : "none",
        }}
      >
        发现电影之美
      </h1>
      <p
        className="text-sm md:text-base tracking-[0.18em]"
        style={{ color: "var(--theme-text-secondary)" }}
      >
        探索影史之深
      </p>
      <div
        className="w-8 h-px mx-auto mt-4"
        style={{
          background:
            isNoir
              ? "linear-gradient(to right, #ff2d78, #00d4ff)"
              : "var(--theme-accent)",
        }}
      />

      {/* ===== 浮动装饰元素 (madebywild 风格) ===== */}
      <div
        className="flex justify-center gap-4 md:gap-8 mt-8"
        style={{ opacity: 0.35 }}
      >
        <div
          className="w-10 h-7 md:w-14 md:h-10 border rounded-sm flex items-center justify-center"
          style={{ borderColor: "var(--theme-accent)" }}
        >
          <span className="text-[8px] md:text-[10px]">🎬</span>
        </div>
        <div
          className="w-7 h-7 md:w-10 md:h-10 border rounded-full"
          style={{ borderColor: "var(--theme-accent)" }}
        />
        <div
          className="w-12 h-1.5 md:w-16 md:h-2 rounded-full"
          style={{ background: "var(--theme-accent-light)" }}
        />
      </div>
    </section>
  );
}
