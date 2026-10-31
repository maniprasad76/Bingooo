import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, SANS, MONO, FontFaces, Rise, Dot, ease } from "./brand";

// Website showcase: a phone walking through home -> shop -> custom studio -> prepaid checkout.
export const SHOWCASE_TOTAL = 840;
const SEG = { home: 0, shop: 150, studio: 330, pay: 600, end: 720 };
const SW = 390, SH = 844, SCALE = 1.66;

const clamp = (f: number, a: number, b: number) => ease(f, a, b);
const out = (n: number) => `img/${n}`;

const Icon: React.FC<{ d: string; size?: number }> = ({ d, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const ICONS = {
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3",
  heart: "M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z",
  menu: "M3 6h18M3 12h18M3 18h18",
  bag: "M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0",
  home: "M3 10l9-7 9 7v10a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1z",
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  check: "M5 12.5l4.5 4.5L19 7.5",
};

const Ticker = () => (
  <div style={{ height: 30, background: C.ink, color: C.cream, fontFamily: MONO, fontWeight: 500, fontSize: 9.5, letterSpacing: "0.14em", display: "flex", alignItems: "center", paddingLeft: 14, whiteSpace: "nowrap", flexShrink: 0 }}>
    FREE DELIVERY ON PREPAID ORDERS · 240+ GSM HEAVYWEIGHT
  </div>
);
const Header = () => (
  <div style={{ height: 52, background: C.cream, borderBottom: `2px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0 }}>
    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 25, letterSpacing: "-0.06em", color: C.ink }}>BINGOOO<span style={{ color: C.red }}>.</span></div>
    <div style={{ display: "flex", gap: 14 }}><Icon d={ICONS.search} /><Icon d={ICONS.heart} /><Icon d={ICONS.menu} /></div>
  </div>
);
const TabBar: React.FC<{ active: number }> = ({ active }) => (
  <div style={{ position: "absolute", left: 14, right: 14, bottom: 14, height: 56, borderRadius: 28, background: "rgba(247,238,219,.94)", boxShadow: "0 8px 30px rgba(0,0,0,.25)", border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-around" }}>
    {[ICONS.home, ICONS.grid, ICONS.heart, ICONS.bag, ICONS.user].map((d, i) => (
      <div key={i} style={{ opacity: i === active ? 1 : 0.4, position: "relative" }}>
        <Icon d={d} size={24} />
        {i === active && <div style={{ position: "absolute", left: 9, bottom: -9, width: 5, height: 5, borderRadius: 3, background: C.red }} />}
      </div>
    ))}
  </div>
);

const Btn: React.FC<{ children: React.ReactNode; bg: string; fg: string; press?: number; style?: React.CSSProperties }> = ({ children, bg, fg, press = 0, style }) => (
  <div style={{ position: "relative", fontFamily: SANS, fontWeight: 800, fontSize: 14, letterSpacing: "0.02em", background: bg, color: fg, border: `2px solid ${C.ink}`, padding: "15px 0", textAlign: "center", boxShadow: `${4 - 3 * press}px ${4 - 3 * press}px 0 ${C.ink}`, transform: `translate(${3 * press}px,${3 * press}px)`, ...style }}>{children}</div>
);

/* ---------- screens ---------- */
const Home: React.FC<{ f: number }> = ({ f }) => {
  const scroll = clamp(f, 70, 130) * 60;
  return (
    <div style={{ position: "absolute", inset: 0, background: C.cream, display: "flex", flexDirection: "column" }}>
      <Ticker /><Header />
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${-scroll}px)` }}>
          <Img src={staticFile(out("real-fit-2.jpg"))} style={{ position: "absolute", left: 0, top: 0, width: "100%", height: 560, objectFit: "cover", objectPosition: "50% 40%", transform: `scale(${1 + f / 900})` }} />
          <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: 560, background: `linear-gradient(180deg, rgba(247,238,219,.1) 0%, rgba(247,238,219,.55) 45%, ${C.cream} 100%)` }} />
          <div style={{ position: "absolute", left: 18, top: 40, fontFamily: MONO, fontWeight: 500, fontSize: 10, letterSpacing: "0.22em", color: C.ink, lineHeight: 1.9 }}>CLOTHING<br />CUSTOM<br />CULTURE<br />BINGOOO</div>
          <div style={{ position: "absolute", left: 18, top: 215, fontFamily: SANS, fontWeight: 800, fontSize: 52, letterSpacing: "-0.05em", lineHeight: 0.92, color: C.ink }}>
            <Rise delay={8}>WEAR WHAT</Rise><Rise delay={14}>DEFINES</Rise><Rise delay={20}>YOU<Dot /></Rise>
          </div>
          <div style={{ position: "absolute", left: 18, right: 18, top: 405, opacity: clamp(f, 26, 40) }}>
            <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 10, letterSpacing: "0.14em", color: C.muted, marginBottom: 14 }}>240–280 GSM HEAVYWEIGHT STREETWEAR · CUSTOM STUDIO</div>
            <Btn bg={C.red} fg={C.cream} press={f > 118 && f < 128 ? 1 : 0}>SHOP MEN'S WEAR →</Btn>
          </div>
        </div>
      </div>
      <TabBar active={0} />
    </div>
  );
};

type P = { slug: string; name: string; price: number; img: string; tag: string };
const PRODUCTS: P[] = [
  { slug: "t", name: "Classic Tee", price: 699, img: "white-front.png", tag: "T-SHIRTS" },
  { slug: "o", name: "Oversized Tee", price: 699, img: "black-front.png", tag: "OVERSIZED" },
  { slug: "h", name: "Heavy Hoodie", price: 849, img: "hoodie-black-front.png", tag: "HOODIES" },
  { slug: "r", name: "Street Tee", price: 699, img: "red-front.png", tag: "T-SHIRTS" },
  { slug: "b", name: "Sand Oversized", price: 699, img: "beige-front.png", tag: "OVERSIZED" },
  { slug: "w", name: "Cloud Hoodie", price: 849, img: "hoodie-white-front.png", tag: "HOODIES" },
];
const Shop: React.FC<{ f: number }> = ({ f }) => {
  const scroll = clamp(f, 70, 125) * 250;
  return (
    <div style={{ position: "absolute", inset: 0, background: C.cream, display: "flex", flexDirection: "column" }}>
      <Ticker /><Header />
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, transform: `translateY(${-scroll}px)`, padding: "22px 16px 100px" }}>
          <div style={{ display: "inline-block", background: C.ink, color: C.cream, fontFamily: MONO, fontWeight: 500, fontSize: 9, letterSpacing: "0.14em", padding: "5px 9px" }}>01 // CATALOG</div>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 46, letterSpacing: "-0.05em", lineHeight: 0.92, marginTop: 12, color: C.ink }}>SHOP<br /><span style={{ color: C.red }}>THE FIT.</span></div>
          <div style={{ display: "flex", gap: 8, margin: "18px 0", fontFamily: MONO, fontWeight: 500, fontSize: 9, letterSpacing: "0.1em" }}>
            {["ALL", "T-SHIRTS", "OVERSIZED", "HOODIES"].map((t, i) => (
              <div key={t} style={{ padding: "7px 9px", border: `2px solid ${C.ink}`, background: i === 0 ? C.ink : "transparent", color: i === 0 ? C.cream : C.ink }}>{t}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {PRODUCTS.map((p, i) => {
              const e = clamp(f, 14 + i * 5, 30 + i * 5);
              const hit = p.slug === "t" && f > 138;
              return (
                <div key={p.slug} style={{ background: "#fff", border: `2px solid ${C.ink}`, boxShadow: `3px 3px 0 ${C.ink}`, opacity: e, transform: `translateY(${(1 - e) * 40}px) scale(${hit ? 0.97 : 1})` }}>
                  <div style={{ background: C.beige, height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Img src={staticFile(out(p.img))} style={{ height: 136, objectFit: "contain" }} />
                  </div>
                  <div style={{ padding: "8px 10px 10px" }}>
                    <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 8, letterSpacing: "0.12em", color: C.red }}>{p.tag}</div>
                    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 13, color: C.ink, margin: "3px 0 5px" }}>{p.name}</div>
                    <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 14, color: C.ink }}>₹{p.price}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <TabBar active={1} />
    </div>
  );
};

const SW_COLORS = [
  { n: "WHITE", c: "#F4F1EA", img: "white-front.png", back: "white-back.png", ink: C.ink },
  { n: "BLACK", c: "#171717", img: "black-front.png", back: "black-back.png", ink: C.cream },
  { n: "BEIGE", c: "#D9C7A8", img: "beige-front.png", back: "beige-back.png", ink: C.ink },
  { n: "RED", c: C.red, img: "red-front.png", back: "red-back.png", ink: C.cream },
];
const Studio: React.FC<{ f: number }> = ({ f }) => {
  // color changes at 60 (black) and 150 (red); art lands at ~96; side flips to back at 190
  const ci = f < 60 ? 0 : f < 150 ? 1 : 3;
  const sw = SW_COLORS[ci];
  const back = f >= 195;
  const flip = back ? clamp(f, 195, 215) : 0;
  const rot = f >= 190 && f < 215 ? Math.abs(Math.cos(clamp(f, 190, 215) * Math.PI)) : 1;
  const text = "BINGOOO";
  const typed = Math.floor(clamp(f, 82, 112) * text.length);
  const artIn = clamp(f, 112, 130);
  const hood = f >= 235;
  const gimg = hood ? "hoodie-black-front.png" : back ? sw.back : sw.img;
  const price = hood ? 849 : 699;
  const printInk = hood ? C.cream : sw.ink;
  return (
    <div style={{ position: "absolute", inset: 0, background: C.cream, display: "flex", flexDirection: "column" }}>
      <Ticker /><Header />
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <div style={{ margin: "14px 14px 0", background: C.red, border: `2px solid ${C.ink}`, boxShadow: `4px 4px 0 ${C.ink}`, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: MONO, fontWeight: 500, fontSize: 9, letterSpacing: "0.14em", color: C.cream }}>
            <span>● BINGOOO. STUDIO</span>
            <span style={{ background: C.ink, padding: "5px 8px" }}>LIVE PREVIEW</span>
          </div>
          <div style={{ position: "relative", background: hood ? "#E9DFCC" : ci === 1 ? "#E6DCC8" : C.cream, border: `2px solid ${C.ink}`, height: 320, marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <div style={{ position: "relative", width: 300, height: 300, transform: `scaleX(${rot})` }}>
              <Img key={gimg} src={staticFile(out(gimg))} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
              {!back && (
                <div style={{ position: "absolute", left: 0, right: 0, top: hood ? 118 : 100, display: "flex", flexDirection: "column", alignItems: "center", opacity: 1 }}>
                  <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 25, letterSpacing: "-0.04em", color: printInk, height: 30, whiteSpace: "nowrap" }}>
                    {text.slice(0, typed)}{typed >= 7 ? <span style={{ color: C.red }}>.</span> : null}
                  </div>
                  <div style={{ width: 70 * artIn, height: 4, background: C.red, marginTop: 4 }} />
                  <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 7.5, letterSpacing: "0.2em", color: printInk, opacity: artIn, marginTop: 6 }}>WEAR WHAT DEFINES YOU</div>
                </div>
              )}
              {back && (
                <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: "-0.05em", color: printInk, lineHeight: 0.9, opacity: clamp(f, 205, 225) }}>
                  YOUR<br />IDEA<span style={{ color: C.red }}>.</span>
                </div>
              )}
            </div>
            {/* selection handles while placing art */}
            {f > 100 && f < 150 && !back && (
              <div style={{ position: "absolute", left: 105, top: 98, width: 180, height: 72, border: `1.5px dashed ${C.red}` }} />
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <div style={{ display: "flex", background: "#fff", border: `2px solid ${C.ink}`, fontFamily: SANS, fontWeight: 800, fontSize: 11 }}>
              <div style={{ padding: "8px 14px", background: back ? "transparent" : C.ink, color: back ? C.ink : C.cream }}>FRONT</div>
              <div style={{ padding: "8px 14px", background: back ? C.ink : "transparent", color: back ? C.cream : C.ink }}>BACK</div>
            </div>
            <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 20, color: C.cream }}>₹{price}</div>
          </div>
        </div>
        <div style={{ padding: "16px 16px 0" }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 28, letterSpacing: "-0.05em", color: C.ink }}>BUILD YOURS<span style={{ color: C.red }}>.</span></div>
          <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}>
            {SW_COLORS.map((s, i) => (
              <div key={s.n} style={{ width: 34, height: 34, borderRadius: 17, background: s.c, border: `2px solid ${C.ink}`, boxShadow: i === ci ? `0 0 0 3px ${C.cream}, 0 0 0 5px ${C.red}` : "none" }} />
            ))}
            <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 10, letterSpacing: "0.14em", color: C.muted, marginLeft: 6 }}>{hood ? "HOODIE" : sw.n}</div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14, fontFamily: MONO, fontWeight: 500, fontSize: 9, letterSpacing: "0.1em" }}>
            {["T-SHIRT", "OVERSIZED", "HOODIE"].map((t, i) => {
              const on = hood ? i === 2 : i === 0;
              return <div key={t} style={{ padding: "8px 10px", border: `2px solid ${C.ink}`, background: on ? C.ink : "transparent", color: on ? C.cream : C.ink }}>{t}</div>;
            })}
          </div>
          <div style={{ marginTop: 14 }}><Btn bg={C.ink} fg={C.cream} press={f > 258 && f < 268 ? 1 : 0}>ADD TO CART — ₹{price}</Btn></div>
        </div>
      </div>
      <TabBar active={1} />
    </div>
  );
};

const Pay: React.FC<{ f: number }> = ({ f }) => (
  <div style={{ position: "absolute", inset: 0, background: C.cream, display: "flex", flexDirection: "column" }}>
    <Ticker /><Header />
    <div style={{ padding: "26px 18px" }}>
      <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 10, letterSpacing: "0.16em", color: C.muted }}>CHECKOUT</div>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, letterSpacing: "-0.05em", lineHeight: 0.95, color: C.ink, margin: "8px 0 22px" }}>SECURE &<br /><span style={{ color: C.red }}>PREPAID.</span></div>
      <div style={{ background: "#fff", border: `2px solid ${C.ink}`, boxShadow: `4px 4px 0 ${C.ink}`, padding: 14, display: "flex", gap: 12, alignItems: "center", opacity: clamp(f, 6, 22) }}>
        <div style={{ width: 66, height: 66, background: C.beige, display: "flex", alignItems: "center", justifyContent: "center" }}><Img src={staticFile(out("black-front.png"))} style={{ height: 58 }} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 14, color: C.ink }}>Custom Oversized Tee</div>
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 9, letterSpacing: "0.1em", color: C.muted, marginTop: 3 }}>BLACK · YOUR DESIGN</div>
        </div>
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 16 }}>₹699</div>
      </div>
      {[["PREPAID ORDERS ONLY", 28], ["FREE DELIVERY", 40], ["RAZORPAY SECURED", 52]].map(([t, d]) => {
        const e = clamp(f, d as number, (d as number) + 14);
        return (
          <div key={t as string} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, opacity: e, transform: `translateX(${(1 - e) * 30}px)` }}>
            <div style={{ width: 26, height: 26, borderRadius: 13, background: C.red, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={ICONS.check} size={16} /></div>
            <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 12, letterSpacing: "0.12em", color: C.ink }}>{t}</div>
          </div>
        );
      })}
      <div style={{ marginTop: 30 }}><Btn bg={C.red} fg={C.cream} press={f > 84 && f < 94 ? 1 : 0}>PAY ₹699 →</Btn></div>
    </div>
  </div>
);

/* ---------- phone shell + choreography ---------- */
const slideIn = (f: number, at: number) => ease(f, at, at + 14, 100, 0);

const TapDot: React.FC<{ f: number; at: number; x: number; y: number }> = ({ f, at, x, y }) => {
  const t = f - at;
  if (t < 0 || t > 22) return null;
  const grow = ease(t, 0, 22, 0.4, 1.7);
  return <div style={{ position: "absolute", left: x - 22, top: y - 22, width: 44, height: 44, borderRadius: 22, background: "rgba(230,50,28,.45)", border: `2px solid ${C.red}`, transform: `scale(${grow})`, opacity: 1 - t / 22, zIndex: 20 }} />;
};

const CAPS: [number, number, string, string][] = [
  [0, 150, "MEN'S STREETWEAR", "Wear what defines you"],
  [150, 330, "THE SHOP", "Tees, oversized & hoodies from ₹699"],
  [330, 600, "CUSTOM STUDIO", "Design it live. See it before you buy"],
  [600, 720, "CHECKOUT", "Prepaid, secure & delivered free"],
];

export const Showcase: React.FC = () => {
  const f = useCurrentFrame();
  const phoneIn = ease(f, 0, 26);
  const endOut = ease(f, SEG.end - 14, SEG.end + 6);
  // gentle camera: zoom into the studio, back out for payment
  const zoom = 1 + 0.04 * clamp(f, 340, 400) - 0.04 * clamp(f, 590, 620) + 0.01 * Math.sin(f / 40);
  const rotY = Math.sin(f / 70) * 2.2;
  const cap = CAPS.find(([a, b]) => f >= a && f < b);
  const capF = cap ? f - cap[0] : 0;

  const home = f < SEG.shop + 14;
  const shop = f >= SEG.shop && f < SEG.studio + 14;
  const studio = f >= SEG.studio && f < SEG.pay + 14;
  const pay = f >= SEG.pay;

  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <FontFaces />
      {/* backdrop */}
      <div style={{ position: "absolute", right: -60, top: 520, width: 560, height: 560, background: C.red, transform: `rotate(${12 + f / 40}deg) translateY(${(1 - phoneIn) * 200}px)`, opacity: 0.95 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 330, letterSpacing: "-0.06em", color: C.ink, opacity: 0.05, whiteSpace: "nowrap", transform: `translateX(${-f * 1.4}px)` }}>BINGOOO BINGOOO</div>

      {/* caption */}
      {cap && (
        <div style={{ position: "absolute", left: 80, right: 80, top: 120, opacity: ease(capF, 0, 8) * ease(capF, cap[1] - cap[0] - 8, cap[1] - cap[0], 1, 0) }}>
          <Rise delay={0}><div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 32, letterSpacing: "0.16em", color: C.red }}>{cap[2]}</div></Rise>
          <div style={{ width: ease(capF, 4, 24, 0, 120), height: 5, background: C.ink, margin: "16px 0 20px" }} />
          <Rise delay={5}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 78, letterSpacing: "-0.04em", lineHeight: 1.0, color: C.ink }}>{cap[3]}<Dot /></div></Rise>
        </div>
      )}

      {/* phone */}
      <div style={{ position: "absolute", left: (1080 - SW * SCALE) / 2, top: 410, width: SW * SCALE, height: SH * SCALE, transform: `translateY(${(1 - phoneIn) * 900 + endOut * 1400}px) scale(${zoom}) perspective(2000px) rotateY(${rotY}deg)`, transformOrigin: "50% 40%", opacity: phoneIn }}>
        <div style={{ position: "absolute", inset: -16, borderRadius: 84, background: "#0c0c0c", boxShadow: "0 50px 90px rgba(0,0,0,.45), inset 0 0 0 3px #2a2a2a" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 66, overflow: "hidden", background: C.cream }}>
          <div style={{ width: SW, height: SH, transform: `scale(${SCALE})`, transformOrigin: "0 0", position: "relative", overflow: "hidden" }}>
            {home && <Home f={f - SEG.home} />}
            {shop && <div style={{ position: "absolute", inset: 0, transform: `translateX(${slideIn(f, SEG.shop)}%)`, boxShadow: "-10px 0 30px rgba(0,0,0,.25)" }}><Shop f={f - SEG.shop} /></div>}
            {studio && <div style={{ position: "absolute", inset: 0, transform: `translateX(${slideIn(f, SEG.studio)}%)`, boxShadow: "-10px 0 30px rgba(0,0,0,.25)" }}><Studio f={f - SEG.studio} /></div>}
            {pay && <div style={{ position: "absolute", inset: 0, transform: `translateX(${slideIn(f, SEG.pay)}%)`, boxShadow: "-10px 0 30px rgba(0,0,0,.25)" }}><Pay f={f - SEG.pay} /></div>}
            {/* taps (screen coords) */}
            <TapDot f={f} at={SEG.home + 118} x={195} y={560} />
            <TapDot f={f} at={SEG.shop + 136} x={100} y={430} />
            <TapDot f={f} at={SEG.studio + 56} x={70} y={497} />
            <TapDot f={f} at={SEG.studio + 146} x={146} y={497} />
            <TapDot f={f} at={SEG.studio + 192} x={160} y={445} />
            <TapDot f={f} at={SEG.studio + 232} x={285} y={640} />
            <TapDot f={f} at={SEG.studio + 258} x={195} y={715} />
            <TapDot f={f} at={SEG.pay + 84} x={195} y={560} />
          </div>
          {/* notch */}
          <div style={{ position: "absolute", left: "50%", top: 14, width: 120, height: 34, marginLeft: -60, borderRadius: 17, background: "#0c0c0c" }} />
        </div>
      </div>

      {/* end card */}
      {f >= SEG.end - 10 && <EndCard f={f - (SEG.end - 10)} />}
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: C.cream, opacity: ease(f, 0, 14), alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30 }}>
    <Rise delay={4}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 84, color: C.ink, letterSpacing: "-0.03em" }}>Shop. Design. Wear<Dot /></div></Rise>
    <div style={{ width: ease(f, 14, 38, 0, 260), height: 5, background: C.red }} />
    <Rise delay={14}><div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 210, letterSpacing: "-0.045em", color: C.ink, lineHeight: 1 }}>BINGOOO<Dot /></div></Rise>
    <Rise delay={26}><div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 52, letterSpacing: "0.08em", color: C.red }}>bingooo.co.in</div></Rise>
    <Rise delay={34}><div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 36, letterSpacing: "0.1em", color: C.ink }}>WhatsApp 7981787317 · Prepaid only</div></Rise>
    <Rise delay={40}><div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 32, letterSpacing: "0.1em", color: C.muted }}>T-SHIRT ₹699 · OVERSIZED ₹699 · HOODIE ₹849</div></Rise>
  </AbsoluteFill>
);
