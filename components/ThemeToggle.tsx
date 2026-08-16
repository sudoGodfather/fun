"use client";

import { useTheme } from "./Providers";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label="Toggle light and dark theme"
      className="relative w-16 h-9 rounded-full neu-inset flex items-center px-1 transition-colors"
    >
      <span
        className={`h-7 w-7 rounded-full glass-strong flex items-center justify-center text-sm transition-transform duration-300 ${
          isDark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {isDark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
