"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const TIMER_PRESETS = [
  { label: "25分钟", minutes: 25 },
  { label: "45分钟", minutes: 45 },
  { label: "60分钟", minutes: 60 },
];

/** Web Audio API 计时结束提示音 — 三声叮叮叮 */
function playAlarm() {
  try {
    const ctx = new AudioContext();
    [0, 200, 400].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = 880 + i * 220;
      gain.gain.value = 0.3;
      osc.start(ctx.currentTime + delay / 1000);
      osc.stop(ctx.currentTime + delay / 1000 + 0.3);
    });
  } catch {
    // AudioContext not available (e.g., SSR)
  }
}

interface FocusTimerProps {
  isRunning: boolean;
  onToggle: () => void;
  onComplete: () => void;
}

export default function FocusTimer({ isRunning, onToggle, onComplete }: FocusTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [preset, setPreset] = useState(25);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const alarmRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            onComplete();
            playAlarm();
            // 每3秒重复提醒直到用户手动停止
            alarmRef.current = window.setInterval(playAlarm, 3000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, remaining, onComplete]);

  // 用户点击按钮后停止重复提醒
  const handleToggle = useCallback(() => {
    if (alarmRef.current) {
      clearInterval(alarmRef.current);
      alarmRef.current = null;
    }
    onToggle();
  }, [onToggle]);

  const setPresetMinutes = (min: number) => {
    setPreset(min);
    setTotalSeconds(min * 60);
    setRemaining(min * 60);
  };

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = totalSeconds > 0 ? remaining / totalSeconds : 0;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 预设选择 */}
      {!isRunning && (
        <div className="flex gap-2">
          {TIMER_PRESETS.map((p) => (
            <button
              key={p.minutes}
              onClick={() => setPresetMinutes(p.minutes)}
              className="px-3 py-1 text-[10px] tracking-widest rounded-full border transition-all"
              style={{
                borderColor: preset === p.minutes ? "var(--theme-accent)" : "var(--theme-border)",
                color: preset === p.minutes ? "var(--theme-accent)" : "var(--theme-text-secondary)",
                background: preset === p.minutes ? "var(--theme-accent-light)" : "transparent",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* 环形进度 */}
      <div className="relative w-20 h-20 md:w-24 md:h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="var(--theme-border)" strokeWidth="3" />
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="var(--theme-accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${progress * 276} 276`}
            style={{ transition: "stroke-dasharray 1s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg md:text-xl font-mono tracking-wider" style={{ color: "var(--theme-text)" }}>
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* 开始/暂停 */}
      <button
        onClick={handleToggle}
        className="px-5 py-1.5 rounded-full text-xs tracking-widest transition-all"
        style={{
          background: "var(--theme-accent)",
          color: isRunning ? "var(--theme-text)" : "#fff",
          opacity: isRunning ? 0.7 : 1,
        }}
      >
        {isRunning ? "暂停" : remaining === 0 ? "重新开始" : "开始专注"}
      </button>
    </div>
  );
}
