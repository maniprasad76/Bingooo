import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig, staticFile } from "remotion";

export const C = { cream: "#F7EEDB", ink: "#171717", red: "#E6321C", beige: "#EDE0CC", border: "#DDD3C5", muted: "#6F6A63" };
export const SANS = "Manrope, sans-serif";
export const MONO = "'IBM Plex Mono', monospace";

export const FontFaces = () => (
  <style>{`
    @font-face{font-family:Manrope;font-weight:500;src:url(${staticFile("fonts/manrope-latin-500-normal.woff2")})}
    @font-face{font-family:Manrope;font-weight:800;src:url(${staticFile("fonts/manrope-latin-800-normal.woff2")})}
    @font-face{font-family:'IBM Plex Mono';font-weight:500;src:url(${staticFile("fonts/ibm-plex-mono-latin-500-normal.woff2")})}
  `}</style>
);

export const useSpring = (delay = 0, damping = 18) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness: 120 } });
};

export const ease = (f: number, from: number, to: number, a = 0, b = 1) =>
  interpolate(f, [from, to], [a, b], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** Text that rises out of a clipping mask. */
export const Rise: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay = 0, children, style }) => {
  const s = useSpring(delay, 20);
  return (
    <div style={{ overflow: "hidden", ...style }}>
      <div style={{ transform: `translateY(${(1 - s) * 110}%)` }}>{children}</div>
    </div>
  );
};

export const Dot = () => <span style={{ color: C.red }}>.</span>;

export const Label: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = C.muted, style }) => (
  <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 34, letterSpacing: "0.14em", color, textTransform: "uppercase", ...style }}>{children}</div>
);

export const Check = ({ size = 56 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" strokeWidth={2} />
    <path d="M7.5 12.5l3 3 6-7" />
  </svg>
);
