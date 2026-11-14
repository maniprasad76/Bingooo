import React, { createContext, useContext } from "react";
export const PartsCtx = createContext<number[]>([0]);
/** Frame offsets (relative to the scene start) at which each spoken part begins. */
export const useP = () => useContext(PartsCtx);
