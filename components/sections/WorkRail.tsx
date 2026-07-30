"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { profile, projects, type Project } from "@/lib/data";
import { easeExpo, inView, reveal, stagger } from "@/lib/motion";
import KineticText from "@/components/ui/KineticText";
import ArchitectureDiagram from "./ArchitectureDiagram";

const ACCENT = {
  violet: "text-violet",
  cyan: "text-cyan",
  lime: "text-lime",
} as const;

function Panel({ project, index }: { project: Project; index: number }) {
  return (
    <article
      id={`project-${project.slug}`}
      className="relative flex h-full w-[88vw] max-w-[980px] shrink-0 flex-col justify-center sm:w-[76vw]"
    >
      <div className="glass gradient-border relative overflow-hidden rounded-3xl p-7 sm:p-10">
        <span
          className="pointer-events-none absolute -top-8 right-5 font-mono text-[130px] leading-none font-bold text-white/[0.022] select-none sm:text-[190px]"
          aria-hidden
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="relative">
          <p
            className={`font-mono text-[10px] tracking-[0.22em] uppercase ${ACCENT[project.accent]}`}
          >
            {project.tagline}
          </p>

          <h3 className="mt-3 text-[clamp(1.9rem,4vw,3.1rem)] leading-[1.02] font-semibold tracking-[-0.035em]">
            {project.name}
          </h3>

          <p className="mt-4 max-w-lg text-[16px] leading-relaxed text-muted text-pretty">
            {project.hook}
          </p>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.95fr]">
            {/* Problem → approach → outcome, always visible. No click required. */}
            <dl className="space-y-4">
              {(
                [
                  ["Problem", project.problem],
                  ["Approach", project.approach],
                  ["Outcome", project.outcome],
                ] as const
              ).map(([label, body]) => (
                <div key={label} className="border-l border-white/10 pl-4">
                  <dt
                    className={`font-mono text-[9px] tracking-[0.22em] uppercase ${ACCENT[project.accent]}`}
                  >
                    {label}
                  </dt>
                  <dd className="mt-1.5 text-[13px] leading-relaxed text-muted text-pretty">
                    {body}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-col justify-between gap-5">
              <ArchitectureDiagram project={project} />

              <div>
                <div className="flex flex-wrap gap-1.5">
                  {project.stack.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] text-faint"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {project.repo ? (
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="code"
                      className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 font-mono text-[11px] text-muted transition-colors hover:border-white/30 hover:text-text"
                    >
                      <Github className="size-3" />
                      Repository
                    </a>
                  ) : (
                    <a
                      href={profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="github"
                      title="This repo isn't public yet — opens my GitHub profile"
                      className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 font-mono text-[11px] text-muted transition-colors hover:border-white/30 hover:text-text"
                    >
                      <Github className="size-3" />
                      GitHub profile
                    </a>
                  )}

                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="open"
                      className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 font-mono text-[11px] text-muted transition-colors hover:border-white/30 hover:text-text"
                    >
                      Live demo
                      <ArrowUpRight className="size-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function WorkRail() {
  const outerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [distance, setDistance] = useState(0);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });

  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 26, restDelta: 0.0005 });
  const x = useTransform(smooth, [0, 1], [0, -distance]);

  // Measure how far the rail actually needs to travel.
  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setDistance(Math.max(0, track.scrollWidth - window.innerWidth + 48));
    };
    measure();

    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Reduced motion / no-JS-friendly path: a plain vertical stack.
  if (reduce) {
    return (
      <section id="work" className="scroll-mt-24 px-6 py-32">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="text-[clamp(2rem,5vw,3.6rem)] font-semibold tracking-[-0.04em]">
            Selected work
          </h2>
          <div className="mt-12 space-y-8">
            {projects.map((p, i) => (
              <div key={p.slug} className="w-full">
                <Panel project={p} index={i} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={outerRef}
      id="work"
      className="relative scroll-mt-0"
      // Vertical room = horizontal distance, so the mapping feels 1:1.
      style={{ height: `calc(100svh + ${distance}px)` }}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        {/* Heading rides along the top of the pinned viewport */}
        <motion.div
          variants={stagger(0, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={inView}
          className="mx-auto mb-8 flex w-full max-w-[1180px] items-end justify-between gap-6 px-6"
        >
          <div>
            <motion.p
              variants={reveal}
              className="font-mono text-[10px] tracking-[0.28em] text-faint uppercase"
            >
              02 — Work
            </motion.p>
            <h2 className="mt-3 text-[clamp(1.8rem,4.4vw,3.4rem)] leading-none font-semibold tracking-[-0.04em]">
              <KineticText text="Things I've shipped" as="span" stagger={0.018} />
            </h2>
          </div>

          {/* Rail progress */}
          <motion.div variants={reveal} className="hidden shrink-0 items-center gap-3 sm:flex">
            <span className="font-mono text-[10px] tracking-wider text-faint">SCROLL</span>
            <span className="relative block h-px w-28 bg-white/12">
              <motion.span
                className="absolute inset-y-0 left-0 block bg-gradient-to-r from-violet to-cyan"
                style={{ scaleX: smooth, transformOrigin: "left" }}
              />
            </span>
          </motion.div>
        </motion.div>

        {/* The rail */}
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex h-[68vh] items-stretch gap-6 pl-6 will-change-transform sm:gap-8 sm:pl-[max(1.5rem,calc((100vw-1180px)/2))]"
        >
          {projects.map((p, i) => (
            <Panel key={p.slug} project={p} index={i} />
          ))}

          {/* Tail card so the rail resolves rather than just stopping */}
          <div className="flex h-full w-[60vw] max-w-[420px] shrink-0 flex-col justify-center pr-6">
            <p className="font-mono text-[10px] tracking-[0.22em] text-faint uppercase">
              End of rail
            </p>
            <p className="mt-4 text-2xl font-medium tracking-[-0.03em] text-muted text-pretty">
              More in progress — and one of them could be yours.
            </p>
            <a
              href="#contact"
              data-cursor="talk"
              className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-violet to-cyan px-5 py-2.5 text-[13px] font-medium text-white transition-transform duration-300 hover:scale-[1.03]"
            >
              Start a conversation
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
