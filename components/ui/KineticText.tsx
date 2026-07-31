"use client";

import { motion } from "framer-motion";
import { easeExpo } from "@/lib/motion";
import { useReducedMotionSafe } from "@/lib/useReducedMotionSafe";

type Props = {
  text: string;
  className?: string;
  /** Seconds before the first character moves. */
  delay?: number;
  /** Seconds between characters. */
  stagger?: number;
  /** Animate on mount instead of on scroll into view. */
  immediate?: boolean;
  /** With `immediate`, hold in the hidden state until this flips true. */
  play?: boolean;
  as?: "h1" | "h2" | "h3" | "p" | "span";
};

/**
 * Per-character mask reveal: each glyph rises out of its own clipped box, so the
 * line assembles rather than fading. Words stay unbroken across line wraps and
 * the whole string is still one accessible label.
 */
export default function KineticText({
  text,
  className = "",
  delay = 0,
  stagger = 0.028,
  immediate = false,
  play = true,
  as = "span",
}: Props) {
  const reduce = useReducedMotionSafe();
  const Tag = motion[as];

  const words = text.split(" ");

  if (reduce) {
    return <Tag className={className}>{text}</Tag>;
  }

  const parent = {
    hidden: {},
    show: { transition: { delayChildren: delay, staggerChildren: stagger } },
  };

  const child = {
    hidden: { y: "108%", rotate: 4 },
    show: {
      y: "0%",
      rotate: 0,
      transition: { duration: 0.85, ease: easeExpo },
    },
  };

  let index = 0;

  return (
    <Tag
      className={className}
      variants={parent}
      initial="hidden"
      {...(immediate
        ? { animate: play ? "show" : "hidden" }
        : { whileInView: "show", viewport: { once: true, margin: "-12%" } })}
      aria-label={text}
    >
      {words.map((word, wi) => (
        <span key={`${word}-${wi}`} className="inline-block whitespace-nowrap">
          {[...word].map((ch) => (
            <span
              key={`${ch}-${index++}`}
              // The mask. Bottom padding keeps descenders from being clipped.
              className="inline-block overflow-hidden pb-[0.12em] align-bottom"
              aria-hidden
            >
              <motion.span variants={child} className="inline-block will-change-transform">
                {ch}
              </motion.span>
            </span>
          ))}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </Tag>
  );
}
