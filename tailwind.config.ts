import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // WEPOWER Brand Colors - Simple & Clean
        red: '#FF0000',        // Đỏ tươi
        yellow: '#FFD700',     // Vàng tươi
        black: '#000000',      // Đen
        white: '#FFFFFF',      // Trắng
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 30px rgba(255, 0, 0, 0.2)',
        'glow-red': '0 0 30px rgba(255, 0, 0, 0.4)',
        'glow-yellow': '0 0 30px rgba(255, 215, 0, 0.4)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
