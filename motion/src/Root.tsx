import { Composition } from "remotion";
import { Ad } from "./Ad";
import { Real, REAL_TOTAL } from "./Real";
import { TOTAL } from "./timing";

export const Root = () => (
  <>
    <Composition id="Ad" component={Ad} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Real" component={Real} durationInFrames={REAL_TOTAL} fps={30} width={1080} height={1920} />
  </>
);
