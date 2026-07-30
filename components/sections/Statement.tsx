"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { profile } from "@/lib/data";
import KineticText from "@/components/ui/KineticText";

const FACTS = [
  { k: "Now", v: "AI Developer @ Alrium" },
  { k: "Studying", v: "B.E. AI & Data Science · 9.58 CGPA" },
  { k: "Based", v: "Bangalore, India" },
];

/**
 * Beat 2 — the particle field is spelling "AK" behind this, so the copy stays
 * short and the layout stays wide open.
 *
 * Reveals run on the native `view()` timeline (`.sda` classes). Framer is kept
 * only for the scroll-linked letter-spacing, which genuinely needs a scroll
 * progress value rather than a one-shot entrance.
 */
export default function Statement() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Words drift apart slightly as you scroll through — scrubbed, not triggered.
  const spread = useTransform(scrollYProgress, [0, 0.5, 1], ["0.06em", "-0.01em", "0.06em"]);

  return (
    <section
      ref={ref}
      id="about"
      className="relative flex min-h-[100svh] scroll-mt-24 items-center px-6 py-32"
    >
      <div className="mx-auto w-full max-w-[1180px]">
        <p className="sda mb-10 font-mono text-[10px] tracking-[0.28em] text-faint uppercase">
          01 — Who
        </p>

        <motion.h2
          style={{ letterSpacing: spread }}
          className="max-w-[19ch] text-[clamp(2.1rem,5.6vw,4.6rem)] leading-[1.02] font-semibold tracking-[-0.04em]"
        >
          <KineticText text="I build backends" as="span" stagger={0.02} />{" "}
          <span className="text-muted/40">
            <KineticText text="that think." as="span" delay={0.25} stagger={0.02} />
          </span>
        </motion.h2>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div className="sda-stagger space-y-5">
            {profile.bio.map((para, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "text-[19px] leading-relaxed text-text text-pretty sm:text-[21px]"
                    : "max-w-xl text-[15px] leading-relaxed text-muted text-pretty"
                }
              >
                {para}
              </p>
            ))}
          </div>

          {/* Facts, not a stats wall */}
          <dl className="self-start">
            {FACTS.map((f) => (
              <div
                key={f.k}
                className="sda-x flex items-baseline justify-between gap-6 border-b border-white/8 py-4"
              >
                <dt className="font-mono text-[10px] tracking-[0.2em] text-faint uppercase">
                  {f.k}
                </dt>
                <dd className="text-right text-[14px] text-muted">{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
