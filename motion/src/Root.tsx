import { Composition } from "remotion";
import { Ad } from "./Ad";
import { TOTAL } from "./timing";

export const Root = () => (
  <Composition id="Ad" component={Ad} durationInFrames={TOTAL} fps={30} width={1080} height={1920} />
);
