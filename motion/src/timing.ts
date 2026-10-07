import vo from "./vo.json";

export const FPS = 30;
export const GAP = 0.3; // seconds of air between voiceover lines
export const TAIL = 1.0;

let t = 0.2;
export const LINES = vo.map((l, i) => {
  const start = t;
  t += l.dur + GAP;
  return { ...l, i, start: Math.round(start * FPS) };
});
export const TOTAL = Math.round((t + TAIL) * FPS);
export const sceneLen = (i: number) =>
  (i + 1 < LINES.length ? LINES[i + 1].start : TOTAL) - LINES[i].start;
