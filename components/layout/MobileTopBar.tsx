"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme, themeList, type ThemeName } from "./ThemeProvider";

const THEME_DOT: Record<ThemeName, string> = {
  classic: "#c8a040",
  nouvelle: "#c41e3a",
  noir: "#ff2d78",
  deco: "#d9b85e",
};

/** 移动端顶部栏：品牌 + 主题切换，与桌面侧边栏保持一致的视觉身份 */
export default function MobileTopBar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // 专注模式为沉浸式全屏，隐藏顶部栏
  if (pathname === "/focus") return null;

  return (
    <header
      className="lg:hidden sticky top-0 z-40 backdrop-blur-lg"
      style={{
        backgroundColor: "color-mix(in srgb, var(--theme-surface) 88%, transparent)",
        borderBottom: "1px solid var(--theme-border)",
      }}
    >
      <div className="mx-auto flex h-12 w-full max-w-content items-center justify-between px-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span
            className="text-base font-display font-semibold tracking-wider"
            style={{ color: "var(--theme-accent)" }}
          >
            CineVault
          </span>
          <span
            className="text-[9px] tracking-[0.3em] hidden min-[360px]:inline"
            style={{ color: "var(--theme-text-muted)" }}
          >
            CINEMA
          </span>
        </Link>

        <div className="flex items-center gap-2" role="group" aria-label="切换主题">
          <span
            className="text-[9px] tracking-[0.2em] mr-0.5"
            style={{ color: "var(--theme-text-muted)" }}
          >
            主题
          </span>
          {themeList.map((t) => {
            const active = theme === t.key;
            return (
              <button
                key={t.key}
                type="button"
                aria-label={`切换到${t.label}主题`}
                aria-pressed={active}
                title={t.label}
                onClick={() => setTheme(t.key)}
                className="h-5 w-5 rounded-full border transition-transform duration-300"
                style={{
                  backgroundColor: THEME_DOT[t.key],
                  borderColor: active ? "var(--theme-text)" : "transparent",
                  boxShadow: active ? "0 0 0 2px var(--theme-surface)" : "none",
                  transform: active ? "scale(1.1)" : "scale(0.82)",
                  opacity: active ? 1 : 0.55,
                }}
              />
            );
          })}
        </div>
      </div>
    </header>
  );
}