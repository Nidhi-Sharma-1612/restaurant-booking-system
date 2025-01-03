import animatePlugin from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        success: "successFade 2s ease-out",
      },
      keyframes: {
        successFade: {
          "0%": { transform: "scale(0)", opacity: 0 },
          "50%": { transform: "scale(1.2)", opacity: 0.8 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
      },
    },
  },
  plugins: [animatePlugin],
};
