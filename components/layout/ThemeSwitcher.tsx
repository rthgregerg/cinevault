"use client";
import { useTheme, themeList } from "./ThemeProvider";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-wrap gap-1.5">
      {themeList.map((t) => (
        <button
          key={t.key}
          onClick={() => setTheme(t.key)}
          className="px-3 py-1.5 text-[10px] tracking-widest rounded-full border transition-all duration-300"
          style={{
            borderColor:
              theme === t.key
                ? "var(--theme-accent)"
                : "var(--theme-border)",
            color:
              theme === t.key
                ? "var(--theme-text)"
                : "var(--theme-text-secondary)",
            background:
              theme === t.key ? "var(--theme-accent-light)" : "transparent",
          }}
        >
          <span className="mr-1">{t.emoji}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}
