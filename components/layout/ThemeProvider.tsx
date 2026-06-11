"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type ThemeName = "classic" | "nouvelle" | "noir" | "deco";

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

export const themeList: { key: ThemeName; label: string; emoji: string }[] = [
  { key: "classic", label: "经典", emoji: "🎞️" },
  { key: "nouvelle", label: "新浪潮", emoji: "🎬" },
  { key: "noir", label: "霓虹", emoji: "🌃" },
  { key: "deco", label: "黄金", emoji: "✨" },
];

const ThemeContext = createContext<ThemeContextValue>({
  theme: "classic",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("classic");

  useEffect(() => {
    const saved = localStorage.getItem("cinevault-theme") as ThemeName | null;
    if (saved && themeList.some((t) => t.key === saved)) {
      setThemeState(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("cinevault-theme", t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
