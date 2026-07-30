"use client";

import { useEffect } from "react";
import { measureBeats } from "@/lib/beats";

/**
 * Keeps the beat anchors in sync with the DOM. Section heights are not static —
 * the work rail sizes itself from measured content — so a one-time measure at
 * mount would drift.
 */
export default function BeatTracker() {
  useEffect(() => {
    measureBeats();

    // Re-measure after fonts land, since type metrics change section heights.
    const t = window.setTimeout(measureBeats, 600);
    document.fonts?.ready.then(measureBeats).catch(() => {});

    const ro = new ResizeObserver(measureBeats);
    ro.observe(document.body);

    window.addEventListener("resize", measureBeats);
    window.addEventListener("load", measureBeats);

    return () => {
      window.clearTimeout(t);
      ro.disconnect();
      window.removeEventListener("resize", measureBeats);
      window.removeEventListener("load", measureBeats);
    };
  }, []);

  return null;
}
