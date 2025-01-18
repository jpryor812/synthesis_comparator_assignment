import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        'flash-green': {
          '0%, 100%': { filter: 'brightness(100%)' },
          '25%': { filter: 'brightness(150%) hue-rotate(-20deg)' }
        },
        'flash-yellow': {
          '0%, 100%': { filter: 'brightness(100%)' },
          '25%': { filter: 'brightness(150%) hue-rotate(90deg)' }
        }
      },
      animation: {
        'flash-green': 'flash-green 1s ease-in-out',
        'flash-yellow': 'flash-yellow 1s ease-in-out'
      }
    }
  },
  plugins: [],
} satisfies Config;
