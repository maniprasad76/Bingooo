import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from "remotion";
import { C, SANS, MONO, Rise, Dot, Label, Check, useSpring, ease } from "./brand";

const Fill: React.FC<{ bg: string; children: React.ReactNode }> = ({ bg, children }) => (
  <AbsoluteFill style={{ background: bg, fontFamily: SANS, color: bg === C.ink ? C.cream : C.ink }}>{children}</AbsoluteFill>
);

/* 1 — hook */
export const Hook = () => (
  <Fill bg={C.cream}>
    <div style={{ position: "absolute", top: 150, left: 90 }}><Label>Bingooo — Custom Studio</Label></div>
    <div style={{ position: "absolute", top: 560, left: 90, right: 90 }}>
      <Rise delay={2}><div style={{ fontWeight: 800, fontSize: 138, whiteSpace: "nowrap", lineHeight: 0.95, letterSpacing: "-0.05em" }}>YOUR STYLE<Dot /></div></Rise>
      <Rise delay={22}><div style={{ fontWeight: 800, fontSize: 138, whiteSpace: "nowrap", lineHeight: 0.95, letterSpacing: "-0.05em" }}>YOUR STORY<Dot /></div></Rise>
    </div>
  </Fill>
);

/* 2 — brand intro */
export const Intro = () => {
  const f = useCurrentFrame();
  const wipe = ease(f, 18, 40, 0, 100);
  return (
    <Fill bg={C.ink}>
      <div style={{ position: "absolute", top: 520, left: 0, right: 0, textAlign: "center" }}>
        <Rise delay={0}><div style={{ fontWeight: 800, fontSize: 190, letterSpacing: "-0.07em", color: C.cream }}>BINGOOO<Dot /></div></Rise>
        <div style={{ margin: "34px auto 0", height: 10, width: `${wipe * 7}px`, background: C.red }} />
        <Rise delay={14} style={{ marginTop: 60 }}><Label color={C.cream} style={{ fontSize: 46 }}>Custom T-shirt design</Label></Rise>
      </div>
    </Fill>
  );
};

/* 3 — pick tee / colour / fit */
const TEES = [
  { id: "black", hex: "#171717" },
  { id: "white", hex: "#FFFFFF" },
  { id: "beige", hex: "#D9CBB8" },
  { id: "red", hex: C.red },
];
export const Pick = () => {
  const f = useCurrentFrame();
  const idx = Math.min(TEES.length - 1, Math.floor(f / 13));
  const pop = useSpring(0, 14);
  return (
    <Fill bg={C.cream}>
      <div style={{ position: "absolute", top: 150, left: 90 }}><Label>01 / Pick your tee</Label></div>
      <div style={{ position: "absolute", top: 330, left: 0, right: 0, height: 900 }}>
        {TEES.map((t, i) => (
          <Img key={t.id} src={staticFile(`img/${t.id}-front.png`)}
            style={{ position: "absolute", left: 90, width: 900, height: 900, objectFit: "contain", opacity: i === idx ? 1 : 0, transform: `scale(${0.9 + 0.1 * pop})` }} />
        ))}
      </div>
      <div style={{ position: "absolute", top: 1260, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 36 }}>
        {TEES.map((t, i) => (
          <div key={t.id} style={{ width: 110, height: 110, borderRadius: 55, background: t.hex, border: `3px solid ${C.border}`,
            outline: i === idx ? `6px solid ${C.red}` : "6px solid transparent", outlineOffset: 8, transform: `scale(${i === idx ? 1.12 : 1})` }} />
        ))}
      </div>
      <div style={{ position: "absolute", top: 1420, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 22 }}>
        {["S", "M", "L", "XL"].map((s, i) => (
          <div key={s} style={{ fontFamily: MONO, fontSize: 36, padding: "10px 30px", border: `2px solid ${i === 2 ? C.ink : C.border}`, background: i === 2 ? C.ink : "transparent", color: i === 2 ? C.cream : C.muted }}>{s}</div>
        ))}
      </div>
    </Fill>
  );
};

/* 4 — live design studio */
export const Studio = () => {
  const f = useCurrentFrame();
  const tools = ["TEXT", "ART", "LOGO"];
  const active = f < 60 ? 0 : f < 115 ? 1 : 2;
  const chars = Math.floor(ease(f, 10, 50, 0, 7));
  const art = useSpring(62, 12);
  const logo = useSpring(118, 14);
  const blink = Math.floor(f / 12) % 2 === 0;
  return (
    <Fill bg={C.cream}>
      <div style={{ position: "absolute", top: 150, left: 90 }}><Label>02 / Design it live</Label></div>
      <div style={{ position: "absolute", top: 150, right: 90, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 22, height: 22, borderRadius: 11, background: C.red, opacity: blink ? 1 : 0.25 }} />
        <Label color={C.ink}>Live</Label>
      </div>
      <div style={{ position: "absolute", top: 260, left: 90, right: 90, display: "flex", gap: 20 }}>
        {tools.map((t, i) => (
          <div key={t} style={{ flex: 1, textAlign: "center", fontFamily: MONO, fontSize: 36, padding: "20px 0", border: `2px solid ${i === active ? C.red : C.border}`, background: i === active ? C.red : "#fff", color: i === active ? "#fff" : C.ink }}>{t}</div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 420, left: 60, width: 960, height: 960 }}>
        <Img src={staticFile("img/black-front.png")} style={{ width: 960, height: 960, objectFit: "contain" }} />
        {/* print area: chest */}
        <div style={{ position: "absolute", left: 330, top: 300, width: 300, height: 360, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start" }}>
          <div style={{ fontWeight: 800, fontSize: 58, letterSpacing: "-0.04em", color: C.cream, height: 70, whiteSpace: "nowrap" }}>{"DEFINE.".slice(0, chars)}</div>
          <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: `scale(${art})`, marginTop: 6 }}>
            <circle cx="110" cy="110" r="90" fill={C.red} />
            {[0, 1, 2].map((k) => <rect key={k} x="40" y={118 + k * 20} width="140" height="9" fill={C.cream} />)}
            <path d="M110 40 l14 38 h-28z" fill={C.cream} />
          </svg>
          <div style={{ marginTop: 12, fontWeight: 800, fontSize: 30, letterSpacing: "-0.06em", color: C.cream, opacity: logo, transform: `translateY(${(1 - logo) * 20}px)` }}>BINGOOO<span style={{ color: C.red }}>.</span></div>
        </div>
        {/* selection box */}
        <div style={{ position: "absolute", left: 310, top: 285, width: 340, height: 400, border: `3px dashed ${C.red}`, opacity: ease(f, 8, 20) }} />
      </div>
    </Fill>
  );
};

/* 5 — quality */
export const Quality = () => {
  const f = useCurrentFrame();
  const zoom = 1.15 + f * 0.0012;
  const rows = ["Heavyweight cotton, 240+ GSM", "Crisp, razor-sharp prints", "Built to last, wash after wash"];
  return (
    <Fill bg={C.ink}>
      <div style={{ position: "absolute", top: 150, left: 90 }}><Label color={C.cream}>03 / Premium quality</Label></div>
      <div style={{ position: "absolute", top: 260, left: 90, width: 900, height: 620, overflow: "hidden", borderRadius: 18 }}>
        <Img src={staticFile("img/custom-studio.jpg")} style={{ position: "absolute", width: 1200, left: -150 - 0, top: -80, transform: `scale(${zoom})`, transformOrigin: "50% 60%" }} />
      </div>
      <div style={{ position: "absolute", top: 940, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 44 }}>
        {rows.map((r, i) => {
          const s = useSpring(22 + i * 48, 16);
          return (
            <div key={r} style={{ display: "flex", alignItems: "center", gap: 28, opacity: s, transform: `translateX(${(1 - s) * 60}px)` }}>
              <Check />
              <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 44, color: C.cream, letterSpacing: "-0.01em" }}>{r}</div>
            </div>
          );
        })}
      </div>
    </Fill>
  );
};

/* 6 — made for you, delivered */
export const Deliver = () => {
  const f = useCurrentFrame();
  const box = useSpring(4, 11);
  const tape = ease(f, 26, 44);
  const tick = useSpring(48, 12);
  return (
    <Fill bg={C.cream}>
      <div style={{ position: "absolute", top: 150, left: 90 }}><Label>04 / At your door</Label></div>
      <div style={{ position: "absolute", top: 420, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${box}) translateY(${(1 - box) * 80}px)` }}>
        <svg width="520" height="520" viewBox="0 0 200 200">
          <path d="M100 20 L180 60 V140 L100 180 L20 140 V60 Z" fill={C.beige} stroke={C.ink} strokeWidth="5" strokeLinejoin="round" />
          <path d="M20 60 L100 100 L180 60 M100 100 V180" fill="none" stroke={C.ink} strokeWidth="5" strokeLinejoin="round" />
          <path d="M60 40 L140 80 V112" fill="none" stroke={C.red} strokeWidth="12" strokeDasharray="200" strokeDashoffset={200 * (1 - tape)} />
        </svg>
        <div style={{ position: "absolute", right: 250, top: 40, transform: `scale(${tick})` }}><Check size={110} /></div>
      </div>
      <div style={{ position: "absolute", top: 1030, left: 90, right: 90, textAlign: "center" }}>
        <Rise delay={10}><div style={{ fontWeight: 800, fontSize: 86, letterSpacing: "-0.05em", lineHeight: 1 }}>MADE JUST FOR YOU<Dot /></div></Rise>
        <Rise delay={24} style={{ marginTop: 26 }}><Label style={{ fontSize: 40 }}>Delivered to your door</Label></Rise>
      </div>
    </Fill>
  );
};

/* 7 — end card */
export const EndCard = () => {
  const f = useCurrentFrame();
  const pulse = 1 + 0.035 * Math.sin(f / 4);
  const cta = useSpring(52, 12);
  return (
    <Fill bg={C.ink}>
      <div style={{ position: "absolute", top: 440, left: 0, right: 0, textAlign: "center" }}>
        <Rise delay={0}><div style={{ fontWeight: 800, fontSize: 180, letterSpacing: "-0.07em", color: C.cream }}>BINGOOO<Dot /></div></Rise>
        <Rise delay={14} style={{ marginTop: 30 }}><Label color={C.cream} style={{ fontSize: 44 }}>Wear what defines you.</Label></Rise>
      </div>
      <div style={{ position: "absolute", top: 1060, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: cta, transform: `scale(${pulse * (0.8 + 0.2 * cta)})` }}>
        <div style={{ background: C.red, color: "#fff", fontWeight: 800, fontSize: 64, letterSpacing: "-0.02em", padding: "36px 80px", borderRadius: 12, boxShadow: "0 18px 60px rgba(230,50,28,0.45)" }}>DESIGN YOURS →</div>
      </div>
    </Fill>
  );
};
