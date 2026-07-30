"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Decodes text out of scrambling katakana, resolving left to right.
 *
 * Halfwidth katakana (U+FF66–FF9D), which is the form the aesthetic comes from.
 *
 * Layout is reserved rather than trusted: the mono font falls back to a system
 * face for katakana, which is *not* monospaced, so letting the glyphs drive
 * layout made the nav visibly jitter between 57 and 69px mid-decode. An
 * invisible copy of the final string holds the exact final box, and the animating
 * text is absolutely positioned on top of it.
 */
const GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";

/** How long before each successive character locks in. */
const LOCK_STEP_MS = 46;
/** How often unresolved characters pick a new glyph. */
const CHURN_MS = 38;

type Props = {
  text: string;
  className?: string;
  /** Characters to tint with the accent colour once resolved, e.g. ".". */
  accent?: string;
  /** Increment to replay the decode. */
  trigger?: number;
  /** Whether to decode once on mount. */
  playOnMount?: boolean;
};

export default function ScrambleText({
  text,
  className = "",
  accent,
  trigger = 0,
  playOnMount = true,
}: Props) {
  const reduce = useReducedMotion();
  // Starts as the real text so the server and client markup agree — the churn
  // begins on the first frame after hydration, so there's no flash of nothing.
  const [frame, setFrame] = useState<string>(text);
  const raf = useRef(0);

  useEffect(() => {
    if (reduce) {
      setFrame(text);
      return;
    }
    // Skip the mount run if it wasn't asked for, but always run on a trigger bump.
    if (!playOnMount && trigger === 0) {
      setFrame(text);
      return;
    }

    const start = performance.now();
    let lastChurn = 0;
    let churned = text;

    const tick = (now: number) => {
      const elapsed = now - start;
      const locked = Math.floor(elapsed / LOCK_STEP_MS);

      if (now - lastChurn >= CHURN_MS) {
        lastChurn = now;
        churned = [...text]
          .map((ch, i) => {
            if (i < locked) return ch;
            // Preserve spaces so word shapes stay readable mid-decode.
            if (ch === " ") return ch;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("");
        setFrame(churned);
      }

      if (locked <= text.length) {
        raf.current = requestAnimationFrame(tick);
      } else {
        setFrame(text);
      }
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, trigger, reduce]);

  const resolved = frame === text;

  return (
    <span className={className} aria-label={text}>
      <span className="relative inline-block">
        {/* Reserves the exact final box so nothing around it can shift.
            select-none keeps it out of copied text. */}
        <span className="invisible select-none" aria-hidden>
          {text}
        </span>
        <span className="absolute top-0 left-0 whitespace-nowrap" aria-hidden>
          {[...frame].map((ch, i) => (
            <span key={i} className={accent && ch === accent && resolved ? "text-violet" : undefined}>
              {ch}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}
