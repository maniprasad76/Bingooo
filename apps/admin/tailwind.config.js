/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Direct Brand & Luxury Tokens (from Frontend)
        red: {
          DEFAULT: '#e6321c',
          deep: '#b91f12',
          light: '#fdf0ee',
        },
        brand: {
          red: '#E6321C',
          'red-deep': '#B91F12',
          'red-light': '#FDF0EE',
          glow: 'rgba(230, 50, 28, 0.22)',
        },
        ink: '#171717',
        charcoal: '#171717',
        carbon: '#1F1D1B',
        steel: '#2B2825',
        paper: '#F7EEDB',
        cream: '#F7EEDB',
        beige: '#EDE0CC',
        sand: '#EDE0CC',
        bisque: '#F5ECE1',
        ivory: '#FDF9F4',
        canvas: '#F7EEDB',
        muted: '#6F6A63',
        border: {
          DEFAULT: '#DDD3C5',
          light: '#EAE2D5',
          dark: '#2B2D38',
        },
        surface: '#FFFFFF',
        success: { DEFAULT: '#238636', light: '#F0FDF4', border: '#BBF7D0' },
        warning: { DEFAULT: '#B7791F', light: '#FEFCE8', border: '#FEF08A' },
        danger: { DEFAULT: '#C62828', light: '#FEF2F2', border: '#FECACA' },
        info: { DEFAULT: '#2563A6', light: '#EFF6FF', border: '#BFDBFE' },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        display: ['Manrope', 'sans-serif'],
        heading: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        '2xs': '0 1px 2px rgba(23, 23, 23, 0.03)',
        'xs': '0 1px 3px rgba(23, 23, 23, 0.05)',
        'card': '4px 4px 0px #171717',
        'card-hover': '6px 6px 0px #171717',
        'elevated': '8px 8px 0px #171717',
        'bauhaus-xs': '1.5px 1.5px 0px #171717',
        'bauhaus-sm': '2px 2px 0px #171717',
        'bauhaus': '4px 4px 0px #171717',
        'bauhaus-lg': '6px 6px 0px #171717',
        'bauhaus-xl': '8px 8px 0px #171717',
        'bauhaus-red': '4px 4px 0px #E6321C',
        'bauhaus-white': '4px 4px 0px #FFFFFF',
        'glow-red': '0 0 20px rgba(230, 50, 28, 0.25)',
      },
      // Bauhaus corners: everything is square-ish (2px). Only rounded-full
      // (status dots, avatars, toggle switches) stays round.
      borderRadius: {
        'none': '0px',
        'sm': '2px',
        'DEFAULT': '2px',
        'card': '2px',
        'md': '2px',
        'lg': '2px',
        'xl': '2px',
        '2xl': '2px',
        '3xl': '2px',
      },
    },
  },
  plugins: [],
};

