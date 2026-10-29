import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#10201b",
        paper: "#f5f6f2",
        line: "#e3e6df",
        // Acao principal da marca; neutra em relacao a CLT e PJ.
        mint: { DEFAULT: "#16805f", dark: "#0f6249", soft: "#e4f3ec" },
        lime: "#d6f36a",
        // Cada lado da comparacao tem sua cor, usada em badges, barras e veredito.
        clt: { DEFAULT: "#2f5bd3", soft: "#eaf0fd", ink: "#1d3d99" },
        pj: { DEFAULT: "#c46d0d", soft: "#fdf1e0", ink: "#8a4a05" },
        clay: "#c2412d",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 32, 27, 0.04), 0 4px 16px rgba(16, 32, 27, 0.05)",
        lift: "0 2px 4px rgba(16, 32, 27, 0.05), 0 12px 32px rgba(16, 32, 27, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;
