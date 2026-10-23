import { Composition } from "remotion";
import { Ad } from "./Ad";
import { Real, RealLong, REAL_LONG_TOTAL, REAL_TOTAL } from "./Real";
import { TOTAL } from "./timing";

export const Root = () => (
  <>
    <Composition id="Ad" component={Ad} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="Real" component={Real} durationInFrames={REAL_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="RealLong" component={RealLong} durationInFrames={REAL_LONG_TOTAL} fps={30} width={1080} height={1920} />
    <Composition id="RealLongFeed" component={RealLong} durationInFrames={REAL_LONG_TOTAL} fps={30} width={1080} height={1350} />
    <Composition id="RealLongSquare" component={RealLong} durationInFrames={REAL_LONG_TOTAL} fps={30} width={1080} height={1080} />
  </>
);
