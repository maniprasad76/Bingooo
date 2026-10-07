import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";
import { C, SANS, FontFaces } from "./brand";
import { LINES, TOTAL, sceneLen } from "./timing";
import { Hook, Intro, Pick, Studio, Quality, Deliver, EndCard } from "./scenes";

const SCENES = [Hook, Intro, Pick, Studio, Quality, Deliver, EndCard];

const Caption: React.FC<{ text: string; len: number; dur: number }> = ({ text, len, dur }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 5, dur * 30 - 3, dur * 30 + 4], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 70, right: 70, bottom: 330, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 50, lineHeight: 1.2, textAlign: "center", color: "#fff", background: "rgba(23,23,23,0.86)", padding: "20px 34px", borderRadius: 14 }}>{text}</div>
    </div>
  );
};

export const Ad: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <FontFaces />
      {LINES.map((l, i) => {
        const S = SCENES[i];
        const fade = i === 0 ? 0 : 5;
        return (
          <React.Fragment key={i}>
            <Sequence from={l.start - fade} durationInFrames={sceneLen(i) + fade}>
              <AbsoluteFill style={{ opacity: fade ? undefined : 1 }}><S /></AbsoluteFill>
            </Sequence>
            <Sequence from={l.start} durationInFrames={Math.ceil(l.dur * 30) + 8}>
              <Audio src={staticFile(`vo/${i}.wav`)} />
              <Caption text={l.text} len={sceneLen(i)} dur={l.dur} />
            </Sequence>
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 12, width: `${(f / TOTAL) * 100}%`, background: C.red }} />
    </AbsoluteFill>
  );
};
