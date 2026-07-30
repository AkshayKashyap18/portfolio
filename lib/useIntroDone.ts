"use client";

import { useEffect, useState } from "react";
import { INTRO_DONE_EVENT, introState } from "@/lib/intro";

/**
 * True once the curtain begins lifting. The hero waits on this so its
 * per-character reveal isn't spent behind an opaque overlay.
 */
export function useIntroDone(): boolean {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!introState.active) {
      setDone(true);
      return;
    }
    const onDone = () => setDone(true);
    window.addEventListener(INTRO_DONE_EVENT, onDone);
    return () => window.removeEventListener(INTRO_DONE_EVENT, onDone);
  }, []);

  return done;
}
