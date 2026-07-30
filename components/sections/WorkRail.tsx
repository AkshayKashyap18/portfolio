"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  KIND_LABEL,
  profile,
  projects,
  type Project,
  type ProjectKind,
} from "@/lib/data";
import { measureBeats } from "@/lib/beats";
import { easeExpo, inView, reveal, stagger } from "@/lib/motion";
import KineticText from "@/components/ui/KineticText";
import SegmentedControl, { type Segment } from "@/components/ui/SegmentedControl";
import ArchitectureDiagram from "./ArchitectureDiagram";

const ACCENT = {
  violet: "text-violet",
  cyan: "text-cyan",
  lime: "text-lime",
} as const;

const ACCENT_BORDER = {
  violet: "border-violet/50",
  cyan: "border-cyan/50",
  lime: "border-lime/50",
} as const;

function Panel({ project, index }: { project: Project; index: number }) {
  return (
    <article
      id={`project-${project.slug}`}
      className="relative flex h-full w-[88vw] max-w-[980px] shrink-0 flex-col justify-center sm:w-[76vw]"
    >
      {/*
        Container query, not a viewport breakpoint. These cards sit in a
        horizontal rail at ~76vw, so the viewport width says nothing useful about
        how much room the card actually has — its own inline size does.
      */}
      <div className="glass gradient-border relative overflow-hidden rounded-3xl p-6 @container sm:p-8">
        <span
          className="pointer-events-none absolute -top-8 right-5 font-mono text-[120px] leading-none font-bold text-white/[0.022] select-none sm:text-[170px]"
          aria-hidden
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="relative">
          {/* Header beside the diagram — keeps the card wide rather than tall */}
          <div className="grid gap-6 @[680px]:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p
                  className={`font-mono text-[10px] tracking-[0.22em] uppercase ${ACCENT[project.accent]}`}
                >
                  {project.tagline}
                </p>
                <span className="text-white/15">/</span>
                <p className="font-mono text-[10px] tracking-[0.18em] text-faint uppercase">
                  {KIND_LABEL[project.kind]}
                  {project.period ? ` · ${project.period}` : ""}
                </p>
              </div>

              <h3 className="mt-2 text-[clamp(1.6rem,3.2vw,2.6rem)] leading-[1.02] font-semibold tracking-[-0.035em]">
                {project.name}
              </h3>

              <p className="mt-2.5 text-[14px] leading-relaxed text-muted text-pretty">
                {project.hook}
              </p>

              {/* My role — the first thing an interviewer wants to know. */}
              {project.role && (
                <div className={`mt-4 border-l-2 pl-4 ${ACCENT_BORDER[project.accent]}`}>
                  <p className="font-mono text-[9px] tracking-[0.22em] text-text uppercase">
                    My role
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted text-pretty">
                    {project.role}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <ArchitectureDiagram project={project} />

              {/* Team outcomes, explicitly labelled as the team's. */}
              {project.teamMetrics && project.teamMetrics.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] tracking-[0.22em] text-faint uppercase">
                    Team outcome
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-x-6 gap-y-1">
                    {project.teamMetrics.map((m) => (
                      <div key={m.label}>
                        <p className="font-mono text-base font-semibold tabular-nums text-gradient">
                          {m.value}
                        </p>
                        <p className="font-mono text-[9px] tracking-wide text-faint">
                          {m.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Problem / Approach / Outcome across three columns, not stacked */}
          <dl className="mt-6 grid gap-5 border-t border-white/8 pt-5 @[560px]:grid-cols-3">
            {(
              [
                ["Problem", project.problem],
                ["Approach", project.approach],
                ["Outcome", project.outcome],
              ] as const
            ).map(([label, body]) => (
              <div key={label}>
                <dt
                  className={`font-mono text-[9px] tracking-[0.22em] uppercase ${ACCENT[project.accent]}`}
                >
                  {label}
                </dt>
                <dd className="mt-1.5 text-[12.5px] leading-relaxed text-muted text-pretty">
                  {body}
                </dd>
              </div>
            ))}
          </dl>

          {/* Stack + links */}
          <div className="mt-5 flex flex-wrap items-center gap-1.5 border-t border-white/8 pt-5">
            {project.stack.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] text-faint"
              >
                {t}
              </span>
            ))}

            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="code"
                className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-white/30 hover:text-text"
              >
                <Github className="size-3" />
                Repository
              </a>
            )}
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="open"
                className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-white/30 hover:text-text"
              >
                Live demo
                <ArrowUpRight className="size-3" />
              </a>
            )}
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
  // Default to production when it exists, otherwise the first group that does —
  // so the rail is never empty regardless of what's in data.ts.
  const [kind, setKind] = useState<ProjectKind>(() =>
    projects.some((p) => p.kind === "production") ? "production" : "personal",
  );

  const shown = useMemo(() => projects.filter((p) => p.kind === kind), [kind]);

  const segments: Segment[] = useMemo(
    () =>
      (["production", "personal"] as ProjectKind[])
        .map((k) => ({
          key: k,
          label: KIND_LABEL[k],
          count: projects.filter((p) => p.kind === k).length,
        }))
        .filter((s) => s.count > 0),
    [],
  );

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });

  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 26, restDelta: 0.0005 });
  const x = useTransform(smooth, [0, 1], [0, -distance]);

  // Measure how far the rail needs to travel. Re-runs when the tab changes,
  // because the card count — and therefore the distance — changes with it.
  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setDistance(Math.max(0, track.scrollWidth - window.innerWidth + 48));
      // The section's height derives from `distance`, so the particle-field beat
      // anchors must be recomputed or the formations drift out of sync.
      measureBeats();
    };
    measure();

    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [kind]);

  function switchKind(next: string) {
    if (next === kind) return;

    const apply = () => {
      setKind(next as ProjectKind);
      // Return to the start of the rail so the new group is read from card one.
      const el = outerRef.current;
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
      }
    };

    // Native View Transition so the rail morphs between groups instead of
    // hard-swapping. startViewTransition requires the DOM change to happen
    // synchronously inside its callback, hence flushSync.
    const startVT = (
      document as Document & {
        startViewTransition?: (cb: () => void) => { finished: Promise<void> };
      }
    ).startViewTransition;

    if (reduce || typeof startVT !== "function") {
      apply();
      return;
    }

    startVT.call(document, () => {
      flushSync(apply);
    });
  }

  const heading = (
    <>
      <motion.p
        variants={reveal}
        className="font-mono text-[10px] tracking-[0.28em] text-faint uppercase"
      >
        02 — Work
      </motion.p>
      <h2 className="mt-3 text-[clamp(1.8rem,4.4vw,3.4rem)] leading-none font-semibold tracking-[-0.04em]">
        <KineticText text="Things I've built" as="span" stagger={0.018} />
      </h2>
    </>
  );

  // Reduced motion / small screens keep a plain vertical stack.
  if (reduce) {
    return (
      <section id="work" className="scroll-mt-24 px-6 py-32">
        <div className="mx-auto max-w-[1180px]">
          {heading}
          <div className="mt-8">
            <SegmentedControl
              segments={segments}
              active={kind}
              onChange={(k) => setKind(k as ProjectKind)}
              ariaLabel="Filter work by type"
            />
          </div>
          <div className="mt-12 space-y-8">
            {shown.map((p, i) => (
              <Panel key={p.slug} project={p} index={i} />
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
      style={{ height: `calc(100svh + ${distance}px)` }}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <motion.div
          variants={stagger(0, 0.1)}
          initial="hidden"
          whileInView="show"
          viewport={inView}
          className="mx-auto mb-7 flex w-full max-w-[1180px] flex-col gap-5 px-6 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>{heading}</div>

          <motion.div variants={reveal} className="flex items-center gap-5">
            <SegmentedControl
              segments={segments}
              active={kind}
              onChange={switchKind}
              ariaLabel="Filter work by type"
            />

            {/* Rail progress */}
            <span className="hidden items-center gap-3 lg:flex">
              <span className="font-mono text-[10px] tracking-wider text-faint">SCROLL</span>
              <span className="relative block h-px w-24 bg-white/12">
                <motion.span
                  className="absolute inset-y-0 left-0 block bg-gradient-to-r from-violet to-cyan"
                  style={{ scaleX: smooth, transformOrigin: "left" }}
                />
              </span>
            </span>
          </motion.div>
        </motion.div>

        {/* The rail. Keyed on `kind` so switching groups replays the entrance. */}
        <motion.div
          key={kind}
          ref={trackRef}
          style={{ x }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeExpo }}
          className="work-rail-track flex h-[74vh] items-stretch gap-6 pl-6 will-change-transform sm:gap-8 sm:pl-[max(1.5rem,calc((100vw-1180px)/2))]"
        >
          {shown.map((p, i) => (
            <Panel key={p.slug} project={p} index={i} />
          ))}

          <div className="flex h-full w-[60vw] max-w-[420px] shrink-0 flex-col justify-center pr-6">
            <p className="font-mono text-[10px] tracking-[0.22em] text-faint uppercase">
              End of rail
            </p>
            <p className="mt-4 text-2xl font-medium tracking-[-0.03em] text-muted text-pretty">
              {kind === "production"
                ? "There's more I can't show publicly — happy to talk through it."
                : "More in progress — and one of them could be yours."}
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
