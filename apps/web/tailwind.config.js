/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111111',
        paper: '#FAF7F2',
        muted: '#6B6B6B',
        border: '#E8E3DC',
        accent: {
          DEFAULT: '#D9A441',
          hover: '#C4932E',
          light: '#F5E6C4',
        },
        success: {
          DEFAULT: '#2E7D32',
          light: '#E8F5E9',
        },
        danger: {
          DEFAULT: '#C62828',
          light: '#FFEBEE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '600' }],
        'heading': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['0.8125rem', { lineHeight: '1.5', fontWeight: '400' }],
        'button': ['0.875rem', { lineHeight: '1', letterSpacing: '0.02em', fontWeight: '500' }],
        'price': ['1.125rem', { lineHeight: '1.3', fontWeight: '600' }],
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
        120: '30rem',
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        soft: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        card: '0 4px 12px rgba(0,0,0,0.05)',
        elevated: '0 8px 30px rgba(0,0,0,0.08)',
        drawer: '0 -4px 30px rgba(0,0,0,0.12)',
      },
      transitionDuration: {
        hover: '150ms',
        page: '250ms',
        drawer: '280ms',
        gallery: '350ms',
      },
      animation: {
        'fade-in': 'fadeIn 250ms ease-out',
        'slide-up': 'slideUp 280ms ease-out',
        'slide-down': 'slideDown 280ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
