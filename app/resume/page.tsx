import type { Metadata } from "next";
import Link from "next/link";
import {
  achievements,
  certifications,
  education,
  profile,
  skills,
} from "@/lib/data";
import {
  resumeContact,
  resumeExperienceBullets,
  resumeJob,
  resumePersonal,
  resumeProduction,
  resumeSummary,
} from "@/lib/resume";
import PrintButton from "./PrintButton";
import "./print.css";

export const metadata: Metadata = {
  title: "Résumé",
  description: `${profile.name} — ${profile.roles[0]}, ${profile.location}.`,
  /*
    Not indexed. The page carries a phone number and its purpose is to be printed
    or sent as a link, not to rank. Flip this if it should be findable.
  */
  robots: { index: false, follow: false },
};

/**
 * The résumé, generated from lib/data.ts.
 *
 * A document rather than a page: black on white, no gradients, no glass, nothing
 * from the site's dark palette. Print with Ctrl/Cmd-P and it lays out to A4.
 *
 * It exists because the PDF in public/ had drifted from the site badly enough to
 * work against him — see the reasoning in lib/resume.ts. Reading from the same
 * strings as the work cards means the two can no longer disagree.
 */
export default function ResumePage() {
  return (
    <div className="cv-page">
      <div className="cv-toolbar">
        <PrintButton />
        <Link href="/">← back to the site</Link>
        <span>Prints to A4. Use “Save as PDF” in the print dialog.</span>
      </div>

      <article className="cv">
        <header>
          <h1 className="cv-name">{profile.name}</h1>
          <p className="cv-role">{profile.roles.join(" · ")}</p>
          <div className="cv-contact">
            {resumeContact.map((c) => (
              <span key={c.label}>
                {c.href ? <a href={c.href}>{c.value}</a> : c.value}
              </span>
            ))}
          </div>
        </header>

        <section className="cv-section">
          <h2 className="cv-h2">Summary</h2>
          <p className="cv-summary">{resumeSummary}</p>
        </section>

        <section className="cv-section">
          <h2 className="cv-h2">Experience</h2>
          <div className="cv-entry">
            <div className="cv-entry-head">
              <span className="cv-entry-title">
                {resumeJob.role} — {resumeJob.company}
              </span>
              <span className="cv-entry-meta">
                {resumeJob.start} — {resumeJob.end}
              </span>
            </div>
            <p className="cv-entry-sub">{resumeJob.summary}</p>
            <ul>
              {resumeExperienceBullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <p className="cv-stack">{resumeJob.stack.join(" · ")}</p>
          </div>
        </section>

        <section className="cv-section">
          <h2 className="cv-h2">Selected production work</h2>
          {resumeProduction.map((p) => (
            <div className="cv-entry" key={p.slug}>
              <div className="cv-entry-head">
                <span className="cv-entry-title">{p.name}</span>
                <span className="cv-entry-meta">{p.period}</span>
              </div>
              <p className="cv-entry-sub">{p.tagline}</p>

              {/* The measured outcome, given its own weight. */}
              <p className="cv-result">{p.outcome}</p>

              {/*
                What was his and what was not. This is the most credible thing on
                the page — a candidate volunteering the boundary of their own
                contribution is doing something a generated document never does.
              */}
              {p.role && (
                <p className="cv-role-note">
                  <b>My role</b> {p.role}
                </p>
              )}

              {/*
                Two bullets, not three. Every entry carries an outcome, a role
                note and a stack line already; a third narrative bullet pushed the
                document to three pages, and page three of a résumé for one year
                of experience does not get read.
              */}
              {p.bullets && p.bullets.length > 0 && (
                <ul>
                  {p.bullets.slice(0, 2).map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}

              {/*
                Where there is no personal-role note, show the team's numbers
                instead — otherwise this project's measured results appear nowhere.
                Labelled as the team's, which is how the site states them too.
              */}
              {!p.role && p.teamMetrics && p.teamMetrics.length > 0 && (
                <p className="cv-role-note">
                  <b>Team outcome</b>{" "}
                  {p.teamMetrics.map((m) => `${m.value} ${m.label}`).join(" · ")}
                </p>
              )}

              <p className="cv-stack">{p.stack.join(" · ")}</p>
            </div>
          ))}
        </section>

        <section className="cv-section">
          <h2 className="cv-h2">Personal projects</h2>
          {resumePersonal.map((p) => (
            <div className="cv-entry" key={p.slug}>
              <div className="cv-entry-head">
                <span className="cv-entry-title">
                  {p.name} — {p.tagline}
                </span>
                <span className="cv-entry-meta">
                  {p.repo ? (
                    <a href={p.repo}>github.com/…/{p.repo.split("/").pop()}</a>
                  ) : (
                    p.period
                  )}
                </span>
              </div>
              <p className="cv-result">{p.outcome}</p>
              {p.bullets && p.bullets.length > 0 && (
                <ul>
                  {p.bullets.slice(0, 2).map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              <p className="cv-stack">{p.stack.join(" · ")}</p>
            </div>
          ))}
        </section>

        <section className="cv-section">
          <h2 className="cv-h2">Technical skills</h2>
          <dl>
            {skills.map((group) => (
              <div className="cv-skill-row" key={group.key}>
                <dt>{group.label}</dt>
                <dd>{group.items.join(", ")}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="cv-section">
          <h2 className="cv-h2">Education</h2>
          {education.map((e) => (
            <div className="cv-entry" key={e.degree} style={{ marginBottom: 6 }}>
              <div className="cv-entry-head">
                <span className="cv-entry-title" style={{ fontSize: "10.2pt" }}>
                  {e.degree}
                </span>
                <span className="cv-entry-meta">
                  {e.score} · {e.period}
                </span>
              </div>
              <p className="cv-entry-sub">{e.institution}</p>
            </div>
          ))}
        </section>

        <section className="cv-section">
          <h2 className="cv-h2">Achievements &amp; certifications</h2>
          <div className="cv-grid">
            <div>
              {achievements.map((a) => (
                <p key={a.title} style={{ marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{a.title}</span>
                  <br />
                  <span style={{ color: "var(--ink-faint)", fontSize: "9.2pt" }}>
                    {a.detail}
                  </span>
                </p>
              ))}
            </div>
            <div>
              {certifications.map((c) => (
                <p key={c.name} style={{ marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{c.name}</span>{" "}
                  <span style={{ color: "var(--ink-faint)", fontSize: "9.2pt" }}>
                    — {c.issuer}
                  </span>
                </p>
              ))}
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
