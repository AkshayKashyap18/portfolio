"use client";

import { useEffect } from "react";
import { scrollState } from "@/lib/scrollStore";

/**
 * Velocity-reactive scroll skew.
 *
 * Reads the same Lenis velocity the particle field already uses and turns it
 * into a small shear + vertical stretch on the reading columns: the page leans
 * into a fast scroll and settles crisp the instant you stop. It's written to
 * two CSS custom properties on <html>, so a single JS write per frame drives
 * every `.velocity-tilt` element — the shear itself runs on the compositor.
 *
 * Kept off the sticky work rail and applied only to contained max-width
 * wrappers, so it never shears a full-bleed section or breaks a pinned layout.
 */
export default function ScrollVelocity() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    const MAX_SKEW = 1.9; // degrees — subtle; only fully reached on a hard fling

    let skew = 0;
    let stretch = 1;
    let lastY = scrollState.y;
    let raf = 0;

    const loop = () => {
      // If the scroll position hasn't moved this frame, the page is idle —
      // force the target to zero so the skew always eases back to flat, even
      // if the last emitted velocity was stale.
      const moving = scrollState.y !== lastY;
      lastY = scrollState.y;

      const raw = moving ? scrollState.velocity * 0.16 : 0;
      const target = Math.max(-MAX_SKEW, Math.min(MAX_SKEW, raw));

      // Exponential approach doubles as the decay-to-flat when target is 0.
      skew += (target - skew) * 0.12;
      const targetStretch = 1 + Math.min(Math.abs(skew) / MAX_SKEW, 1) * 0.02;
      stretch += (targetStretch - stretch) * 0.12;

      root.style.setProperty("--sv-skew", `${skew.toFixed(3)}deg`);
      root.style.setProperty("--sv-stretch", stretch.toFixed(4));

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      root.style.removeProperty("--sv-skew");
      root.style.removeProperty("--sv-stretch");
    };
  }, []);

  return null;
}
