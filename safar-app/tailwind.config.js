/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './lib/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],

  theme: {
    extend: {
      /**
       * Divine Geometry Color Palette
       * Source: prototype/prototype.jsx
       * SYNC NOTE: Keep in sync with constants/colors.ts
       */
      colors: {
        'emerald-deep': '#0f2e28',
        midnight: '#0a1f1b',
        parchment: '#f4f1ea',
        gold: '#cfaa6b',
        cream: '#e8dcc5',
      },

      /**
       * Typography
       * Fonts loaded via expo-font in _layout.tsx
       */
      fontFamily: {
        amiri: ['Amiri', 'serif'],
        fraunces: ['Fraunces', 'serif'],
        outfit: ['Outfit', 'sans-serif'],
      },

      /**
       * Custom animations from prototype
       */
      animation: {
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'pulse-slow': 'pulseSlow 4s infinite ease-in-out',
      },

      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '0.1', transform: 'scale(1)' },
          '50%': { opacity: '0.3', transform: 'scale(1.1)' },
        },
      },
    },
  },

  plugins: [],
};
