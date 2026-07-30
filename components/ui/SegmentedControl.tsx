"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { springSnappy } from "@/lib/motion";

export type Segment = { key: string; label: string; count: number };

type Props = {
  segments: Segment[];
  active: string;
  onChange: (key: string) => void;
  ariaLabel: string;
};

/**
 * Accessible tab switcher. Roving tabindex + arrow keys, per the ARIA tabs
 * pattern — so it's keyboard-navigable rather than just clickable.
 */
export default function SegmentedControl({ segments, active, onChange, ariaLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  function onKeyDown(e: React.KeyboardEvent) {
    const i = segments.findIndex((s) => s.key === active);
    if (i < 0) return;

    let next = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % segments.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      next = (i - 1 + segments.length) % segments.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = segments.length - 1;
    else return;

    e.preventDefault();
    onChange(segments[next].key);
    // Move focus with the selection, as the tabs pattern requires.
    ref.current
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      ?.[next]?.focus();
  }

  return (
    <div
      ref={ref}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className="glass inline-flex gap-1 rounded-full p-1"
    >
      {segments.map((s) => {
        const isActive = s.key === active;
        return (
          <button
            key={s.key}
            role="tab"
            type="button"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(s.key)}
            data-cursor={isActive ? undefined : "switch"}
            className={`relative rounded-full px-4 py-2 text-[13px] transition-colors duration-300 sm:px-5 ${
              isActive ? "text-text" : "text-muted hover:text-text"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="segment-pill"
                transition={springSnappy}
                className="absolute inset-0 rounded-full border border-white/12 bg-white/[0.07]"
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap">
              {s.label}
              <span
                className={`font-mono text-[10px] tabular-nums transition-colors ${
                  isActive ? "text-violet" : "text-faint"
                }`}
              >
                {s.count}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
