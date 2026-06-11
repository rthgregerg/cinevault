import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0a0a",
          card: "#141414",
          elevated: "#1a1a1a",
        },
        gold: {
          DEFAULT: "#c8a951",
          light: "#d4b85e",
          dark: "#a88a3a",
        },
        text: {
          primary: "#ffffff",
          secondary: "#9ca3af",
          muted: "#6b7280",
        },
        // 动态主题色 — 通过 CSS 变量切换
        theme: {
          bg: "var(--theme-bg)",
          surface: "var(--theme-surface)",
          card: "var(--theme-card)",
          text: "var(--theme-text)",
          "text-secondary": "var(--theme-text-secondary)",
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
