// ─────────────────────────────────────────────────────────
// Bingooo Design Tokens — single source of truth
// Used by Tailwind config, CSS custom properties, and components.
// ─────────────────────────────────────────────────────────

export const tokens = {
  colors: {
    ink: '#111111',
    paper: '#FAF7F2',
    white: '#FFFFFF',
    muted: '#6B6B6B',
    border: '#E8E3DC',
    accent: '#D9A441',
    accentHover: '#C4932E',
    accentLight: '#F5E6C4',
    success: '#2E7D32',
    successLight: '#E8F5E9',
    danger: '#C62828',
    dangerLight: '#FFEBEE',
  },

  fonts: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    display: "'Oswald', 'Barlow Condensed', 'Bebas Neue', sans-serif",
    heading: "'Oswald', 'Barlow Condensed', 'Bebas Neue', sans-serif",
    condensed: "'Barlow Condensed', 'Oswald', sans-serif",
    serif: "'Playfair Display', Georgia, 'Times New Roman', serif",
    cursive: "'Caveat', 'Segoe Script', cursive",
  },

  typography: {
    displayXl: { size: '4rem', lineHeight: '0.94', weight: '800', tracking: '-0.02em' },
    displayLg: { size: '2.5rem', lineHeight: '1.05', weight: '700', tracking: '-0.015em' },
    heading: { size: '1.5rem', lineHeight: '1.15', weight: '700', tracking: '0.02em' },
    body: { size: '1rem', lineHeight: '1.6', weight: '400', tracking: '0' },
    caption: { size: '0.8125rem', lineHeight: '1.5', weight: '500', tracking: '0' },
    button: { size: '0.875rem', lineHeight: '1', weight: '700', tracking: '0.06em' },
    price: { size: '1.125rem', lineHeight: '1.3', weight: '700', tracking: '0' },
  },

  transitions: {
    hover: '150ms ease',
    page: '250ms ease-out',
    drawer: '280ms ease-out',
    gallery: '350ms ease-out',
  },

  shadows: {
    soft: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    card: '0 4px 12px rgba(0,0,0,0.05)',
    elevated: '0 8px 30px rgba(0,0,0,0.08)',
    drawer: '0 -4px 30px rgba(0,0,0,0.12)',
  },

  radii: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
} as const;

export type ThemeTokens = typeof tokens;
