"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * `useReducedMotion`, but safe to branch rendered markup on.
 *
 * The server has no media query to read, so it always renders the full-motion
 * tree. If a component's MARKUP depends on the preference, the client's first
 * render disagrees with that HTML and React reports a hydration failure, throws
 * the tree away and rebuilds it — and it happens to exactly the users who asked
 * for less motion, who are the least well served by a re-render storm.
 *
 * Deferring the answer until after mount makes the first client render match the
 * server byte for byte, then re-renders once with the real preference.
 *
 * Only needed where the preference changes structure or attributes. Components
 * that read it inside effects or event handlers can use framer's hook directly.
 */
export function useReducedMotionSafe(): boolean {
  const prefers = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return mounted ? !!prefers : false;
}
