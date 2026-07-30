"use client";

import { motion } from "framer-motion";
import { BEAT_IDS } from "@/lib/beats";
import { springSnappy } from "@/lib/motion";
import { useActiveSection } from "@/lib/useActiveSection";

/**
 * Fixed vertical rail: which beat you're in, and what the field is doing.
 * Doubles as navigation. Desktop only — on mobile it would just be clutter.
 */
const LABELS: Record<string, { name: string; formation: string }> = {
  top: { name: "Intro", formation: "nebula" },
  about: { name: "Who", formation: "initials" },
  work: { name: "Work", formation: "lattice" },
  stack: { name: "Craft", formation: "sphere" },
  playground: { name: "Play", formation: "wave" },
  contact: { name: "Contact", formation: "collapse" },
};

export default function BeatRail() {
  const active = useActiveSection(BEAT_IDS);

  return (
    <nav
      className="ats-hide fixed top-1/2 right-6 z-40 hidden -translate-y-1/2 flex-col gap-1 xl:flex"
      aria-label="Section progress"
    >
      {BEAT_IDS.map((id, i) => {
        const isActive = active === id;
        const meta = LABELS[id];

        return (
          <a
            key={id}
            href={`#${id}`}
            className="group flex items-center justify-end gap-3 py-1.5"
            aria-current={isActive ? "true" : undefined}
          >
            {/*
              Labels appear on hover only. They used to sit permanently over the
              full-bleed work rail and collide with card copy; the dashes alone
              read as chrome and never fight content.
            */}
            <span
              className={`rounded-full bg-bg/70 px-2 py-0.5 font-mono text-[9px] tracking-[0.2em] uppercase opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 ${
                isActive ? "text-text" : "text-faint"
              }`}
            >
              {meta.name}
              <span className="ml-2 text-violet/70">{meta.formation}</span>
            </span>

            <span className="relative grid h-3 w-6 place-items-center">
              <span
                className={`block h-px transition-all duration-500 ${
                  isActive ? "w-6 bg-gradient-to-r from-violet to-cyan" : "w-3 bg-white/25 group-hover:w-5 group-hover:bg-white/50"
                }`}
              />
              {isActive && (
                <motion.span
                  layoutId="beat-dot"
                  transition={springSnappy}
                  className="absolute -right-2 size-1 rounded-full bg-cyan"
                />
              )}
            </span>

            <span className="sr-only">
              Beat {i + 1}: {meta.name}
            </span>
          </a>
        );
      })}
    </nav>
  );
}
