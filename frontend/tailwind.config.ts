import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["'Inter Tight'", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#0e1d17",
        paper: "#f3f5f0",
        line: "#e1e6de",
        // Acao principal da marca; neutra em relacao a CLT e PJ.
        mint: { DEFAULT: "#17694a", dark: "#0f4f37", soft: "#e5f1e9" },
        // Superficies escuras de destaque (hero, CTA final, painel do login).
        forest: { DEFAULT: "#103d2c", deep: "#0a281d", light: "#2f7a52" },
        // Unico acento: marca o que importa (numero recomendado, CTA sobre fundo escuro).
        lime: { DEFAULT: "#d4f46a", soft: "#effbc8" },
        // Cada lado da comparacao tem sua cor, usada em badges, barras e veredito.
        clt: { DEFAULT: "#2f5bd3", soft: "#eaf0fd", ink: "#1d3d99" },
        pj: { DEFAULT: "#c46d0d", soft: "#fdf1e0", ink: "#8a4a05" },
        clay: "#c2412d",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(14, 29, 23, 0.04), 0 10px 30px -12px rgba(14, 29, 23, 0.10)",
        lift: "0 2px 6px rgba(14, 29, 23, 0.05), 0 28px 60px -20px rgba(14, 29, 23, 0.22)",
        float: "0 18px 40px -12px rgba(5, 25, 17, 0.35)",
        glow: "0 0 0 1px rgba(212, 244, 106, 0.35), 0 12px 40px -8px rgba(212, 244, 106, 0.45)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "grow-x": { from: { transform: "scaleX(0)" }, to: { transform: "scaleX(1)" } },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.5s ease-out both",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "grow-x": "grow-x 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pop-in": "pop-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
} satisfies Config;
