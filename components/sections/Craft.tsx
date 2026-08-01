import { achievements, certifications, education, experience, skills } from "@/lib/data";
import KineticText from "@/components/ui/KineticText";

/** Three marquee rows, alternating direction — motion without demanding a click. */
function StackMarquee() {
  const rows = [
    [...skills[0].items, ...skills[2].items],
    [...skills[1].items, ...skills[4].items],
    [...skills[3].items, ...skills[5].items],
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

/**
 * Beat 4 — stack, current role, study and recognition.
 *
 * Every reveal here runs on the native `view()` timeline via the `.sda`
 * utilities, so this section needs no motion library and no observer — the
 * compositor drives it.
 */
export default function Craft() {
  const job = experience[0];

  return (
    <section id="stack" className="relative scroll-mt-24 px-6 py-32 md:py-40">
      <div className="velocity-tilt mx-auto w-full max-w-[1180px]">
        <p className="sda font-mono text-[10px] tracking-[0.28em] text-faint uppercase">
          03 — Craft
        </p>

        <h2 className="mt-3 text-[clamp(1.8rem,4.4vw,3.4rem)] leading-none font-semibold tracking-[-0.024em]">
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
          <div className="sda-stagger">
            <p className="font-mono text-[10px] tracking-[0.22em] text-faint uppercase">
              Currently
            </p>

            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              <h3 className="text-2xl font-semibold tracking-[-0.03em]">{job.role}</h3>
              <span className="text-faint">/</span>
              <span className="text-xl text-gradient">{job.company}</span>
            </div>

            <p className="mt-1 font-mono text-[11px] text-faint">
              {job.start} — {job.end}
            </p>

            <ul className="mt-6 space-y-3">
              {job.bullets.slice(0, 3).map((b, i) => (
                <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-muted">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-violet/70" aria-hidden />
                  <span className="text-pretty">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Before that */}
          <div className="sda-stagger">
            <p className="font-mono text-[10px] tracking-[0.22em] text-faint uppercase">
              Study &amp; recognition
            </p>

            <div className="mt-5">
              {education.map((e) => (
                <div
                  key={e.degree}
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
                </div>
              ))}
            </div>

            <ul className="mt-6 space-y-2">
              {achievements.map((a) => (
                <li
                  key={a.title}
                  className="flex items-baseline gap-3 text-[13px] text-muted"
                >
                  <span className="font-mono text-[10px] text-violet">◆</span>
                  <span className="text-pretty">{a.title}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-1.5">
              {certifications.map((c) => (
                <span
                  key={c.name}
                  className="rounded-full border border-white/8 px-2.5 py-1 font-mono text-[10px] text-faint"
                >
                  {c.name} · {c.issuer}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
