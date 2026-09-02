/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#090A0C',
        carbon: '#121318',
        steel: '#1E2028',
        surface: '#232630',
        paper: '#F8F6F0',
        canvas: '#FAF8F5',
        muted: '#717582',
        border: '#E6E1D8',
        'border-dark': '#2B2D38',
        brand: {
          red: '#FE260A',
          'red-hover': '#E02008',
          'red-light': '#FFEBE8',
          'red-glow': 'rgba(254, 38, 10, 0.4)',
        },
        accent: {
          DEFAULT: '#FE260A',
          hover: '#E02008',
          light: '#FFEBE8',
          gold: '#D4AF37',
          lime: '#D8FF00',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#ECFDF5',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEF2F2',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Syne', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"Space Grotesk"', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '800' }],
        'display-xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-lg': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
        'heading': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.015em', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['0.8125rem', { lineHeight: '1.5', fontWeight: '500' }],
        'button': ['0.875rem', { lineHeight: '1', letterSpacing: '0.03em', fontWeight: '600' }],
        'price': ['1.125rem', { lineHeight: '1.3', fontWeight: '700' }],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)',
        card: '0 8px 30px rgba(0,0,0,0.06)',
        'card-hover': '0 20px 40px rgba(0,0,0,0.12)',
        elevated: '0 16px 50px rgba(0,0,0,0.1)',
        glow: '0 0 30px rgba(254, 38, 10, 0.35)',
        'glow-subtle': '0 0 20px rgba(254, 38, 10, 0.15)',
        drawer: '0 -10px 40px rgba(0,0,0,0.2)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        'marquee-slow': 'marquee 40s linear infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        float: 'float 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
