import type { Config } from "tailwindcss";

// Direcao "livro-caixa": precisao e calma. Filetes no lugar de sombras, raios pequenos,
// serifa editorial nos titulos e numeros tabulares. Ver docs/product-evolution/DESIGN_SYSTEM.md.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        // Titulos (h1, h2) e numeros de destaque. Serifa transmite "documento" e diferencia de SaaS generico.
        display: ["'Source Serif 4'", "Georgia", "ui-serif", "serif"],
      },
      colors: {
        ink: "#0e1d17",
        // Texto secundario (contraste ~7:1 no branco) e terciario (~4.8:1, minimo para texto pequeno).
        muted: "#45524b",
        subtle: "#5f6b65",
        paper: "#f4f5f1",
        line: "#dfe3dc",
        // Acao principal da marca; neutra em relacao a CLT e PJ.
        mint: { DEFAULT: "#17694a", dark: "#0f4f37", soft: "#e5f1e9" },
        // Superficies escuras de destaque (hero, CTA final, painel do login).
        forest: { DEFAULT: "#103d2c", deep: "#0a281d", light: "#2f7a52" },
        // Acento usado com parcimonia: so sobre fundo forest (numero recomendado, CTA do hero).
        lime: { DEFAULT: "#d4f46a", soft: "#effbc8" },
        // Cada lado da comparacao tem sua cor, usada em badges, barras e veredito.
        clt: { DEFAULT: "#2f5bd3", soft: "#eaf0fd", ink: "#1d3d99" },
        pj: { DEFAULT: "#c46d0d", soft: "#fdf1e0", ink: "#8a4a05" },
        clay: "#b8381f",
      },
      boxShadow: {
        // Uma unica elevacao, para o que flutua de verdade (gaveta, painel fixo no celular).
        card: "0 1px 2px rgba(14, 29, 23, 0.05)",
        overlay: "0 12px 32px -8px rgba(14, 29, 23, 0.25)",
      },
      transitionDuration: {
        fast: "120ms",
        base: "200ms",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "grow-x": { from: { transform: "scaleX(0)" }, to: { transform: "scaleX(1)" } },
        "drawer-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%, 75%": { transform: "translateX(-4px)" },
          "50%": { transform: "translateX(4px)" },
        },
      },
      animation: {
        // Resultado novo: entra rapido, sem atrasar a leitura.
        "fade-up": "fade-up 0.24s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.2s ease-out both",
        // Barras do pacote anual: mostram a proporcao entre CLT e PJ.
        "grow-x": "grow-x 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        shake: "shake 0.3s ease-in-out",
        "drawer-in": "drawer-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [],
} satisfies Config;
