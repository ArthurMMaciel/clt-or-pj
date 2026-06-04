import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17211f",
        mint: "#2f8f72",
        lime: "#d6f36a",
        paper: "#f7f5ef",
        clay: "#c46a4a",
      },
    },
  },
  plugins: [],
} satisfies Config;
