import vo from "./vo.json";

export const FPS = 30;
export const SEGS = vo.segs;
export const TOTAL = vo.total;
export const sceneLen = (i: number) => (i + 1 < SEGS.length ? SEGS[i + 1].start : TOTAL) - SEGS[i].start;
