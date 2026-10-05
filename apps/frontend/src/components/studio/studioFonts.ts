/**
 * Curated display fonts for the design studio.
 *
 * These are only needed on the customizer, so they are loaded from a
 * stylesheet injected when the studio mounts instead of the global CSS —
 * every other page keeps loading just Manrope and IBM Plex Mono.
 *
 * Saved designs and share links store the font `id`, so ids must never change.
 */

export type FontCategory = 'street' | 'luxury' | 'creative' | 'script' | 'gothic';

export interface FontOption {
  id: string;
  name: string;
  label: string;
  family: string;
  category: FontCategory;
  preview: string;
  /** Google Fonts css2 `family=` spec; omitted for fonts the app already loads globally. */
  google?: string;
}

export const FONT_CATEGORIES: { id: 'all' | FontCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'street', label: 'Street' },
  { id: 'luxury', label: 'Luxury' },
  { id: 'creative', label: 'Creative' },
  { id: 'script', label: 'Script' },
  { id: 'gothic', label: 'Gothic' },
];

export const FONT_OPTIONS: FontOption[] = [
  // Street
  { id: 'manrope', name: 'Manrope', label: 'Clean Modern', family: "'Manrope', sans-serif", category: 'street', preview: 'BINGOOO' },
  { id: 'outfit', name: 'Outfit', label: 'High-End Street', family: "'Outfit', sans-serif", category: 'street', preview: 'STREET', google: 'Outfit:wght@600;800' },
  { id: 'anton', name: 'Anton', label: 'Ultra Heavy', family: "'Anton', sans-serif", category: 'street', preview: 'HEAVY', google: 'Anton' },
  { id: 'bebas', name: 'Bebas Neue', label: 'Bold Headline', family: "'Bebas Neue', sans-serif", category: 'street', preview: 'HEADLINE', google: 'Bebas+Neue' },
  { id: 'archivo', name: 'Archivo Black', label: 'Poster Block', family: "'Archivo Black', sans-serif", category: 'street', preview: 'POSTER', google: 'Archivo+Black' },
  { id: 'oswald', name: 'Oswald', label: 'Condensed Sport', family: "'Oswald', sans-serif", category: 'street', preview: 'ATHLETIC', google: 'Oswald:wght@500;700' },
  { id: 'teko', name: 'Teko', label: 'Jersey Numeral', family: "'Teko', sans-serif", category: 'street', preview: 'NO. 23', google: 'Teko:wght@500;600' },
  { id: 'staatliches', name: 'Staatliches', label: 'Stencil Crate', family: "'Staatliches', sans-serif", category: 'street', preview: 'CARGO', google: 'Staatliches' },
  { id: 'blackops', name: 'Black Ops One', label: 'Military Stencil', family: "'Black Ops One', sans-serif", category: 'street', preview: 'SQUAD', google: 'Black+Ops+One' },
  { id: 'rubikmono', name: 'Rubik Mono One', label: 'Wide Block', family: "'Rubik Mono One', sans-serif", category: 'street', preview: 'WIDE', google: 'Rubik+Mono+One' },
  { id: 'space', name: 'Space Grotesk', label: 'Brutalist Tech', family: "'Space Grotesk', sans-serif", category: 'street', preview: 'BRUTAL', google: 'Space+Grotesk:wght@600;700' },
  { id: 'russo', name: 'Russo One', label: 'Impact Block', family: "'Russo One', sans-serif", category: 'street', preview: 'IMPACT', google: 'Russo+One' },
  { id: 'bungee', name: 'Bungee', label: 'Cyber Arcade', family: "'Bungee', cursive", category: 'street', preview: 'ARCADE', google: 'Bungee' },

  // Luxury
  { id: 'playfair', name: 'Playfair', label: 'Vogue Editorial', family: "'Playfair Display', serif", category: 'luxury', preview: 'Atelier', google: 'Playfair+Display:ital,wght@0,700;1,700' },
  { id: 'bodoni', name: 'Bodoni Moda', label: 'Fashion Didone', family: "'Bodoni Moda', serif", category: 'luxury', preview: 'Maison', google: 'Bodoni+Moda:ital,wght@0,700;1,700' },
  { id: 'dmserif', name: 'DM Serif Display', label: 'Magazine Cover', family: "'DM Serif Display', serif", category: 'luxury', preview: 'Cover Story', google: 'DM+Serif+Display:ital@0;1' },
  { id: 'abril', name: 'Abril Fatface', label: 'Fat Didone', family: "'Abril Fatface', serif", category: 'luxury', preview: 'Grand', google: 'Abril+Fatface' },
  { id: 'cinzel', name: 'Cinzel', label: 'Royal Roman', family: "'Cinzel', serif", category: 'luxury', preview: 'IMPERIAL', google: 'Cinzel:wght@700;900' },
  { id: 'cinzeldeco', name: 'Cinzel Decorative', label: 'Crest Engraved', family: "'Cinzel Decorative', serif", category: 'luxury', preview: 'Heritage', google: 'Cinzel+Decorative:wght@700' },
  { id: 'prata', name: 'Prata', label: 'Haute Couture', family: "'Prata', serif", category: 'luxury', preview: 'Elegance', google: 'Prata' },
  { id: 'cormorant', name: 'Cormorant', label: 'Archival Serif', family: "'Cormorant Garamond', serif", category: 'luxury', preview: 'Archival', google: 'Cormorant+Garamond:ital,wght@0,700;1,700' },
  { id: 'marcellus', name: 'Marcellus', label: 'Gallery Inscription', family: "'Marcellus', serif", category: 'luxury', preview: 'GALLERY', google: 'Marcellus' },
  { id: 'italiana', name: 'Italiana', label: 'Runway Thin', family: "'Italiana', serif", category: 'luxury', preview: 'RUNWAY', google: 'Italiana' },
  { id: 'syne', name: 'Syne', label: 'Avant-Garde', family: "'Syne', sans-serif", category: 'luxury', preview: 'AVANT', google: 'Syne:wght@700;800' },

  // Creative
  { id: 'marker', name: 'Permanent Marker', label: 'Graffiti Tag', family: "'Permanent Marker', cursive", category: 'creative', preview: 'GRAFFITI', google: 'Permanent+Marker' },
  { id: 'righteous', name: 'Righteous', label: 'Retro 80s', family: "'Righteous', cursive", category: 'creative', preview: 'SYNTHWAVE', google: 'Righteous' },
  { id: 'monoton', name: 'Monoton', label: 'Neon Sign', family: "'Monoton', cursive", category: 'creative', preview: 'NEON', google: 'Monoton' },
  { id: 'bungeeshade', name: 'Bungee Shade', label: '3D Shadow', family: "'Bungee Shade', cursive", category: 'creative', preview: 'DEPTH', google: 'Bungee+Shade' },
  { id: 'pressstart', name: 'Press Start 2P', label: '8-Bit Pixel', family: "'Press Start 2P', monospace", category: 'creative', preview: 'LVL UP', google: 'Press+Start+2P' },
  { id: 'rubikglitch', name: 'Rubik Glitch', label: 'Glitch Distort', family: "'Rubik Glitch', sans-serif", category: 'creative', preview: 'GLITCH', google: 'Rubik+Glitch' },
  { id: 'orbitron', name: 'Orbitron', label: 'Sci-Fi Future', family: "'Orbitron', sans-serif", category: 'creative', preview: 'ORBIT', google: 'Orbitron:wght@700;900' },
  { id: 'audiowide', name: 'Audiowide', label: 'Racing Wide', family: "'Audiowide', cursive", category: 'creative', preview: 'TURBO', google: 'Audiowide' },
  { id: 'shrikhand', name: 'Shrikhand', label: 'Retro Bubble', family: "'Shrikhand', cursive", category: 'creative', preview: 'Groovy', google: 'Shrikhand' },
  { id: 'mono', name: 'IBM Plex Mono', label: 'Technical Spec', family: "'IBM Plex Mono', monospace", category: 'creative', preview: '240_GSM' },
  { id: 'majormono', name: 'Major Mono', label: 'Glitch Mono', family: "'Major Mono Display', monospace", category: 'creative', preview: '001//BIO', google: 'Major+Mono+Display' },

  // Script
  { id: 'caveat', name: 'Caveat', label: 'Artisan Script', family: "'Caveat', cursive", category: 'script', preview: 'Handwritten', google: 'Caveat:wght@600;700' },
  { id: 'pacifico', name: 'Pacifico', label: 'Surf Club', family: "'Pacifico', cursive", category: 'script', preview: 'Summer', google: 'Pacifico' },
  { id: 'lobster', name: 'Lobster', label: 'Vintage Diner', family: "'Lobster', cursive", category: 'script', preview: 'Classic', google: 'Lobster' },
  { id: 'yellowtail', name: 'Yellowtail', label: 'Varsity Script', family: "'Yellowtail', cursive", category: 'script', preview: 'Team', google: 'Yellowtail' },
  { id: 'kaushan', name: 'Kaushan Script', label: 'Brush Stroke', family: "'Kaushan Script', cursive", category: 'script', preview: 'Hustle', google: 'Kaushan+Script' },
  { id: 'dancing', name: 'Dancing Script', label: 'Signature', family: "'Dancing Script', cursive", category: 'script', preview: 'Signature', google: 'Dancing+Script:wght@700' },
  { id: 'satisfy', name: 'Satisfy', label: 'Casual Cursive', family: "'Satisfy', cursive", category: 'script', preview: 'Weekend', google: 'Satisfy' },
  { id: 'greatvibes', name: 'Great Vibes', label: 'Elegant Calligraphy', family: "'Great Vibes', cursive", category: 'script', preview: 'Forever', google: 'Great+Vibes' },

  // Gothic
  { id: 'unifraktur', name: 'UnifrakturMaguntia', label: 'Old English', family: "'UnifrakturMaguntia', cursive", category: 'gothic', preview: 'Gothic', google: 'UnifrakturMaguntia' },
  { id: 'pirata', name: 'Pirata One', label: 'Street Blackletter', family: "'Pirata One', cursive", category: 'gothic', preview: 'Barrio', google: 'Pirata+One' },
  { id: 'grenze', name: 'Grenze Gotisch', label: 'Modern Fraktur', family: "'Grenze Gotisch', cursive", category: 'gothic', preview: 'Kingdom', google: 'Grenze+Gotisch:wght@700' },
  { id: 'newrocker', name: 'New Rocker', label: 'Rock Tee', family: "'New Rocker', cursive", category: 'gothic', preview: 'Tour', google: 'New+Rocker' },
  { id: 'metalmania', name: 'Metal Mania', label: 'Heavy Metal', family: "'Metal Mania', cursive", category: 'gothic', preview: 'METAL', google: 'Metal+Mania' },
];

const STUDIO_FONTS_LINK_ID = 'bingooo-studio-fonts';

const STUDIO_FONTS_HREF =
  'https://fonts.googleapis.com/css2?' +
  FONT_OPTIONS.filter((f) => f.google)
    .map((f) => `family=${f.google}`)
    .join('&') +
  '&display=swap';

/** Adds the studio font stylesheet to the page once; safe to call repeatedly. */
export function ensureStudioFonts(): void {
  if (typeof document === 'undefined' || document.getElementById(STUDIO_FONTS_LINK_ID)) return;
  const link = document.createElement('link');
  link.id = STUDIO_FONTS_LINK_ID;
  link.rel = 'stylesheet';
  link.href = STUDIO_FONTS_HREF;
  document.head.appendChild(link);
}

/**
 * Resolves once the font in a canvas `ctx.font` string is ready to draw.
 * Canvas text never re-renders on its own when a web font arrives, so callers
 * draw again after this resolves. Never rejects.
 */
export function loadCanvasFont(font: string): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts?.load) return Promise.resolve();
  return document.fonts.load(font).then(
    () => undefined,
    () => undefined,
  );
}
