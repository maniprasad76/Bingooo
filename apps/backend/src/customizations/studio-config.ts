import { BadRequestException } from '@nestjs/common';

/**
 * Custom studio catalogue (garments, colours, sizes, prices, photos).
 *
 * Everything comes from the admin panel; there are no built-in garments or
 * bundled mockup images. normalizeStudioConfig() is the single gate for this
 * data: strict mode (admin saves) rejects bad input with a clear message,
 * lenient mode (reads of stored data) drops what can't be used.
 */

export type GarmentStyle = 'tshirt' | 'polo' | 'hoodie';
const STYLES: GarmentStyle[] = ['tshirt', 'polo', 'hoodie'];

const MAX_GARMENTS = 12;
const MAX_COLORS = 24;
const MAX_SIZES = 20;
const MEASUREMENT_FIELDS = ['chest', 'length', 'shoulder', 'sleeve', 'height'] as const;

export interface StudioColor {
  id: string;
  name: string;
  hex: string;
  textContrast: '#FFFFFF' | '#171717';
  frontImageUrl: string;
  backImageUrl: string;
  isActive: boolean;
}

export interface StudioGarment {
  id: string;
  name: string;
  shortName: string;
  style: GarmentStyle;
  description: string;
  price: number;
  compareAtPrice: number | null;
  isActive: boolean;
  sizes: string[];
  activeSizes: string[];
  sizeMeasurements: { in: Record<string, string>[]; cm: Record<string, string>[] };
  colors: StudioColor[];
}

export interface StudioConfig {
  garments: StudioGarment[];
  updatedAt: string | null;
}

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

function uniqueId(base: string, taken: Set<string>, fallback: string): string {
  const root = slugify(base) || fallback;
  let id = root;
  for (let n = 2; taken.has(id); n++) id = `${root}-${n}`;
  taken.add(id);
  return id;
}

/** Readable ink colour on top of a garment colour. */
export function contrastFor(hex: string): '#FFFFFF' | '#171717' {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 140 ? '#171717' : '#FFFFFF';
}

/**
 * Accepts uploaded photo URLs only: https anywhere, plain http just for local
 * development uploads. The old bundled /custom/*.png mockups were removed, so
 * those paths are dropped.
 */
export function cleanImageUrl(value: unknown): { url: string; rejected: boolean } {
  const raw = text(value, 2048);
  if (!raw || raw.startsWith('/custom/')) return { url: '', rejected: false };
  if (raw.startsWith('/api/')) return { url: raw, rejected: false };
  try {
    const url = new URL(raw);
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (url.protocol === 'https:' || (url.protocol === 'http:' && local)) return { url: url.toString(), rejected: false };
  } catch {
    /* not a URL */
  }
  return { url: '', rejected: true };
}

function inferStyle(g: any): GarmentStyle {
  if (STYLES.includes(g?.style)) return g.style;
  const hint = `${g?.id || ''} ${g?.name || ''}`.toLowerCase();
  if (hint.includes('hood')) return 'hoodie';
  if (hint.includes('polo')) return 'polo';
  return 'tshirt';
}

const DEFAULT_SHORT_NAMES: Record<string, string> = { oversized: 'OVERSIZED', polo: 'POLO SHIRT', hoodie: 'HOODIE' };

export function normalizeStudioConfig(raw: any, strict: boolean): StudioConfig {
  const fail = (message: string): never => {
    throw new BadRequestException({ code: 'INVALID_STUDIO_CONFIG', message });
  };
  const input: any[] = Array.isArray(raw?.garments) ? raw.garments : [];
  if (strict && !Array.isArray(raw?.garments)) fail('garments must be a list.');
  if (strict && input.length > MAX_GARMENTS) fail(`At most ${MAX_GARMENTS} garment types are supported.`);

  const garmentIds = new Set<string>();
  const garments: StudioGarment[] = [];

  for (const [index, g] of input.slice(0, MAX_GARMENTS).entries()) {
    const name = text(g?.name, 80);
    const label = name || `Garment ${index + 1}`;
    if (!name) {
      if (strict) fail(`Garment ${index + 1} needs a name.`);
      continue;
    }

    const price = Math.round(Number(g?.price));
    if (!Number.isFinite(price) || price < 1 || price > 100000) {
      if (strict) fail(`"${label}": price must be between ₹1 and ₹1,00,000.`);
      continue;
    }
    const compareRaw = Math.round(Number(g?.compareAtPrice));
    const compareAtPrice = Number.isFinite(compareRaw) && compareRaw > price ? compareRaw : null;

    // Sizes are free text (S, XL, 38, Free Size...), unique case-insensitively.
    const sizes: string[] = [];
    for (const s of Array.isArray(g?.sizes) ? g.sizes : []) {
      const size = text(s, 12);
      if (size && !sizes.some((x) => x.toLowerCase() === size.toLowerCase())) sizes.push(size);
    }
    if (strict && sizes.length > MAX_SIZES) fail(`"${label}": at most ${MAX_SIZES} sizes.`);
    sizes.splice(MAX_SIZES);
    const activeSizes = (Array.isArray(g?.activeSizes) ? g.activeSizes : sizes)
      .map((s: unknown) => text(s, 12))
      .filter((s: string, i: number, all: string[]) => sizes.includes(s) && all.indexOf(s) === i);

    const measurementRows = (rows: unknown): Record<string, string>[] =>
      (Array.isArray(rows) ? rows : [])
        .filter((r: any) => sizes.includes(text(r?.size, 12)))
        .map((r: any) => {
          const row: Record<string, string> = { size: text(r.size, 12) };
          for (const f of MEASUREMENT_FIELDS) {
            const v = text(r[f], 20);
            if (v) row[f] = v;
          }
          return row;
        });

    const colorIds = new Set<string>();
    const colors: StudioColor[] = [];
    const rawColors: any[] = Array.isArray(g?.colors) ? g.colors : [];
    if (strict && rawColors.length > MAX_COLORS) fail(`"${label}": at most ${MAX_COLORS} colours.`);
    for (const c of rawColors.slice(0, MAX_COLORS)) {
      const colorName = text(c?.name, 40);
      const hexRaw = text(c?.hex, 7);
      const hex = /^#?[0-9a-f]{6}$/i.test(hexRaw) ? `#${hexRaw.replace('#', '').toUpperCase()}` : '';
      if (!colorName || !hex) {
        if (strict) fail(`"${label}": every colour needs a name and a 6-digit hex code (e.g. #171717).`);
        continue;
      }
      const front = cleanImageUrl(c?.frontImageUrl);
      const back = cleanImageUrl(c?.backImageUrl);
      if (strict && (front.rejected || back.rejected)) {
        fail(`"${label}" / ${colorName}: photos must be uploaded images (https links).`);
      }
      const existingId = text(c?.id, 40);
      const id = existingId && /^[a-z0-9-]+$/.test(existingId) && !colorIds.has(existingId)
        ? (colorIds.add(existingId), existingId)
        : uniqueId(colorName, colorIds, 'colour');
      colors.push({
        id,
        name: colorName,
        hex,
        textContrast: c?.textContrast === '#171717' || c?.textContrast === '#FFFFFF' ? c.textContrast : contrastFor(hex),
        frontImageUrl: front.url,
        backImageUrl: back.url,
        isActive: c?.isActive !== false,
      });
    }

    const existingId = text(g?.id, 40);
    const id = existingId && /^[a-z0-9-]+$/.test(existingId) && !garmentIds.has(existingId)
      ? (garmentIds.add(existingId), existingId)
      : uniqueId(name, garmentIds, 'garment');

    garments.push({
      id,
      name,
      shortName: text(g?.shortName, 24) || DEFAULT_SHORT_NAMES[id] || name.toUpperCase().slice(0, 24),
      style: inferStyle(g),
      description: text(g?.description, 200),
      price,
      compareAtPrice,
      isActive: g?.isActive !== false,
      sizes,
      activeSizes,
      sizeMeasurements: { in: measurementRows(g?.sizeMeasurements?.in), cm: measurementRows(g?.sizeMeasurements?.cm) },
      colors,
    });
  }

  return { garments, updatedAt: typeof raw?.updatedAt === 'string' ? raw.updatedAt : null };
}
