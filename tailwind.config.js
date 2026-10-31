/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#f8f3ec",
        beige: { DEFAULT: "#efe6d8", deep: "#e1d1bc" },
        sand: "#cdb593",
        terracotta: { DEFAULT: "#a4583c", dark: "#86432b", light: "#d79a7c" },
        ink: { DEFAULT: "#1f1a17", soft: "#4a3f38", muted: "#6b5e55" },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ["Jost", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        logo: ["Federo", "Jost", "sans-serif"],
        script: ["\"Pinyon Script\"", "cursive"],
      },
      letterSpacing: { brand: "0.32em" },
      keyframes: {
        fadeUp: { "0%": { opacity: 0, transform: "translateY(18px)" }, "100%": { opacity: 1, transform: "none" } },
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
      },
      animation: {
        fadeUp: "fadeUp .9s cubic-bezier(.2,.7,.2,1) both",
        fadeIn: "fadeIn .6s ease both",
      },
    },
  },
  plugins: [],
};
