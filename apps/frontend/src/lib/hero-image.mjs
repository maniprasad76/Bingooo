// Homepage hero image (public/img/v1/hero-<width>.<avif|webp>). Shared by the
// app (src/lib/images.ts) and the build-time prerender, which preloads it in the
// homepage HTML so the download starts before the app's JavaScript has run.
// The preload only matches the <img> if both use exactly these values.

export const HERO_WIDTHS = [480, 720, 960, 1280, 1600, 1920];

// The photo is portrait and fills the hero with object-cover: on phones it is
// height-bound and renders slightly wider than the screen.
export const HERO_SIZES = '(min-width: 1280px) 58vw, (min-width: 1024px) 60vw, (min-width: 768px) 64vw, 110vw';
