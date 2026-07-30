"use client";

import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Command, FileText, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navSections, profile } from "@/lib/data";
import { easeExpo, springSnappy } from "@/lib/motion";
import { useActiveSection } from "@/lib/useActiveSection";
import { useIntroDone } from "@/lib/useIntroDone";
import ScrambleText from "@/components/ui/ScrambleText";

const ids = navSections.map((s) => s.id);

export default function Nav({ onOpenPalette }: { onOpenPalette: () => void }) {
  const active = useActiveSection(ids);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Bumped on hover to replay the wordmark decode.
  const [scrambleKey, setScrambleKey] = useState(0);
  const { scrollY } = useScroll();
  const introDone = useIntroDone();
  const wasScrolled = useRef(false);

  useMotionValueEvent(scrollY, "change", (v) => {
    const next = v > 40;
    // Replay the decode each time you come back to the top, so it isn't a
    // one-time blink that's easy to miss.
    if (wasScrolled.current && !next) setScrambleKey((k) => k + 1);
    wasScrolled.current = next;
    setScrolled(next);
  });

  /**
   * Play it once the curtain is fully clear — not merely once it has *started*
   * lifting. The curtain exits upward over 1s, so the nav sits at the very last
   * strip of screen to be uncovered; firing on the lift itself still plays the
   * decode behind it.
   */
  useEffect(() => {
    if (!introDone) return;
    const t = window.setTimeout(() => setScrambleKey((k) => k + 1), 1050);
    return () => window.clearTimeout(t);
  }, [introDone]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: easeExpo, delay: 0.2 }}
        className="clean-hide fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
      >
        <nav
          className={`flex w-full max-w-[1120px] items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 ${
            scrolled ? "glass" : "border border-transparent"
          }`}
        >
          {/* Monogram — the wordmark decodes out of katakana on load and on hover */}
          <a
            href="#top"
            className="group flex items-center gap-2.5 pl-1"
            aria-label="Back to top"
            onMouseEnter={() => setScrambleKey((k) => k + 1)}
          >
            <span className="relative grid size-8 place-items-center rounded-lg bg-gradient-to-br from-violet to-cyan font-mono text-[13px] font-bold text-white">
              AK
            </span>
            <ScrambleText
              text={`${profile.firstName.toLowerCase()}.dev`}
              accent="."
              trigger={scrambleKey}
              // Never on mount: the intro curtain covers the screen for the first
              // ~1.7s, so a mount-time decode would play entirely behind it.
              playOnMount={false}
              className="block font-mono text-xs tracking-tight text-muted transition-colors group-hover:text-text"
            />
          </a>

          {/* Desktop links */}
          <ul className="hidden items-center gap-1 md:flex">
            {navSections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className={`relative block rounded-full px-3.5 py-1.5 text-[13px] transition-colors duration-300 ${
                    active === s.id ? "text-text" : "text-muted hover:text-text"
                  }`}
                >
                  {active === s.id && (
                    <motion.span
                      layoutId="nav-pill"
                      transition={springSnappy}
                      className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.06]"
                    />
                  )}
                  <span className="relative z-10">{s.label}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenPalette}
              className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-white/20 hover:text-text sm:flex"
              aria-label="Open command palette"
            >
              <Command className="size-3" />
              K
            </button>

            <a
              href={profile.resume}
              download
              className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-violet to-cyan px-4 py-1.5 text-[13px] font-medium text-white transition-transform duration-300 hover:scale-[1.03] sm:flex"
            >
              <FileText className="size-3.5" />
              Résumé
            </a>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid size-9 place-items-center rounded-full border border-white/10 text-muted md:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-4" />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] md:hidden"
          >
            <div
              className="absolute inset-0 bg-bg/80 backdrop-blur-xl"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.5, ease: easeExpo }}
              className="glass relative m-4 rounded-3xl p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="font-mono text-xs tracking-[0.2em] text-faint uppercase">
                  Navigate
                </span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="grid size-9 place-items-center rounded-full border border-white/10 text-muted"
                  aria-label="Close menu"
                >
                  <X className="size-4" />
                </button>
              </div>
              <ul className="space-y-1">
                {navSections.map((s, i) => (
                  <motion.li
                    key={s.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.05, ease: easeExpo }}
                  >
                    <a
                      href={`#${s.id}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-baseline gap-3 border-b border-white/5 py-3 text-xl tracking-tight"
                    >
                      <span className="font-mono text-[11px] text-violet">
                        0{i + 1}
                      </span>
                      {s.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
              <a
                href={profile.resume}
                download
                className="mt-6 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet to-cyan py-3 text-sm font-medium text-white"
              >
                <FileText className="size-4" />
                Download résumé
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
