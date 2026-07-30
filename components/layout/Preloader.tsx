"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  announceIntroDone,
  introState,
  markIntroPlayed,
  shouldPlayIntro,
  skipIntro,
} from "@/lib/intro";
import { easeExpo } from "@/lib/motion";

/**
 * Timeline (ms from mount):
 *   0 →1500   counter runs 000 → 100
 *   1350→2750 particle field blooms out of the singularity
 *   1680      curtain starts lifting — so the bloom is *visible through* it,
 *             rather than completing behind an opaque panel
 */
const COUNT_MS = 1500;
const BLOOM_START = 1350;
const BLOOM_MS = 1400;
const LIFT_AT = 1680;

/**
 * The curtain. While it's up, the particle field blooms out of a singularity —
 * so the reveal and the field are one gesture rather than two.
 */
export default function Preloader() {
  const [playing, setPlaying] = useState(false);
  const [pct, setPct] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (!shouldPlayIntro()) {
      skipIntro();
      return;
    }

    setPlaying(true);
    // Nothing should scroll under the curtain.
    document.documentElement.style.overflow = "hidden";

    let raf = 0;
    let lifted = false;
    const start = performance.now();

    const tick = (now: number) => {
      // rAF's timestamp is the frame start, which can precede `start` — without
      // the lower clamp the counter flashes a negative value on frame one.
      const elapsed = Math.max(0, now - start);

      const countT = Math.min(1, elapsed / COUNT_MS);
      setPct(Math.round(countT * 100));

      // Expo-out bloom: particles burst outward fast, then settle.
      const bloomT = Math.max(0, Math.min(1, (elapsed - BLOOM_START) / BLOOM_MS));
      introState.t = 1 - Math.pow(1 - bloomT, 3);

      if (!lifted && elapsed >= LIFT_AT) {
        lifted = true;
        markIntroPlayed();
        document.documentElement.style.overflow = "";
        setPlaying(false);
        announceIntroDone();
      }

      if (bloomT < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        introState.active = false;
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.style.overflow = "";
    };
  }, []);

  // Never server-render the curtain — it would flash for reduced-motion users.
  if (!mounted) return null;

  return (
    <AnimatePresence>
      {playing && (
        <motion.div
          data-intro-curtain="true"
          data-pct={pct}
          className="fixed inset-0 z-[200] flex flex-col justify-end bg-bg px-6 pb-10"
          exit={{ y: "-100%" }}
          transition={{ duration: 1, ease: easeExpo }}
        >
          <div className="mx-auto flex w-full max-w-[1180px] items-end justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-faint uppercase">
                Akshay Kashyap
              </p>
              <p className="mt-2 font-mono text-[10px] tracking-[0.3em] text-violet uppercase">
                AI Developer
              </p>
            </div>

            <span className="font-mono text-[clamp(3rem,10vw,7rem)] leading-none font-semibold tabular-nums text-text/90">
              {String(pct).padStart(3, "0")}
            </span>
          </div>

          {/* Loading rule */}
          <div className="mx-auto mt-6 w-full max-w-[1180px]">
            <div className="h-px w-full bg-white/10">
              <motion.div
                className="h-px bg-gradient-to-r from-violet to-cyan"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
