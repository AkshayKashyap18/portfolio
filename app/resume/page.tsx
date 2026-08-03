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
    Not indexed. The page carries a phone number and exists to be printed or sent
    as a link, not to rank. One line to change if that should differ.
  */
  robots: { index: false, follow: false },
};

/**
 * The résumé, generated from lib/data.ts.
 *
 * Section order follows what a reader expects and what the existing PDF already
 * used — summary, skills, education, experience, projects, achievements. An
 * earlier version of this page led with experience and styled itself like the
 * site; both were wrong for a document whose only job is to be skimmed quickly
 * and parsed reliably.
 *
 * Reading from the same strings as the work cards is the point: the site and the
 * résumé cannot end up describing the same year differently.
 */
export default function ResumePage() {
  return (
    <div className="cv-page">
      <div className="cv-toolbar">
        <PrintButton />
        <Link href="/">← back to the site</Link>
        <a href={profile.resume} download>
          Download the PDF
        </a>
        <span>Prints to A4 — choose “Save as PDF” in the print dialog.</span>
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
          <h2 className="cv-h2">Technical Skills</h2>
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
            <div className="cv-entry" key={e.degree} style={{ marginBottom: 5 }}>
              <div className="cv-entry-head">
                <span className="cv-entry-title" style={{ fontSize: "10.4pt" }}>
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
          <h2 className="cv-h2">Work Experience</h2>
          <div className="cv-entry">
            <div className="cv-entry-head">
              <span className="cv-entry-title">
                {resumeJob.role}, {resumeJob.company}
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
            <p className="cv-stack">
              <b>Stack:</b> {resumeJob.stack.join(", ")}
            </p>
          </div>
        </section>

        <section className="cv-section">
          <h2 className="cv-h2">Professional Projects</h2>
          {resumeProduction.map((p) => (
            <div className="cv-entry" key={p.slug}>
              <div className="cv-entry-head">
                <span className="cv-entry-title">{p.name}</span>
                <span className="cv-entry-meta">{p.period}</span>
              </div>
              <p className="cv-entry-sub">{p.tagline}</p>

              {p.bullets && p.bullets.length > 0 && (
                <ul>
                  {p.bullets.slice(0, 2).map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}

              {/*
                A bold lead-in rather than a coloured callout block: the same two
                sentences that make this document worth reading, without styling
                that announces itself as a web page.
              */}
              <p className="cv-line">
                <b>Result:</b> {p.outcome}
              </p>

              {p.role && (
                <p className="cv-line">
                  <b>My role:</b> {p.role}
                </p>
              )}

              {!p.role && p.teamMetrics && p.teamMetrics.length > 0 && (
                <p className="cv-line">
                  <b>Team outcome:</b>{" "}
                  {p.teamMetrics.map((m) => `${m.value} ${m.label}`).join(", ")}
                </p>
              )}

              <p className="cv-stack">
                <b>Stack:</b> {p.stack.join(", ")}
              </p>
            </div>
          ))}
        </section>

        <section className="cv-section">
          <h2 className="cv-h2">Personal Projects</h2>
          {resumePersonal.map((p) => (
            <div className="cv-entry" key={p.slug}>
              <div className="cv-entry-head">
                <span className="cv-entry-title">
                  {p.name} — {p.tagline}
                </span>
                <span className="cv-entry-meta">
                  {p.repo ? p.repo.replace("https://", "") : p.period}
                </span>
              </div>
              {p.bullets && p.bullets.length > 0 && (
                <ul>
                  {p.bullets.slice(0, 2).map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              <p className="cv-stack">
                <b>Stack:</b> {p.stack.join(", ")}
              </p>
            </div>
          ))}
        </section>

        <section className="cv-section">
          <h2 className="cv-h2">Achievements</h2>
          <ul className="cv-flat">
            {achievements.map((a) => (
              <li key={a.title}>
                <b>{a.title}</b> — {a.detail}
              </li>
            ))}
          </ul>
        </section>

        <section className="cv-section">
          <h2 className="cv-h2">Certifications</h2>
          <p className="cv-summary">
            {certifications.map((c) => `${c.name} (${c.issuer})`).join(" · ")}
          </p>
        </section>
      </article>
    </div>
  );
}
