import { HERO_SIZES, HERO_WIDTHS } from './hero-image.mjs';

/**
 * Optimised copies of the site's photos, artwork and icons.
 *
 * Files live in public/img/v1/ as `<name>-<width>.<avif|webp>` and never
 * change (Vercel serves that folder with a one-year immutable cache), so to
 * replace an image add the new files under a new folder (img/v2/) instead of
 * overwriting. scripts/optimize-images.mjs builds them; its list of names and
 * widths must match this file. `fallback` is for browsers without AVIF/WebP support.
 */
export interface ImageAsset {
  base: string;
  /** Available widths in px, ascending. */
  widths: number[];
  /** Preferred formats, best first. */
  formats: ('avif' | 'webp')[];
  fallback: string;
  /** Intrinsic size of the largest width; reserves the right aspect ratio before load. */
  width: number;
  height: number;
}

const photo = (name: string, widths: number[], height: number, fallback = `/${name}.jpg`): ImageAsset => ({
  base: `/img/v1/${name}`,
  widths,
  formats: ['avif', 'webp'],
  fallback,
  width: widths[widths.length - 1],
  height,
});

const icon = (name: string): ImageAsset => ({
  base: `/img/v1/${name}`,
  widths: [96],
  formats: ['webp'],
  fallback: `/img/v1/${name}-96.png`,
  width: 96,
  height: 96,
});

export const IMAGES = {
  /** Homepage campaign photo, greyscale baked in. */
  hero: photo('hero', HERO_WIDTHS, 2880, '/img/v1/hero-960.jpg'),
  realFit1: photo('real-fit-1', [360, 720, 853], 1024),
  realFit2: photo('real-fit-2', [360, 720, 853], 1024),
  realFit3: photo('real-fit-3', [360, 720, 1024], 682),
  realFit4: photo('real-fit-4', [360, 720, 1024], 935),
  realFit5: photo('real-fit-5', [360, 682], 1024),
  realFit6: photo('real-fit-6', [360, 682], 1024),
  aboutAtelier: photo('about-atelier', [640, 1024], 682),
  customStudio: photo('custom-studio', [640, 1024], 682),
  privacyHero: photo('privacy-hero', [640, 1024], 576),
  termsHero: photo('terms-hero', [480, 682], 1024),
  /** Policy page banners, greyscale baked in. */
  returns: photo('returns', [640, 1024, 1600], 1067, '/img/v1/returns-1024.jpg'),
  shipping: photo('shipping', [640, 1024, 1600], 1067, '/img/v1/shipping-1024.jpg'),
  sizeGuide: photo('size-guide', [640, 1024, 1600], 2400, '/img/v1/size-guide-1024.jpg'),
  menCategory: photo('men-category', [128, 260], 260),
  womenCategory: photo('women-category', [128, 260], 260),
  emptyWishlistArt: photo('empty-wishlist-art', [512, 1024], 682, '/empty-wishlist-art.png'),
  wishlistBagHeart: photo('wishlist-bag-heart', [510], 305, '/wishlist-bag-heart.png'),
  submark: photo('submark', [128, 256], 256, '/img/v1/submark-256.png'),
  phonepe: icon('phonepe'),
  gpay: icon('gpay'),
  paytm: icon('paytm'),
  upi: icon('upi'),
  whatsapp: icon('whatsapp'),
  instagram: icon('instagram'),
  youtube: icon('youtube'),
  twitter: icon('twitter'),
} satisfies Record<string, ImageAsset>;

/** `sizes` for IMAGES.hero; the homepage HTML preloads the hero with the same value. */
export { HERO_SIZES };

export function imageSrcSet(image: ImageAsset, format: string): string {
  // A single size gets no width descriptor, so it keeps its natural size like a plain src.
  if (image.widths.length === 1) return `${image.base}-${image.widths[0]}.${format}`;
  return image.widths.map((w) => `${image.base}-${w}.${format} ${w}w`).join(', ');
}
