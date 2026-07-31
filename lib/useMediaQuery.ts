"use client";

import { useEffect, useState } from "react";

/**
 * A media query that is safe to branch markup on.
 *
 * The server has no viewport to measure, so it can only ever render one answer.
 * Returning the real result on the very first client render would therefore
 * disagree with the server's HTML and cost a hydration error plus a full tree
 * rebuild. This reports `false` until after mount, then re-renders once with the
 * truth — so the first paint matches the server byte for byte.
 *
 * Because of that, `false` means "no, or not known yet". Write the query so the
 * pessimistic branch is the safe one to show for a frame.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
