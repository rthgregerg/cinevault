import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 语义色板 — 全部映射到主题变量，切换主题时自动换肤
        bg: {
          DEFAULT: "rgb(var(--theme-bg-rgb) / <alpha-value>)",
          card: "rgb(var(--theme-card-rgb) / <alpha-value>)",
          elevated: "rgb(var(--theme-surface-rgb) / <alpha-value>)",
        },
        gold: {
          DEFAULT: "rgb(var(--theme-accent-rgb) / <alpha-value>)",
          light: "rgb(var(--theme-accent-rgb) / 0.85)",
          dark: "rgb(var(--theme-accent-rgb) / 0.7)",
        },
        text: {
          primary: "rgb(var(--theme-text-rgb) / <alpha-value>)",
          secondary: "rgb(var(--theme-text-secondary-rgb) / <alpha-value>)",
          muted: "rgb(var(--theme-text-muted-rgb) / <alpha-value>)",
        },
        // 动态主题色 — 直接使用 CSS 变量（含透明度）
        theme: {
          bg: "var(--theme-bg)",
          surface: "var(--theme-surface)",
          card: "var(--theme-card)",
          text: "var(--theme-text)",
          "text-secondary": "var(--theme-text-secondary)",
          "text-muted": "var(--theme-text-muted)",
          accent: "var(--theme-accent)",
          "accent-light": "var(--theme-accent-light)",
          border: "var(--theme-border)",
          hero: "var(--theme-hero)",
        },
      },
      fontFamily: {
        serif: ["Noto Serif SC", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Geist", "Inter", "sans-serif"],
      },
      borderRadius: {
        card: "8px",
        btn: "4px",
      },
      spacing: {
        section: "48px",
        "section-lg": "64px",
      },
      transitionDuration: {
        DEFAULT: "300ms",
      },
      maxWidth: {
        content: "1280px",
      },
    },
  },
  plugins: [],
};
export default config;