"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeSwitcher from "./ThemeSwitcher";

const navItems = [
  { label: "首页", href: "/" },
  { label: "发现", href: "/discover" },
  { label: "影史", href: "/history" },
  { label: "收藏夹", href: "/collections" },
  { label: "我的", href: "/profile" },
  { label: "专注", href: "/focus" },
];

export default function DesktopSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-56 backdrop-blur-lg px-6 py-8 z-40"
      style={{
        backgroundColor: "color-mix(in srgb, var(--theme-surface) 85%, transparent)",
        borderRight: "1px solid var(--theme-border)",
      }}
    >
      <Link href="/" className="mb-12">
        <h1
          className="text-xl font-display font-semibold tracking-wider"
          style={{ color: "var(--theme-accent)" }}
        >
          CineVault
        </h1>
      </Link>

      <nav className="flex flex-col gap-2">
        {navItems.map(({ label, href }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2.5 rounded-btn text-sm transition-all
                ${active
                  ? "font-medium"
                  : "hover:bg-[var(--theme-accent-light)]"
                }`}
              style={
                active
                  ? {
                      backgroundColor: "var(--theme-accent-light)",
                      color: "var(--theme-accent)",
                    }
                  : { color: "var(--theme-text-secondary)" }
              }
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* 主题切换 */}
      <div
        className="mt-auto pt-4"
        style={{ borderTop: "1px solid var(--theme-border)" }}
      >
        <p
          className="text-[9px] tracking-[0.3em] mb-2"
          style={{ color: "var(--theme-text-secondary)", opacity: 0.5 }}
        >
          STYLE
        </p>
        <ThemeSwitcher />
        <div className="mt-4">
          <p
            className="text-xs"
            style={{ color: "var(--theme-text-secondary)", opacity: 0.6 }}
          >
            © 2026 CineVault
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "var(--theme-text-secondary)", opacity: 0.5 }}
          >
            探索电影之美
          </p>
        </div>
      </div>
    </aside>
  );
}
