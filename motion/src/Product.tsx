import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, SANS, MONO, FontFaces, Rise, Dot, ease } from "./brand";

type Item = {
  name: string;
  price: number;
  spec: string;
  bg: string;
  fg: string;
  /** image per beat, each held for `hold` frames */
  imgs: string[];
  tags: string[];
};

const HOLD = 46;
const SCENE = 190;
const INTRO = 70;
const END = 130;

const ITEMS: Item[] = [
  { name: "T-SHIRT", price: 699, spec: "100% combed cotton · classic crewneck", bg: C.cream, fg: C.ink,
    imgs: ["white-front.png", "black-front.png", "beige-front.png", "red-front.png"], tags: ["WHITE", "BLACK", "BEIGE", "RED"] },
  { name: "OVERSIZED", price: 1299, spec: "240 GSM loopknit french terry · drop-shoulder", bg: C.ink, fg: C.cream,
    imgs: ["black-back.png", "white-back.png", "beige-back.png", "red-back.png"], tags: ["BLACK", "WHITE", "BEIGE", "RED"] },
  { name: "HOODIE", price: 849, spec: "430 GSM heavyweight fleece · drop-shoulder", bg: C.red, fg: C.cream,
    imgs: ["hoodie-black-front.png", "hoodie-white-front.png", "hoodie-black-back.png", "hoodie-white-back.png"], tags: ["BLACK", "WHITE", "BLACK · BACK", "WHITE · BACK"] },
];

export const PRODUCT_TOTAL = INTRO + ITEMS.length * SCENE - 12 * ITEMS.length + END;
const start = (i: number) => INTRO + i * (SCENE - 12);

const Intro: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.cream, alignItems: "center", justifyContent: "center", opacity: ease(f, INTRO - 10, INTRO, 1, 0) }}>
      <Rise delay={4}><div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 38, letterSpacing: "0.18em", color: C.muted }}>THE LINEUP</div></Rise>
      <div style={{ width: ease(f, 12, 36, 0, 240), height: 5, background: C.red, margin: "26px 0" }} />
      <Rise delay={10}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 170, letterSpacing: "-0.045em", color: C.ink, lineHeight: 1 }}>BINGOOO<Dot /></div></Rise>
    </AbsoluteFill>
  );
};

const Scene: React.FC<{ item: Item }> = ({ item }) => {
  const f = useCurrentFrame();
  const beat = Math.min(item.imgs.length - 1, Math.floor(Math.max(0, f - 28) / HOLD));
  const local = (f - 28) - beat * HOLD;
  const enter = f < 28 ? ease(f, 0, 28) : ease(local, 0, 14);
  const slide = f < 28 ? 0 : ease(local, 0, 14, 90, 0);
  const slideOut = ease(f, SCENE - 12, SCENE, 0, -160);
  const wipe = ease(f, 0, 18, 100, 0);
  const wipeOut = ease(f, SCENE - 12, SCENE, 0, 100);
  const sub = item.fg === C.ink ? C.muted : "rgba(247,238,219,.72)";
  const bob = Math.sin(f / 24) * 10;
  const drift = interpolate(f, [0, SCENE], [1.0, 1.06]);
  return (
    <AbsoluteFill style={{ background: item.bg, clipPath: `inset(0 ${wipeOut}% 0 ${wipe}%)` }}>
      {/* giant name behind the garment */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 250, letterSpacing: "-0.05em", color: item.fg, opacity: 0.07, transform: `translateX(${(f - 60) * 1.4}px)`, whiteSpace: "nowrap" }}>{item.name}</div>
      <div style={{ position: "absolute", left: 80, top: 170 }}>
        <Rise delay={10}><div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 27, letterSpacing: "0.12em", color: sub }}>{item.spec.toUpperCase()}</div></Rise>
        <div style={{ width: ease(f, 14, 38, 0, 96), height: 5, background: item.bg === C.red ? C.ink : C.red, margin: "22px 0 26px" }} />
        <Rise delay={14}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 132, letterSpacing: "-0.04em", color: item.fg, lineHeight: 1 }}>{item.name}<span style={{ color: item.bg === C.red ? C.ink : C.red }}>.</span></div></Rise>
      </div>
      {/* garment */}
      <div style={{ position: "absolute", left: 90, right: 90, top: 560, height: 880, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", bottom: 20, width: 560, height: 60, borderRadius: "50%", background: "rgba(0,0,0,.28)", filter: "blur(30px)" }} />
        <Img
          key={beat}
          src={staticFile(`img/${item.imgs[beat]}`)}
          style={{ height: "100%", width: "100%", objectFit: "contain", opacity: enter, transform: `translateX(${slide}px) translateY(${bob}px) scale(${drift * 1.3})`, filter: "drop-shadow(0 30px 40px rgba(0,0,0,.35))" }}
        />
      </div>
      {/* colorway tag + dots */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 190, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 36, letterSpacing: "0.16em", color: item.fg, opacity: f >= 28 ? 1 : 0 }}>{item.tags[beat]}</div>
          <div style={{ display: "flex", gap: 14, marginTop: 20 }}>
            {item.imgs.map((_, i) => (
              <div key={i} style={{ width: i === beat ? 54 : 16, height: 16, borderRadius: 8, background: i === beat ? (item.bg === C.red ? C.ink : C.red) : item.fg, opacity: i === beat ? 1 : 0.3 }} />
            ))}
          </div>
        </div>
        <Rise delay={24}>
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 96, letterSpacing: "-0.02em", color: item.fg }}>₹{item.price.toLocaleString("en-IN")}</div>
        </Rise>
      </div>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${slideOut}px)`, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.cream, opacity: ease(f, 0, 16), alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 34 }}>
      <Rise delay={4}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 96, color: C.ink, letterSpacing: "-0.03em" }}>Or design your own<Dot /></div></Rise>
      <div style={{ width: ease(f, 16, 40, 0, 240), height: 5, background: C.red }} />
      <Rise delay={16}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 210, letterSpacing: "-0.045em", color: C.ink, lineHeight: 1 }}>BINGOOO<Dot /></div></Rise>
      <Rise delay={28}><div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 42, letterSpacing: "0.1em", color: C.red }}>bingooo.co.in</div></Rise>
    </AbsoluteFill>
  );
};

export const Product: React.FC = () => (
  <AbsoluteFill style={{ background: C.cream }}>
    <FontFaces />
    <Sequence durationInFrames={INTRO}><Intro /></Sequence>
    {ITEMS.map((it, i) => (
      <Sequence key={it.name} from={start(i)} durationInFrames={SCENE}><Scene item={it} /></Sequence>
    ))}
    <Sequence from={start(ITEMS.length - 1) + SCENE - 12}><EndCard /></Sequence>
  </AbsoluteFill>
);
