import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from "remotion";
import { useP } from "./ctx";
import { C, SANS, MONO, Rise, Dot, Label, Check, useSpring, ease } from "./brand";

const Fill: React.FC<{ bg: string; children: React.ReactNode }> = ({ bg, children }) => (
  <AbsoluteFill style={{ background: bg, fontFamily: SANS, color: bg === C.ink ? C.cream : C.ink }}>{children}</AbsoluteFill>
);

const H1: React.CSSProperties = { fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 0.98, whiteSpace: "nowrap" };

/* 1 — hook: Your style. Your story. Your Bingooo. */
export const Hook = () => {
  const p = useP();
  return (
    <Fill bg={C.cream}>
      <div style={{ position: "absolute", top: 150, left: 90 }}><Label>Bingooo — Custom Studio</Label></div>
      <div style={{ position: "absolute", top: 520, left: 90, right: 90 }}>
        <Rise delay={p[0] + 2}><div style={{ ...H1, fontSize: 116 }}>YOUR STYLE<Dot /></div></Rise>
        <Rise delay={p[1] + 2}><div style={{ ...H1, fontSize: 116 }}>YOUR STORY<Dot /></div></Rise>
        <Rise delay={p[2] + 2}><div style={{ ...H1, fontSize: 116 }}>YOUR <span style={{ color: C.red }}>BINGOOO</span><Dot /></div></Rise>
      </div>
    </Fill>
  );
};

/* 2 — intro: Meet Bingooo Custom T-Shirts. Ideas, words, artwork, moments. */
export const Intro = () => {
  const p = useP();
  const f = useCurrentFrame();
  const wipe = ease(f, 18, 40, 0, 100);
  const words = [["IDEAS", p[1] + 2], ["WORDS", p[1] + 26], ["ARTWORK", p[1] + 48], ["MOMENTS", p[2] + 2]] as const;
  const you = useSpring(p[2] + 40, 12);
  return (
    <Fill bg={C.ink}>
      <div style={{ position: "absolute", top: 230, left: 0, right: 0, textAlign: "center" }}>
        <Rise delay={0}><div style={{ fontWeight: 800, fontSize: 190, letterSpacing: "-0.07em", color: C.cream }}>BINGOOO<Dot /></div></Rise>
        <div style={{ margin: "24px auto 0", height: 10, width: wipe * 7, background: C.red }} />
        <Rise delay={14} style={{ marginTop: 44 }}><Label color={C.cream} style={{ fontSize: 46 }}>Custom T-shirts</Label></Rise>
      </div>
      <div style={{ position: "absolute", top: 760, left: 110, right: 90 }}>
        {words.map(([w, d]) => (
          <Rise key={w} delay={d} style={{ marginBottom: 6 }}><div style={{ ...H1, fontSize: 124, color: C.cream }}>{w}</div></Rise>
        ))}
        <div style={{ ...H1, fontSize: 124, color: C.red, marginTop: 14, opacity: you, transform: `scale(${0.85 + 0.15 * you})`, transformOrigin: "left" }}>= YOU.</div>
      </div>
    </Fill>
  );
};

/* 3 — pick tee, colour, fit, make it yours */
const TEES = [
  { id: "black", hex: "#171717" },
  { id: "white", hex: "#FFFFFF" },
  { id: "beige", hex: "#D9CBB8" },
  { id: "red", hex: C.red },
];
export const Pick = () => {
  const p = useP();
  const f = useCurrentFrame();
  const step = Math.max(8, (p[2] - p[1]) / 3);
  const idx = f < p[1] ? 0 : f < p[2] ? Math.min(3, 1 + Math.floor((f - p[1]) / step)) : f < p[3] ? 3 : 0;
  const pop = useSpring(0, 14);
  const size = f < p[2] ? -1 : f < p[3] ? Math.min(3, Math.floor((f - p[2]) / 10)) : 2;
  const mine = useSpring(p[3] + 2, 12);
  const labels = ["01 / Choose your tee", "02 / Pick a colour", "03 / Find your fit", "04 / Make it yours"];
  const lab = f < p[1] ? 0 : f < p[2] ? 1 : f < p[3] ? 2 : 3;
  return (
    <Fill bg={C.cream}>
      <div style={{ position: "absolute", top: 150, left: 90 }}><Label>{labels[lab]}</Label></div>
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, height: 900 }}>
        {TEES.map((t, i) => (
          <Img key={t.id} src={staticFile(`img/${t.id}-front.png`)}
            style={{ position: "absolute", left: 90, width: 900, height: 900, objectFit: "contain", opacity: i === idx ? 1 : 0, transform: `scale(${(0.9 + 0.1 * pop) * (f >= p[3] ? 1 + 0.03 * mine : 1)})` }} />
        ))}
      </div>
      <div style={{ position: "absolute", top: 1230, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 36 }}>
        {TEES.map((t, i) => (
          <div key={t.id} style={{ width: 100, height: 100, borderRadius: 50, background: t.hex, border: `3px solid ${C.border}`,
            outline: i === idx ? `6px solid ${C.red}` : "6px solid transparent", outlineOffset: 8, transform: `scale(${i === idx ? 1.12 : 1})` }} />
        ))}
      </div>
      <div style={{ position: "absolute", top: 1390, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 22 }}>
        {["S", "M", "L", "XL"].map((s, i) => (
          <div key={s} style={{ fontFamily: MONO, fontSize: 36, padding: "10px 30px", border: `2px solid ${i === size ? C.ink : C.border}`, background: i === size ? C.ink : "transparent", color: i === size ? C.cream : C.muted }}>{s}</div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 1100, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: f >= p[3] ? mine : 0, transform: `translateY(${(1 - mine) * 20}px)` }}>
        <div style={{ background: C.red, color: "#fff", fontWeight: 800, fontSize: 52, padding: "16px 44px", borderRadius: 10 }}>MAKE IT YOURS.</div>
      </div>
    </Fill>
  );
};

/* 4 — live design studio: artwork, words, logo, an idea, live */
export const Studio = () => {
  const p = useP();
  const f = useCurrentFrame();
  const tools = ["ART", "TEXT", "LOGO", "IDEA"];
  const tAt = [p[0] + 6, p[0] + 52, p[0] + 98, p[1] + 4];
  const active = f < tAt[1] ? 0 : f < tAt[2] ? 1 : f < tAt[3] ? 2 : 3;
  const art = useSpring(tAt[0] + 4, 12);
  const chars = Math.floor(ease(f, tAt[1] + 4, tAt[1] + 36, 0, 7));
  const logo = useSpring(tAt[2] + 4, 14);
  const idea = ease(f, tAt[3] + 4, tAt[3] + 50);
  const live = useSpring(p[2], 10);
  const blink = Math.floor(f / 12) % 2 === 0;
  return (
    <Fill bg={C.cream}>
      <div style={{ position: "absolute", top: 150, left: 90 }}><Label>Live design studio</Label></div>
      <div style={{ position: "absolute", top: 150, right: 90, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 22, height: 22, borderRadius: 11, background: C.red, opacity: blink ? 1 : 0.25 }} />
        <Label color={C.ink}>Live</Label>
      </div>
      <div style={{ position: "absolute", top: 260, left: 90, right: 90, display: "flex", gap: 14 }}>
        {tools.map((t, i) => (
          <div key={t} style={{ flex: 1, textAlign: "center", fontFamily: MONO, fontSize: 34, padding: "20px 0", border: `2px solid ${i === active ? C.red : C.border}`, background: i === active ? C.red : "#fff", color: i === active ? "#fff" : C.ink }}>{t}</div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 400, left: 60, width: 960, height: 960, transform: `scale(${1 + 0.04 * live})` }}>
        <Img src={staticFile("img/black-front.png")} style={{ width: 960, height: 960, objectFit: "contain" }} />
        <div style={{ position: "absolute", left: 330, top: 300, width: 300, height: 380, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 58, letterSpacing: "-0.04em", color: C.cream, height: 70, whiteSpace: "nowrap" }}>{"DEFINE.".slice(0, chars)}</div>
          <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: `scale(${art})`, marginTop: 6 }}>
            <circle cx="110" cy="110" r="90" fill={C.red} />
            {[0, 1, 2].map((k) => <rect key={k} x="40" y={118 + k * 20} width="140" height="9" fill={C.cream} />)}
            <path d="M110 40 l14 38 h-28z" fill={C.cream} />
          </svg>
          <div style={{ marginTop: 12, fontWeight: 800, fontSize: 30, letterSpacing: "-0.06em", color: C.cream, opacity: logo, transform: `translateY(${(1 - logo) * 20}px)` }}>BINGOOO<span style={{ color: C.red }}>.</span></div>
        </div>
        {/* the idea: a hand-drawn star scribbled beside the print */}
        <svg width="180" height="180" viewBox="0 0 100 100" style={{ position: "absolute", left: 600, top: 250 }}>
          <path d="M50 8 L61 38 L93 40 L68 60 L77 92 L50 74 L23 92 L32 60 L7 40 L39 38 Z" fill="none" stroke={C.red} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="330" strokeDashoffset={330 * (1 - idea)} />
        </svg>
        <div style={{ position: "absolute", left: 310, top: 285, width: 340, height: 420, border: `3px dashed ${C.red}`, opacity: ease(f, tAt[0], tAt[0] + 12) }} />
      </div>
      <div style={{ position: "absolute", top: 1330, left: 0, right: 0, textAlign: "center", opacity: live }}>
        <Label color={C.ink} style={{ fontSize: 40 }}>Your idea. Live. <span style={{ color: C.red }}>Instantly.</span></Label>
      </div>
    </Fill>
  );
};

/* 5 — quality */
export const Quality = () => {
  const p = useP();
  const f = useCurrentFrame();
  const zoom = 1.12 + f * 0.0010;
  const rows = [["Crisp, precise detail", p[0]], ["Premium heavyweight cotton", p[1]], ["Feels good. Looks sharp. Stays.", p[2]]] as const;
  return (
    <Fill bg={C.ink}>
      <div style={{ position: "absolute", top: 150, left: 90 }}><Label color={C.cream}>Premium quality</Label></div>
      <div style={{ position: "absolute", top: 260, left: 90, width: 900, height: 620, overflow: "hidden", borderRadius: 18 }}>
        <Img src={staticFile("img/custom-studio.jpg")} style={{ position: "absolute", width: 1200, left: -150, top: -80, transform: `scale(${zoom})`, transformOrigin: "50% 60%" }} />
      </div>
      <div style={{ position: "absolute", top: 940, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 44 }}>
        {rows.map(([r, d]) => {
          const s = useSpring(d + 3, 16);
          return (
            <div key={r} style={{ display: "flex", alignItems: "center", gap: 28, opacity: s, transform: `translateX(${(1 - s) * 60}px)` }}>
              <Check />
              <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 42, color: C.cream, letterSpacing: "-0.01em" }}>{r}</div>
            </div>
          );
        })}
      </div>
    </Fill>
  );
};

/* 6 — Because this isn't just another T-shirt. */
export const NotJust = () => {
  const p = useP();
  const f = useCurrentFrame();
  const strike = ease(f, 44, 66);
  return (
    <Fill bg={C.cream}>
      <div style={{ position: "absolute", top: 150, left: 90 }}><Label>Because</Label></div>
      <div style={{ position: "absolute", top: 560, left: 90, right: 90 }}>
        <Rise delay={p[0] + 2}><div style={{ ...H1, fontSize: 118 }}>THIS ISN'T</div></Rise>
        <Rise delay={p[0] + 14}>
          <div style={{ ...H1, fontSize: 118, position: "relative", color: strike > 0.5 ? C.muted : C.ink }}>
            JUST ANOTHER
            <div style={{ position: "absolute", left: 0, top: "52%", height: 14, width: `${strike * 100}%`, background: C.red }} />
          </div>
        </Rise>
        <Rise delay={p[0] + 28}><div style={{ ...H1, fontSize: 118 }}>T-SHIRT<Dot /></div></Rise>
      </div>
    </Fill>
  );
};

/* 7 — it's something you created */
export const Created = () => {
  const p = useP();
  const photos = ["real-fit-1.jpg", "real-fit-5.jpg", "real-fit-3.jpg"];
  const lines = ["YOU CREATED IT.", "IT REPRESENTS YOU.", "NO ONE WEARS IT YOUR WAY."];
  return (
    <Fill bg={C.ink}>
      <div style={{ position: "absolute", top: 150, left: 90 }}><Label color={C.cream}>It's something you</Label></div>
      <div style={{ position: "absolute", top: 250, left: 90, right: 90, display: "flex", gap: 20 }}>
        {photos.map((ph, i) => {
          const s = useSpring(p[i] + 2, 16);
          return <div key={ph} style={{ flex: 1, height: 460, overflow: "hidden", borderRadius: 14, opacity: s, transform: `translateY(${(1 - s) * 60}px)` }}>
            <Img src={staticFile(`img/${ph}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>;
        })}
      </div>
      <div style={{ position: "absolute", top: 820, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 34 }}>
        {lines.map((l, i) => (
          <Rise key={l} delay={p[i] + 4}>
            <div style={{ display: "flex", gap: 24, alignItems: "baseline" }}>
              <div style={{ fontFamily: MONO, fontSize: 34, color: C.red }}>0{i + 1}</div>
              <div style={{ ...H1, whiteSpace: "normal", fontSize: 88, color: C.cream, lineHeight: 1 }}>{l}</div>
            </div>
          </Rise>
        ))}
      </div>
    </Fill>
  );
};

/* 8 — designed by you, made by Bingooo, delivered */
export const Deliver = () => {
  const p = useP();
  const f = useCurrentFrame();
  const rows = [["DESIGNED", "BY YOU", p[0]], ["MADE", "BY BINGOOO", p[1]], ["DELIVERED", "TO YOUR DOOR", p[2]]] as const;
  const box = useSpring(p[2], 11);
  const tape = ease(f, p[2] + 14, p[2] + 34);
  return (
    <Fill bg={C.cream}>
      <div style={{ position: "absolute", top: 150, left: 90 }}><Label>From idea to doorstep</Label></div>
      <div style={{ position: "absolute", top: 300, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 28 }}>
        {rows.map(([a, b, d], i) => (
          <Rise key={a} delay={d + 2}>
            <div style={{ borderTop: `3px solid ${C.ink}`, paddingTop: 18 }}>
              <div style={{ fontFamily: MONO, fontSize: 30, color: C.muted }}>0{i + 1}</div>
              <div style={{ ...H1, fontSize: 76 }}>{a} <span style={{ color: i === 1 ? C.red : C.ink }}>{b}</span></div>
            </div>
          </Rise>
        ))}
      </div>
      <div style={{ position: "absolute", top: 1030, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${box}) translateY(${(1 - box) * 60}px)` }}>
        <svg width="400" height="400" viewBox="0 0 200 200">
          <path d="M100 20 L180 60 V140 L100 180 L20 140 V60 Z" fill={C.beige} stroke={C.ink} strokeWidth="5" strokeLinejoin="round" />
          <path d="M20 60 L100 100 L180 60 M100 100 V180" fill="none" stroke={C.ink} strokeWidth="5" strokeLinejoin="round" />
          <path d="M60 40 L140 80 V112" fill="none" stroke={C.red} strokeWidth="12" strokeDasharray="200" strokeDashoffset={200 * (1 - tape)} />
        </svg>
      </div>
    </Fill>
  );
};

/* 9 — end card */
export const EndCard = () => {
  const p = useP();
  const f = useCurrentFrame();
  const pulse = 1 + 0.035 * Math.sin(f / 4);
  const cta = useSpring(p[2] + 2, 12);
  return (
    <Fill bg={C.ink}>
      <div style={{ position: "absolute", top: 430, left: 0, right: 0, textAlign: "center" }}>
        <Rise delay={p[0]}><div style={{ fontWeight: 800, fontSize: 180, letterSpacing: "-0.07em", color: C.cream }}>BINGOOO<Dot /></div></Rise>
        <Rise delay={p[1] + 2} style={{ marginTop: 34 }}><div style={{ fontWeight: 800, fontSize: 62, letterSpacing: "0.04em", color: C.cream }}>WEAR WHAT DEFINES YOU<span style={{ color: C.red }}>.</span></div></Rise>
      </div>
      <div style={{ position: "absolute", top: 1060, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: cta, transform: `scale(${pulse * (0.8 + 0.2 * cta)})` }}>
        <div style={{ background: C.red, color: "#fff", fontWeight: 800, fontSize: 64, letterSpacing: "-0.02em", padding: "36px 80px", borderRadius: 12, boxShadow: "0 18px 60px rgba(230,50,28,0.45)" }}>DESIGN YOURS TODAY →</div>
      </div>
    </Fill>
  );
};
