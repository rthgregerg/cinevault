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
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-56 bg-bg/80 backdrop-blur-lg border-r border-white/5 px-6 py-8 z-40">
      <Link href="/" className="mb-12">
        <h1 className="text-xl font-display font-semibold text-gold tracking-wider">
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
                  ? "bg-gold/10 text-gold font-medium"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
                }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* 主题切换 */}
      <div className="mt-auto pt-4 border-t border-white/5">
        <p className="text-[9px] tracking-[0.3em] text-text-muted mb-2 opacity-50">STYLE</p>
        <ThemeSwitcher />
        <div className="mt-4">
          <p className="text-text-muted text-xs">© 2026 CineVault</p>
          <p className="text-text-muted text-xs mt-1">探索电影之美</p>
        </div>
      </div>
    </aside>
  );
}
