import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { C, SANS, FontFaces } from "./brand";
import { SEGS, TOTAL, sceneLen } from "./timing";
import { PartsCtx } from "./ctx";
import { Hook, Intro, Pick, Studio, Quality, NotJust, Created, Deliver, EndCard } from "./scenes";

const SCENES = [Hook, Intro, Pick, Studio, Quality, NotJust, Created, Deliver, EndCard];

const Caption: React.FC<{ text: string; frames: number }> = ({ text, frames }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 5, frames - 2, frames + 4], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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
      {SEGS.map((s, i) => {
        const S = SCENES[i];
        const fade = i === 0 ? 0 : 5;
        const offs = s.parts.map((p) => p.off + fade);
        return (
          <React.Fragment key={i}>
            <Sequence from={s.start - fade} durationInFrames={sceneLen(i) + fade}>
              <PartsCtx.Provider value={offs}><AbsoluteFill><S /></AbsoluteFill></PartsCtx.Provider>
            </Sequence>
            <Sequence from={s.start} durationInFrames={Math.ceil(s.dur * 30) + 10}>
              <Audio src={staticFile(`vo/${i}.wav`)} />
            </Sequence>
            {s.parts.map((p, j) => (
              <Sequence key={j} from={s.start + p.off} durationInFrames={Math.ceil(p.dur * 30) + 6}>
                <Caption text={p.text} frames={Math.ceil(p.dur * 30)} />
              </Sequence>
            ))}
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 12, width: `${(f / TOTAL) * 100}%`, background: C.red }} />
    </AbsoluteFill>
  );
};
