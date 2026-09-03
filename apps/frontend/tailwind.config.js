/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Bingooo Brand Palette (from design.md) ──
        brand: {
          red: '#E6321C',
          'red-deep': '#B91F12',
          'red-light': '#FDF0EE',
        },
        // ── Warm Foundation ──
        warm: {
          cream: '#F7EEDB',
          beige: '#EDE0CC',
          bisque: '#F5ECE1',
          ivory: '#FDF9F4',
          sand: '#EDE0CC',
          footer: '#F7EEDB',
        },
        // ── Neutral System ──
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
        // ── Semantic Surface ──
        surface: '#FFFFFF',
        canvas: '#F7EEDB',
        // ── Status Colors ──
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
        display: ['Outfit', 'Manrope', 'sans-serif'],
        heading: ['Outfit', 'Manrope', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        cursive: ['Satisfy', 'Caveat', 'cursive'],
        script: ['Satisfy', 'Caveat', 'cursive'],
        caveat: ['Caveat', 'cursive'],
      },
      fontSize: {
        'hero': ['3.5rem', { lineHeight: '1.1', fontWeight: '800' }],
        'hero-sm': ['2.5rem', { lineHeight: '1.15', fontWeight: '800' }],
        'page': ['2rem', { lineHeight: '1.2', fontWeight: '700' }],
        'section': ['1.5rem', { lineHeight: '1.3', fontWeight: '700' }],
        'section-sm': ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['0.8125rem', { lineHeight: '1.5', fontWeight: '500' }],
        'label': ['0.875rem', { lineHeight: '1', fontWeight: '500' }],
        'button': ['0.875rem', { lineHeight: '1', fontWeight: '600' }],
        'price': ['1.125rem', { lineHeight: '1.3', fontWeight: '700' }],
        'price-lg': ['1.5rem', { lineHeight: '1.2', fontWeight: '700' }],
      },
      boxShadow: {
        '2xs': '0 1px 1px rgba(0,0,0,0.03)',
        'xs': '0 1px 2px rgba(0,0,0,0.05)',
        'soft': '0 1px 3px rgba(0,0,0,0.04)',
        'card': '0 2px 8px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.1)',
        'elevated': '0 8px 24px rgba(0,0,0,0.08)',
        'drawer': '0 -4px 24px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        'card': '0.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        'page': '1280px',
        'wide': '1440px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
