/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Bingooo Brand Palette
        brand: {
          red: '#E6321C',
          'red-deep': '#B91F12',
          'red-light': '#FDF0EE',
        },
        // Warm Foundation
        warm: {
          cream: '#F7EEDB',
          beige: '#EDE0CC',
          bisque: '#F5ECE1',
          ivory: '#FDF9F4',
          sand: '#EDE0CC',
        },
        // Neutral System
        charcoal: '#171717',
        dark: '#171717',
        white: '#FFFFFF',
        muted: '#6F6A63',
        border: '#DDD3C5',
        ink: '#171717',
        paper: '#F7EEDB',
        accent: {
          DEFAULT: '#E6321C',
          dark: '#B91F12',
          hover: '#B91F12',
          light: '#FDF0EE',
        },
        surface: '#FFFFFF',
        canvas: '#F7EEDB',
        // Status Colors
        success: {
          DEFAULT: '#238636',
          light: '#F0FDF4',
        },
        warning: {
          DEFAULT: '#B7791F',
          light: '#FEFCE8',
        },
        danger: {
          DEFAULT: '#C62828',
          light: '#FEF2F2',
        },
        info: {
          DEFAULT: '#2563A6',
          light: '#EFF6FF',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        '2xs': '0 1px 1px rgba(0,0,0,0.03)',
        xs: '0 1px 2px rgba(0,0,0,0.05)',
        soft: '0 1px 3px rgba(0,0,0,0.04)',
        card: '0 2px 8px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.1)',
        elevated: '0 8px 24px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
