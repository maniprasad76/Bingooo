import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, SANS, MONO, FontFaces, Rise, Dot, ease } from "./brand";

type Shot = {
  img: string;
  dur: number;
  /** [startScale, endScale], focal point as % of the frame, drift in px */
  zoom: [number, number];
  focus: [number, number];
  drift: [number, number];
  lines: string[];
  pos: "top" | "bottom";
  /** render the website-in-phone shot instead of a plain photo */
  site?: boolean;
};

const T = 14; // transition overlap, frames
const SHOTS: Shot[] = [
  { img: "real-fit-1.jpg", dur: 96, zoom: [1.0, 1.18], focus: [45, 45], drift: [0, -30], lines: ["Your style."], pos: "bottom" },
  { img: "real-fit-2.jpg", dur: 92, zoom: [1.1, 1.0], focus: [50, 40], drift: [-40, 0], lines: ["Your story."], pos: "bottom" },
  { img: "real-fit-5.jpg", dur: 92, zoom: [1.0, 1.16], focus: [50, 40], drift: [0, 30], lines: ["Your Bingooo", "."], pos: "bottom" },
  { img: "real-fit-4.jpg", dur: 110, zoom: [1.05, 1.28], focus: [40, 60], drift: [20, 0], lines: ["Premium heavyweight", "cotton."], pos: "top" },
  { img: "real-fit-6.jpg", dur: 100, zoom: [1.12, 1.0], focus: [50, 50], drift: [0, -24], lines: ["Made to be", "lived in."], pos: "bottom" },
  { img: "real-fit-3.jpg", dur: 110, zoom: [1.0, 1.0], focus: [30, 50], drift: [-170, 0], lines: ["Design yours."], pos: "bottom" },
];

/** Longer 32s cut: every photo holds a little longer and the live studio on bingooo.co.in gets its own shot. */
const SHOTS_LONG: Shot[] = [
  { ...SHOTS[0], dur: 118 },
  { ...SHOTS[1], dur: 112 },
  { ...SHOTS[2], dur: 112 },
  { ...SHOTS[3], dur: 124 },
  { ...SHOTS[4], dur: 118 },
  { img: "site-mobile.png", dur: 210, zoom: [1, 1], focus: [50, 50], drift: [0, 0], lines: ["Design it live", "."], pos: "top", site: true },
  { ...SHOTS[5], lines: ["Yours in", "a few taps."], dur: 120 },
];

const layout = (shots: Shot[]) => {
  const starts = shots.reduce<number[]>((a, s, i) => (a.push(i ? a[i - 1] + shots[i - 1].dur - T : 0), a), []);
  const endStart = starts[shots.length - 1] + shots[shots.length - 1].dur - T;
  return { starts, endStart, total: endStart + 120 };
};
export const REAL_TOTAL = layout(SHOTS).total;
export const REAL_LONG_TOTAL = layout(SHOTS_LONG).total;

/** Cheap handheld camera: layered sines, no random so renders are deterministic. */
const shake = (f: number, amp: number) => ({
  x: amp * (Math.sin(f / 9.1) * 0.6 + Math.sin(f / 4.3 + 1) * 0.4),
  y: amp * (Math.sin(f / 7.7 + 2) * 0.6 + Math.sin(f / 3.9) * 0.4),
  r: amp * 0.02 * Math.sin(f / 11.3),
});

const ShotView: React.FC<{ s: Shot; first: boolean }> = ({ s, first }) => {
  const f = useCurrentFrame();
  const p = ease(f, 0, s.dur);
  const e = p * p * (3 - 2 * p) * 0.5 + p * 0.5; // gentle ease, mostly linear
  const scale = s.zoom[0] + (s.zoom[1] - s.zoom[0]) * e;
  const sh = shake(f, 5);
  const dx = s.drift[0] * (e - 0.5) + sh.x;
  const dy = s.drift[1] * (e - 0.5) + sh.y;
  const fadeIn = first ? 1 : ease(f, 0, T);
  // push-blur on the way in and out, like a whip transition
  const blur = (first ? 0 : ease(f, 0, T, 14, 0)) + ease(f, s.dur - T, s.dur, 0, 14);
  const slide = (first ? 0 : ease(f, 0, T, 90, 0)) - ease(f, s.dur - T, s.dur, 0, 90);
  return (
    <AbsoluteFill style={{ opacity: fadeIn, overflow: "hidden", background: C.ink }}>
      <AbsoluteFill style={{ filter: `blur(${blur}px)`, transform: `translateX(${slide}px)` }}>
        <Img
          src={staticFile(`img/${s.img}`)}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
            objectPosition: `${s.focus[0]}% ${s.focus[1]}%`,
            transformOrigin: `${s.focus[0]}% ${s.focus[1]}%`,
            transform: `translate(${dx}px, ${dy}px) rotate(${sh.r}deg) scale(${scale})`,
            filter: "contrast(1.06) saturate(1.05) brightness(0.96)",
          }}
        />
      </AbsoluteFill>
      {/* readability gradient behind the type */}
      <AbsoluteFill style={{ background: s.pos === "bottom"
        ? "linear-gradient(to top, rgba(10,8,6,.78) 0%, rgba(10,8,6,.30) 28%, transparent 52%)"
        : "linear-gradient(to bottom, rgba(10,8,6,.70) 0%, rgba(10,8,6,.25) 26%, transparent 48%)" }} />
      <Caption s={s} />
    </AbsoluteFill>
  );
};

/** A phone held in frame, scrolling the live custom studio, over a defocused street photo. */
const SiteView: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const fadeIn = ease(f, 0, T);
  const blurOut = ease(f, s.dur - T, s.dur, 0, 14);
  const slideOut = -ease(f, s.dur - T, s.dur, 0, 90);
  const sh = shake(f, 4);
  const rise = interpolate(ease(f, 0, 30), [0, 1], [260, 0]);
  const tilt = interpolate(f, [0, s.dur], [7, -3]);
  // screenshot is 780x6150; the phone screen shows 780x1690 of it at a time
  const scroll = interpolate(f, [30, 80, 110, 150, 175, s.dur], [0, 0, 1500, 1500, 2700, 2900], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t * (3 - 2 * t) });
  // layout is authored for 1920px tall; k shrinks it for the 4:5 and 1:1 feed renders
  const { width, height } = useVideoConfig();
  const k = height / 1920;
  const W = 560 * k, H = W * 2.16, R = 86 * k, bezel = 22 * k;
  const scr = (W - bezel * 2) / 780;
  return (
    <AbsoluteFill style={{ opacity: fadeIn, background: C.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: `blur(${blurOut}px)`, transform: `translateX(${slideOut}px)` }}>
        <Img src={staticFile("img/real-fit-3.jpg")} style={{ position: "absolute", inset: -60, width: "calc(100% + 120px)", height: "calc(100% + 120px)", objectFit: "cover", objectPosition: "35% 50%", filter: "blur(18px) brightness(0.55) saturate(0.9)", transform: `scale(${1.1 + f / 3000})` }} />
        <div style={{ position: "absolute", left: (width - W) / 2, top: 420 * k, width: W, height: H, transform: `translate(${sh.x}px, ${rise + sh.y}px) perspective(2400px) rotateY(${tilt}deg) rotateX(${tilt * 0.4}deg)` }}>
          {/* contact shadow */}
          <div style={{ position: "absolute", inset: 0, borderRadius: R, boxShadow: "0 80px 120px rgba(0,0,0,.6), 0 30px 40px rgba(0,0,0,.45)" }} />
          {/* titanium frame */}
          <div style={{ position: "absolute", inset: 0, borderRadius: R, background: "linear-gradient(135deg, #5a5650 0%, #1d1c1a 35%, #3b3935 60%, #121110 100%)" }} />
          <div style={{ position: "absolute", inset: 8, borderRadius: R - 8, background: "#050505" }} />
          {/* screen */}
          <div style={{ position: "absolute", inset: bezel, borderRadius: R - bezel, overflow: "hidden", background: C.cream }}>
            <Img src={staticFile("img/site-mobile.png")} style={{ position: "absolute", left: 0, top: 64 * k, width: 780 * scr, transform: `translateY(${-scroll * scr}px)` }} />
            {/* status bar */}
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 64 * k, background: C.ink, color: C.cream, fontFamily: SANS, fontWeight: 800, fontSize: 24 * k, display: "flex", alignItems: "center", padding: `${6 * k}px ${52 * k}px 0` }}>9:41</div>
            {/* glass reflection sweeping across */}
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(115deg, transparent ${20 + f / 4}%, rgba(255,255,255,.16) ${28 + f / 4}%, transparent ${40 + f / 4}%)` }} />
          </div>
          {/* dynamic island */}
          <div style={{ position: "absolute", top: bezel + 22 * k, left: W / 2 - 70 * k, width: 140 * k, height: 40 * k, borderRadius: 20 * k, background: "#000" }} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(10,8,6,.75) 0%, transparent 26%)" }} />
      <Caption s={s} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 120 * k, textAlign: "center", opacity: ease(f, 40, 60) * ease(f, s.dur - T - 8, s.dur - T, 1, 0) }}>
        <span style={{ fontFamily: MONO, fontWeight: 500, fontSize: 40 * Math.max(k, 0.75), letterSpacing: "0.12em", color: C.cream, background: C.red, padding: "14px 30px" }}>BINGOOO.CO.IN</span>
      </div>
    </AbsoluteFill>
  );
};

const Caption: React.FC<{ s: Shot }> = ({ s }) => {
  const f = useCurrentFrame();
  const out = ease(f, s.dur - T - 8, s.dur - T, 1, 0);
  const isBingooo = s.lines[1] === ".";
  const k = useVideoConfig().height / 1920;
  const size = 124 * Math.max(k, 0.78);
  return (
    <div style={{ position: "absolute", left: 80, right: 80, [s.pos]: (s.pos === "bottom" ? 230 : 190) * k, opacity: out } as React.CSSProperties}>
      <div style={{ width: ease(f, 10, 34, 0, 96), height: 5, background: C.red, marginBottom: 28 }} />
      {isBingooo ? (
        <Rise delay={14}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: 1.0, color: C.cream, letterSpacing: "-0.03em", textShadow: "0 4px 40px rgba(0,0,0,.45)" }}>{s.lines[0]}<Dot /></div></Rise>
      ) : (
        s.lines.map((l, i) => (
          <Rise key={i} delay={14 + i * 5}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: size, lineHeight: 1.04, color: C.cream, letterSpacing: "-0.03em", textShadow: "0 4px 40px rgba(0,0,0,.45)" }}>{l}</div>
          </Rise>
        ))
      )}
    </div>
  );
};

/** Film look applied over everything: bloom, light leak, vignette, grain. */
const FilmLook: React.FC = () => {
  const f = useCurrentFrame();
  const leak = 0.5 + 0.5 * Math.sin(f / 38);
  return (
    <>
      <AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.16 + 0.1 * leak, background: "radial-gradient(60% 40% at 105% 12%, #ff7a3d 0%, rgba(255,122,61,0) 70%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,.5) 100%)" }} />
      <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: 0.42 }}>
        <svg width="100%" height="100%">
          <filter id="g" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 24} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#g)" />
        </svg>
      </AbsoluteFill>
    </>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const bg = ease(f, 0, 18);
  const fade = ease(f, 0, 14);
  return (
    <AbsoluteFill style={{ background: C.cream, opacity: bg, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 40 }}>
      <div style={{ opacity: fade }}>
        <Rise delay={6}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 210, letterSpacing: "-0.045em", color: C.ink, lineHeight: 1 }}>BINGOOO<Dot /></div></Rise>
      </div>
      <Rise delay={20}><div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 38, letterSpacing: "0.16em", color: C.muted }}>CLOTHING · CUSTOM · CULTURE</div></Rise>
      <div style={{ width: ease(f, 28, 54, 0, 240), height: 5, background: C.red, margin: "10px 0" }} />
      <Rise delay={34}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 76, color: C.ink, letterSpacing: "-0.02em" }}>Wear what defines you<Dot /></div></Rise>
      <Rise delay={46}><div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 42, letterSpacing: "0.1em", color: C.red }}>bingooo.co.in</div></Rise>
    </AbsoluteFill>
  );
};

const Cut: React.FC<{ shots: Shot[]; audio: string }> = ({ shots, audio }) => {
  const f = useCurrentFrame();
  const { starts, endStart: END_START, total } = layout(shots);
  return (
    <AbsoluteFill style={{ background: C.ink }}>
      <FontFaces />
      {shots.map((s, i) => (
        <Sequence key={s.img} from={starts[i]} durationInFrames={s.dur}>
          {s.site ? <SiteView s={s} /> : <ShotView s={s} first={i === 0} />}
        </Sequence>
      ))}
      <Sequence from={END_START}><EndCard /></Sequence>
      <Sequence durationInFrames={END_START + 20}><FilmLook /></Sequence>
      {/* open from black */}
      <AbsoluteFill style={{ background: "#000", opacity: ease(f, 0, 12, 1, 0), pointerEvents: "none" }} />
      <Audio src={staticFile(`audio/${audio}`)} volume={(fr) => interpolate(fr, [total - 45, total], [1, 0], { extrapolateLeft: "clamp" })} />
    </AbsoluteFill>
  );
};

export const Real: React.FC = () => <Cut shots={SHOTS} audio="real-bed.wav" />;
export const RealLong: React.FC = () => <Cut shots={SHOTS_LONG} audio="real-bed-long.wav" />;
