/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E6321C',
          'red-deep': '#B91F12',
          'red-light': '#FDF0EE',
        },
        ink: '#171717',
        paper: '#F7EEDB',
        cream: '#F7EEDB',
        beige: '#EDE0CC',
        muted: '#6F6A63',
        border: '#DDD3C5',
        surface: '#FFFFFF',
        success: { DEFAULT: '#238636', light: '#F0FDF4' },
        warning: { DEFAULT: '#B7791F', light: '#FEFCE8' },
        danger: { DEFAULT: '#C62828', light: '#FEF2F2' },
        info: { DEFAULT: '#2563A6', light: '#EFF6FF' },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0,0,0,0.05)',
        'card': '0 2px 8px rgba(0,0,0,0.06)',
        'elevated': '0 8px 24px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        'card': '0.5rem',
      },
    },
  },
  plugins: [],
};
