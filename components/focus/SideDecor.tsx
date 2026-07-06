"use client";
import { useTheme } from "@/components/layout/ThemeProvider";

export default function SideDecor({ side }: { side: "left" | "right" }) {
  const { theme } = useTheme();
  const isLeft = side === "left";

  return (
    <div
      className="hidden lg:block fixed bottom-0 z-10 pointer-events-none"
      style={{
        width: "min(120px, 10vw)",
        height: "min(400px, 60vh)",
        bottom: "60px",
        [isLeft ? "left" : "right"]: "max(16px, 2vw)",
      }}
    >
      {theme === "classic" && (
        <div className="flex flex-col items-center gap-4 h-full justify-end pb-8">
          {[1,2,3].map(i => (
            <div key={i} className="w-px" style={{
              height: `${40 + i * 20}px`,
              background: `linear-gradient(to bottom, var(--theme-accent), transparent)`,
              opacity: 0.3 - i * 0.08,
            }} />
          ))}
          <div className="w-2 h-2 rounded-full" style={{ background: "var(--theme-accent)", opacity: 0.4 }} />
        </div>
      )}
      {theme === "nouvelle" && (
        <div className="flex flex-col items-center gap-6 h-full justify-end pb-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="w-8 h-px" style={{
              background: "var(--theme-text)",
              opacity: 0.15 - i * 0.03,
            }} />
          ))}
        </div>
      )}
      {theme === "noir" && (
        <div className="flex flex-col items-center gap-4 h-full justify-end pb-8">
          {[1,2,3].map(i => (
            <div key={i} className="w-1 h-1 rounded-full" style={{
              background: i % 2 === 0 ? "#ff2d78" : "#00d4ff",
              boxShadow: `0 0 ${6 + i * 2}px ${i % 2 === 0 ? "#ff2d78" : "#00d4ff"}`,
              opacity: 0.4 - i * 0.1,
            }} />
          ))}
        </div>
      )}
      {theme === "deco" && (
        <div className="flex flex-col items-center gap-3 h-full justify-end pb-8">
          {[1,2,3].map(i => (
            <div key={i} style={{
              width: `${16 + i * 8}px`,
              height: "1px",
              background: "var(--theme-accent)",
              opacity: 0.25 - i * 0.06,
            }} />
          ))}
          <div className="w-2 h-2" style={{ border: "1px solid var(--theme-accent)", opacity: 0.3, transform: "rotate(45deg)" }} />
        </div>
      )}
    </div>
  );
}
