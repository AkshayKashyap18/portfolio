"use client";

import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { springSoftOptions } from "@/lib/motion";

type Props = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  download?: boolean;
  external?: boolean;
  className?: string;
  cursorLabel?: string;
};

/**
 * Button that leans toward the cursor. Magnetism is capped at 6px so it reads
 * as responsiveness rather than a gimmick.
 */
export default function MagneticButton({
  children,
  href,
  onClick,
  variant = "primary",
  download,
  external,
  className = "",
  cursorLabel,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, springSoftOptions);
  const y = useSpring(rawY, springSoftOptions);

  function handleMove(e: React.MouseEvent) {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    rawX.set(Math.max(-6, Math.min(6, dx * 0.25)));
    rawY.set(Math.max(-6, Math.min(6, dy * 0.25)));
  }

  function handleLeave() {
    rawX.set(0);
    rawY.set(0);
  }

  const base =
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-medium transition-colors duration-300 will-change-transform";

  const styles =
    variant === "primary"
      ? "text-white shadow-[0_10px_40px_-12px_rgba(124,92,255,0.7)]"
      : "glass gradient-border text-muted hover:text-text";

  const inner = (
    <>
      {variant === "primary" && (
        <span className="absolute inset-0 bg-gradient-to-r from-violet to-cyan transition-transform duration-500 group-hover:scale-110" />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </>
  );

  const motionProps = {
    ref: ref as never,
    style: { x, y },
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
    className: `${base} ${styles} ${className}`,
    "data-cursor": cursorLabel,
  };

  if (href) {
    return (
      <motion.a
        {...motionProps}
        href={href}
        download={download}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.button {...motionProps} onClick={onClick} type="button">
      {inner}
    </motion.button>
  );
}
