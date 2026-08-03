import { experience, projects, profile, type Project } from "./data";

/**
 * What goes on the résumé, and what does not.
 *
 * Kept separate from the page so the editorial decisions are readable in one
 * place instead of buried in markup, and separate from lib/data.ts so the site
 * stays the full record while the document stays one page.
 *
 * The document is generated from the same strings the work cards use, because
 * the PDF this replaces had drifted a long way from the site. The site said
 * "F1 0.846 on a 118-page human gold set — against 0.25 for the system
 * replaced" and "600 pages ran with zero errors at $0.0117 each". The PDF said
 * "Developed and maintained scalable backend services ... for high-performance
 * applications" and contained no number about his work anywhere. Two documents
 * describing the same year, one of them with the evidence in it.
 */

/**
 * EduMorph is left off.
 *
 * Not because it is bad work — it is the least differentiating of the three. A
 * PDF-to-flashcards assistant is the most-built AI side project there is, and its
 * write-up carries no measurement, so on a page competing for attention it spends
 * space without buying credibility. MindMate runs real clinical instruments
 * (PHQ-9, GAD-7) behind a trained Random Forest, and MCP Todo is built on Model
 * Context Protocol — one shows applied ML, the other shows he tracks where the
 * tooling is going. Both are harder to claim without having done them.
 *
 * It stays on the site, where there is room for all three.
 */
const OMIT_FROM_RESUME = ["edumorph"] as const;

export const resumeProduction: Project[] = projects.filter((p) => p.kind === "production");

export const resumePersonal: Project[] = projects.filter(
  (p) => p.kind === "personal" && !OMIT_FROM_RESUME.includes(p.slug as (typeof OMIT_FROM_RESUME)[number]),
);

/**
 * The summary, rewritten.
 *
 * What it replaces: "AI-Focused CS Undergraduate skilled in backend development,
 * machine learning, and AI systems development. Experienced with open-source LLMs
 * and AI workflows, Fine-tuning building user-centric AI tools. Known for
 * adaptability, clear communication, and thriving in collaborative tech teams."
 *
 * Three problems with that. The degree was wrong — it is AI & Data Science, not
 * CS. The second sentence is broken mid-clause. And the third is three
 * unfalsifiable virtues occupying the most-read lines on the page, where a
 * reader is deciding whether to keep going.
 *
 * Every number below traces to a project entry in lib/data.ts.
 */
export const resumeSummary =
  "AI & Data Science undergraduate, working as an AI Developer since September 2025. " +
  "I build production FastAPI services and the LLM systems that sit on top of them. " +
  "Recent work: a document-extraction pipeline scoring F1 0.846 against a 118-page human " +
  "gold set, up from 0.25 for the system it replaced, at $0.0117 per page; an agentic " +
  "quoting workflow in daily production use that took quoting from 24 hours to 4 minutes; " +
  "and an ERP-to-lakehouse migration whose first table went live at 3.9M rows.";

/**
 * The employment entry stays short on purpose.
 *
 * The first version carried four detailed bullets and it read as padding, because
 * the three production entries below describe the same job in more depth — "traced
 * a term-corruption bug across four systems to unquoted SQL formatting downstream"
 * appeared twice, word for word, and the rules-engine ownership appeared twice.
 * That duplication was costing a third of page one.
 *
 * So this section establishes where and when, and the work section carries the
 * evidence. The one bullet kept is the only part of the role the project entries
 * do not already cover.
 */
export const resumeExperienceBullets = [
  "Backend services in Python and FastAPI against Supabase and PostgreSQL — authentication, role-based access control and query paths that hold under load — deployed in Docker containers.",
  "The three production systems below were built in this role.",
];

/** Contact, in the order a reader scans it. */
export const resumeContact = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { label: "Phone", value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, "")}` },
  { label: "GitHub", value: `github.com/${profile.githubHandle}`, href: profile.github },
  { label: "Location", value: profile.location, href: null },
];

export const resumeJob = experience[0];
