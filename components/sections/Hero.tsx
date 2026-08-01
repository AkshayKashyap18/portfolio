"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { profile } from "@/lib/data";
import { easeExpo } from "@/lib/motion";
import { useIntroDone } from "@/lib/useIntroDone";
import KineticText from "@/components/ui/KineticText";

/**
 * Deliberately sparse. The particle field is the hero — the type just names who
 * you're looking at and gets out of the way.
 *
 * Everything here holds until the intro curtain starts lifting, so the entrance
 * plays in front of the visitor rather than behind an opaque overlay.
 */
export default function Hero() {
  const ready = useIntroDone();

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] flex-col justify-end px-6 pb-16 sm:pb-20"
    >
      <div className="velocity-tilt mx-auto w-full max-w-[1180px]">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 0.85 }}
          className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] tracking-[0.28em] text-muted uppercase [text-shadow:0_0_3px_rgba(10,9,8,0.98),0_0_9px_rgba(10,9,8,0.85),0_1px_14px_rgba(10,9,8,0.7)]"
        >
          <span className="text-text">{profile.focus}</span>
          <span className="hidden text-white/20 sm:inline">/</span>
          <span>{profile.location}</span>
          <span className="hidden text-white/20 sm:inline">/</span>
          <span className="hidden sm:inline">Selected work 2025—2026</span>
        </motion.div>

        {/* Name — the only large type on the screen */}
        <h1 className="text-[clamp(3rem,13vw,10.5rem)] leading-[0.85] font-semibold tracking-[-0.028em]">
          <KineticText
            text="Akshay"
            immediate
            play={ready}
            delay={0.1}
            stagger={0.045}
            as="span"
          />
          <span className="block text-muted/70">
            <KineticText
              text="Kashyap"
              immediate
              play={ready}
              delay={0.28}
              stagger={0.045}
              as="span"
            />
          </span>
        </h1>

        {/* One line. That's it. */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.9, delay: 0.6, ease: easeExpo }}
          className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
        >
          <p className="max-w-sm text-[15px] leading-relaxed text-muted text-pretty">
            {profile.pitch}
          </p>

          <a
            href="#work"
            data-cursor="scroll"
            className="group inline-flex shrink-0 items-center gap-3 font-mono text-[11px] tracking-[0.2em] text-muted uppercase transition-colors hover:text-text"
          >
            <span className="grid size-10 place-items-center rounded-full border border-white/15 transition-colors group-hover:border-violet/60">
              <ArrowDown className="size-3.5 transition-transform duration-500 group-hover:translate-y-0.5" />
            </span>
            See the work
          </a>
        </motion.div>
      </div>
    </section>
  );
}
