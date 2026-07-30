import type { SpringOptions, Transition, Variants } from "framer-motion";

/** Shared easing — every entrance on the site uses this curve. */
export const easeExpo = [0.16, 1, 0.3, 1] as const;

/** Bare spring config for `useSpring` (which rejects a full Transition). */
export const springSoftOptions: SpringOptions = { stiffness: 120, damping: 20 };

export const springSoft: Transition = {
  type: "spring",
  ...springSoftOptions,
};

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 280,
  damping: 28,
};

/** The canonical scroll reveal: fade + rise + de-blur. */
export const reveal: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: easeExpo },
  },
};

export const revealFast: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeExpo } },
};

/** Parent that staggers its children. */
export const stagger = (delayChildren = 0, staggerChildren = 0.07): Variants => ({
  hidden: {},
  show: { transition: { delayChildren, staggerChildren } },
});

/** Per-character heading reveal. */
export const charReveal: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: easeExpo },
  },
};

/** Standard in-view trigger config. */
export const inView = { once: true, margin: "-15% 0px -15% 0px" } as const;
