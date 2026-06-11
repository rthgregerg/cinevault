"use client";
import { useState } from "react";

export interface SoundScene {
  id: string;
  label: string;
  emoji: string;
  neteaseId: string;
}

const SOUND_SCENES: SoundScene[] = [
  { id: "jazz", label: "爵士", emoji: "🎷", neteaseId: "7138395288" },
  { id: "piano", label: "钢琴", emoji: "🎹", neteaseId: "5156234253" },
  { id: "rain", label: "雨声", emoji: "🌧", neteaseId: "4934514985" },
  { id: "ocean", label: "海浪", emoji: "🌊", neteaseId: "4993526879" },
  { id: "forest", label: "森林", emoji: "🌿", neteaseId: "4951122676" },
  { id: "cafe", label: "咖啡馆", emoji: "☕", neteaseId: "5086114461" },
];

export default function NeteasePlayer() {
  const [scene, setScene] = useState<SoundScene>(SOUND_SCENES[0]);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 音景选择面板 */}
      {showMenu && (
        <div className="flex flex-wrap justify-center gap-1 px-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {SOUND_SCENES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setScene(s);
                setShowMenu(false);
              }}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-[10px] transition-all duration-300"
              style={{
                background:
                  scene.id === s.id
                    ? "var(--theme-accent-light)"
                    : "transparent",
                color:
                  scene.id === s.id
                    ? "var(--theme-text)"
                    : "var(--theme-text-secondary)",
              }}
            >
              <span className="text-base">{s.emoji}</span>
              <span className="tracking-widest whitespace-nowrap">{s.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* 底部控制 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs tracking-widest transition-all duration-300"
          style={{
            background: "var(--theme-card)",
            border: "1px solid var(--theme-border)",
            color: "var(--theme-text-secondary)",
          }}
        >
          <span>{scene.emoji}</span>
          <span>{scene.label}</span>
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform duration-300 ${
              showMenu ? "rotate-180" : ""
            }`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        <a
          href={`https://music.163.com/#/playlist?id=${scene.neteaseId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[10px] tracking-widest transition-all duration-300 hover:opacity-70"
          style={{
            background: "var(--theme-accent-light)",
            color: "var(--theme-text-secondary)",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" opacity="0.6">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.6 17.6c-.2.4-.7.5-1.1.3-3-1.8-6.8-2.2-11.2-1.2-.4.1-.8-.2-.9-.6-.1-.4.2-.8.6-.9 4.8-1.1 8.9-.6 12.4 1.4.4.2.5.7.2 1zm1.5-3.4c-.3.5-.9.6-1.4.4-3.4-2.1-8.6-2.7-12.7-1.5-.5.1-1-.1-1.2-.6-.1-.5.1-1 .6-1.2 4.7-1.4 10.5-.7 14.5 1.8.5.3.7.8.2 1.1z" />
          </svg>
          <span>网易云</span>
        </a>
      </div>
    </div>
  );
}

export { SOUND_SCENES };
