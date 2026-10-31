/** Centre point and width of a print, as percentages of the garment photo. */
export interface PrintSpot {
  x: number;
  y: number;
  w: number;
}

export interface PrintAreas {
  front: PrintSpot;
  chest: PrintSpot;
  back: PrintSpot;
}

export type GarmentStyle = 'tshirt' | 'polo' | 'hoodie';

/** Same defaults as the backend (customizations/studio-config.ts), for configs saved before print areas existed. */
export const DEFAULT_PRINT_AREAS: Record<GarmentStyle, PrintAreas> = {
  tshirt: { front: { x: 50, y: 38, w: 35 }, chest: { x: 66, y: 36, w: 13 }, back: { x: 50, y: 40, w: 37 } },
  polo: { front: { x: 50, y: 40, w: 33 }, chest: { x: 66, y: 36, w: 12 }, back: { x: 50, y: 40, w: 37 } },
  hoodie: { front: { x: 50, y: 42, w: 30 }, chest: { x: 66, y: 38, w: 12 }, back: { x: 50, y: 44, w: 33 } },
};
