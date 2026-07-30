"use client";

import { motion } from "framer-motion";
import { achievements, certifications, education, experience, skills } from "@/lib/data";
import { easeExpo, inView, reveal, stagger } from "@/lib/motion";
import KineticText from "@/components/ui/KineticText";

/** Three marquee rows, alternating direction — motion without demanding a click. */
function StackMarquee() {
  const rows = [
    [...skills[0].items, ...skills[2].items],
    [...skills[1].items, ...skills[4].items],
    [...skills[3].items, ...skills[0].items.slice(0, 2)],
  ];

  return (
    <div className="mask-x space-y-3 overflow-hidden py-1" aria-hidden>
      {rows.map((row, i) => (
        <div key={i} className="flex w-max gap-3">
          <div
            className={`flex gap-3 ${i % 2 === 0 ? "marquee-track" : "marquee-track-reverse"}`}
            style={{ animationDuration: `${34 + i * 9}s` }}
          >
            {[...row, ...row, ...row].map((t, j) => (
              <span
                key={`${t}-${j}`}
                className="rounded-full border border-white/8 px-4 py-2 font-mono text-[12px] whitespace-nowrap text-muted"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Craft() {
  const job = experience[0];

  return (
    <section id="stack" className="relative scroll-mt-24 px-6 py-32 md:py-40">
      <div className="mx-auto w-full max-w-[1180px]">
        <motion.p
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={inView}
          className="font-mono text-[10px] tracking-[0.28em] text-faint uppercase"
        >
          03 — Craft
        </motion.p>

        <h2 className="mt-3 text-[clamp(1.8rem,4.4vw,3.4rem)] leading-none font-semibold tracking-[-0.04em]">
          <KineticText text="What I work with" as="span" stagger={0.018} />
        </h2>

        {/* Stack */}
        <div className="mt-12">
          <StackMarquee />
          {/* Screen readers get the real list, not the decorative marquee. */}
          <ul className="sr-only">
            {skills.flatMap((c) => c.items).map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>

        {/* Now / before */}
        <div className="mt-20 grid gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Currently */}
          <motion.div
            variants={stagger(0, 0.09)}
            initial="hidden"
            whileInView="show"
            viewport={inView}
          >
            <motion.p
              variants={reveal}
              className="font-mono text-[10px] tracking-[0.22em] text-faint uppercase"
            >
              Currently
            </motion.p>

            <motion.div variants={reveal} className="mt-5 flex items-baseline gap-3">
              <h3 className="text-2xl font-semibold tracking-[-0.03em]">{job.role}</h3>
              <span className="text-faint">/</span>
              <span className="text-xl text-gradient">{job.company}</span>
            </motion.div>

            <motion.p variants={reveal} className="mt-1 font-mono text-[11px] text-faint">
              {job.start} — {job.end}
            </motion.p>

            <motion.ul variants={stagger(0.05, 0.08)} className="mt-6 space-y-3">
              {job.bullets.slice(0, 3).map((b, i) => (
                <motion.li
                  key={i}
                  variants={{
                    hidden: { opacity: 0, x: -14 },
                    show: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.65, ease: easeExpo },
                    },
                  }}
                  className="flex gap-3 text-[14px] leading-relaxed text-muted"
                >
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-violet/70" aria-hidden />
                  <span className="text-pretty">{b}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Before that */}
          <motion.div
            variants={stagger(0.1, 0.07)}
            initial="hidden"
            whileInView="show"
            viewport={inView}
          >
            <motion.p
              variants={reveal}
              className="font-mono text-[10px] tracking-[0.22em] text-faint uppercase"
            >
              Study &amp; recognition
            </motion.p>

            <div className="mt-5 space-y-0">
              {education.map((e) => (
                <motion.div
                  key={e.degree}
                  variants={reveal}
                  className="flex items-baseline justify-between gap-6 border-b border-white/8 py-3.5"
                >
                  <div>
                    <p className="text-[14px] text-text">{e.degree}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-faint">
                      {e.institution} · {e.period}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[13px] tabular-nums text-gradient">
                    {e.score}
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.ul variants={stagger(0.15, 0.06)} className="mt-6 space-y-2">
              {achievements.map((a) => (
                <motion.li
                  key={a.title}
                  variants={reveal}
                  className="flex items-baseline gap-3 text-[13px] text-muted"
                >
                  <span className="font-mono text-[10px] text-violet">◆</span>
                  <span className="text-pretty">{a.title}</span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div variants={reveal} className="mt-6 flex flex-wrap gap-1.5">
              {certifications.map((c) => (
                <span
                  key={c.name}
                  className="rounded-full border border-white/8 px-2.5 py-1 font-mono text-[10px] text-faint"
                >
                  {c.name} · {c.issuer}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
