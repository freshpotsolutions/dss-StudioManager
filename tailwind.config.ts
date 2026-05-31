import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ['var(--font-jakarta)', "sans-serif"] },
      colors: {
        cream: "#F6F2EA",
        sand: "#EEE7DA",
        ink: "#1C1A17",
        gold: { 50: "#FDF8EC", 100: "#FBEFCF", 200: "#F6DD97", 300: "#F1CB5F", 400: "#EDBB38", 500: "#E0A91F", 600: "#BD8A12" },
        plum: { 50: "#F6F1FB", 100: "#EBDFF6", 500: "#7C3AED", 600: "#6D28D9" },
      },
      boxShadow: {
        soft: "0 4px 20px -6px rgba(28,26,23,0.10)",
        card: "0 2px 14px -4px rgba(28,26,23,0.08)",
      },
      borderRadius: { "4xl": "2rem" },
    },
  },
  plugins: [],
};
export default config;
