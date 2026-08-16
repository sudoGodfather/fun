import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          light: "#E7EBF3",
          dark: "#14151F",
        },
        surface: {
          light: "#EEF1F8",
          dark: "#1B1D29",
        },
        ink: {
          light: "#2B2E3D",
          dark: "#E7E9F5",
        },
        muted: {
          light: "#6B7186",
          dark: "#8B90A8",
        },
        accent: {
          DEFAULT: "#7C6CF5",
          soft: "#9C90FF",
          teal: "#4FD1C5",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        "neu-light":
          "8px 8px 16px rgba(163,172,196,0.55), -8px -8px 16px rgba(255,255,255,0.85)",
        "neu-light-inset":
          "inset 6px 6px 12px rgba(163,172,196,0.5), inset -6px -6px 12px rgba(255,255,255,0.8)",
        "neu-dark":
          "8px 8px 16px rgba(0,0,0,0.55), -8px -8px 16px rgba(40,43,60,0.5)",
        "neu-dark-inset":
          "inset 6px 6px 12px rgba(0,0,0,0.5), inset -6px -6px 12px rgba(40,43,60,0.45)",
      },
      backdropBlur: {
        glass: "18px",
      },
      borderRadius: {
        xl2: "1.75rem",
      },
    },
  },
  plugins: [],
};
export default config;
