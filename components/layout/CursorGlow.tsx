"use client";

import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Desktop-only: a soft spotlight following the pointer, plus a small ring that
 * morphs into a labelled pill over anything carrying `data-cursor`.
 */
export default function CursorGlow() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

  const gx = useMotionValue(-500);
  const gy = useMotionValue(-500);
  const rx = useSpring(gx, { stiffness: 400, damping: 34, mass: 0.3 });
  const ry = useSpring(gy, { stiffness: 400, damping: 34, mass: 0.3 });

  useEffect(() => {
    // Only on devices with a real pointer.
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);

    function onMove(e: MouseEvent) {
      gx.set(e.clientX);
      gy.set(e.clientY);

      const el = (e.target as HTMLElement)?.closest?.("[data-cursor]");
      setLabel(el?.getAttribute("data-cursor") ?? null);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [gx, gy]);

  if (!enabled || reduce) return null;

  return (
    <>
      {/* Spotlight */}
      <motion.div
        className="ats-hide pointer-events-none fixed z-0 hidden md:block"
        style={{
          left: gx,
          top: gy,
          x: "-50%",
          y: "-50%",
          width: 520,
          height: 520,
          background:
            "radial-gradient(circle, rgba(124,92,255,0.10) 0%, transparent 62%)",
        }}
        aria-hidden
      />

      {/* Morphing ring / label */}
      <motion.div
        className="ats-hide pointer-events-none fixed z-[80] hidden items-center justify-center md:flex"
        style={{ left: rx, top: ry, x: "-50%", y: "-50%" }}
        animate={{
          width: label ? "auto" : 26,
          height: label ? 30 : 26,
          opacity: 1,
        }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden
      >
        <motion.div
          animate={{
            backgroundColor: label ? "rgba(124,92,255,0.92)" : "rgba(124,92,255,0)",
            borderColor: label ? "rgba(124,92,255,0)" : "rgba(237,237,242,0.45)",
          }}
          transition={{ duration: 0.25 }}
          className="flex items-center justify-center rounded-full border px-3 py-1 backdrop-blur-sm"
          style={{ minWidth: 26, minHeight: 26 }}
        >
          {label && (
            <motion.span
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="font-mono text-[10px] font-medium tracking-wider whitespace-nowrap text-white uppercase"
            >
              {label}
            </motion.span>
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
