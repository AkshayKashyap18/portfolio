"use client";

import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Command, FileText, Menu, X } from "lucide-react";
import { useState } from "react";
import { navSections, profile } from "@/lib/data";
import { easeExpo, springSnappy } from "@/lib/motion";
import { useActiveSection } from "@/lib/useActiveSection";

const ids = navSections.map((s) => s.id);

export default function Nav({ onOpenPalette }: { onOpenPalette: () => void }) {
  const active = useActiveSection(ids);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40));

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: easeExpo, delay: 0.2 }}
        className="ats-hide fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
      >
        <nav
          className={`flex w-full max-w-[1120px] items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 ${
            scrolled ? "glass" : "border border-transparent"
          }`}
        >
          {/* Monogram */}
          <a
            href="#top"
            className="group flex items-center gap-2.5 pl-1"
            aria-label="Back to top"
          >
            <span className="relative grid size-8 place-items-center rounded-lg bg-gradient-to-br from-violet to-cyan font-mono text-[13px] font-bold text-white">
              AK
            </span>
            <span className="hidden font-mono text-xs tracking-tight text-muted transition-colors group-hover:text-text sm:block">
              {profile.firstName.toLowerCase()}
              <span className="text-violet">.</span>
              dev
            </span>
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
