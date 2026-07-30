"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { setPointer, setScroll } from "@/lib/scrollStore";

/**
 * Lenis smooth scroll, driving the module-level scroll store.
 *
 * Deliberately NOT scroll-jacking: wheel input still maps 1:1 to distance, we
 * only smooth the interpolation. Anchor jumps and keyboard scroll keep working.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reduced) {
      const lenis = new Lenis({
        duration: 1.05,
        easing: (t) => 1 - Math.pow(1 - t, 3),
        gestureOrientation: "vertical",
        smoothWheel: true,
        // Native momentum on touch beats anything we'd fake.
        syncTouch: false,
        touchMultiplier: 1.6,
      });
      lenisRef.current = lenis;

      lenis.on("scroll", ({ scroll, limit, velocity }: { scroll: number; limit: number; velocity: number }) => {
        setScroll(scroll, limit > 0 ? scroll / limit : 0, velocity);
      });

      let raf = 0;
      const loop = (time: number) => {
        lenis.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      // Make in-page anchors go through Lenis.
      const onClick = (e: MouseEvent) => {
        const link = (e.target as HTMLElement)?.closest?.('a[href^="#"]');
        if (!link) return;
        const id = link.getAttribute("href")!.slice(1);
        const el = id ? document.getElementById(id) : document.body;
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el, { offset: 0, duration: 1.3 });
      };
      document.addEventListener("click", onClick);

      return () => {
        document.removeEventListener("click", onClick);
        cancelAnimationFrame(raf);
        lenis.destroy();
        lenisRef.current = null;
      };
    }

    // Reduced motion: keep the store fed from native scroll.
    const onScroll = () => {
      const limit = document.documentElement.scrollHeight - window.innerHeight;
      setScroll(window.scrollY, limit > 0 ? window.scrollY / limit : 0, 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Pointer feeds the same store, normalized to -1..1.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      setPointer(
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
        true,
      );
    };
    const onLeave = () => setPointer(0, 0, false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <>{children}</>;
}
