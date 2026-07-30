/**
 * Real co-occurrence vectors over Akshay's actual work.
 *
 * No API, no fabricated embeddings. Each skill becomes a sparse vector whose
 * dimensions are the real artifacts in `data.ts`:
 *   · one dimension per project        (does this skill appear in its stack/text?)
 *   · one dimension per job            (same)
 *   · one dimension per skill category (which bucket the skill belongs to)
 *
 * Cosine similarity over those vectors is then a genuine measure: skills used
 * together in the same projects score high. This is exactly how a term-document
 * co-occurrence model works — the same intuition behind learned embeddings,
 * computed transparently from a corpus small enough to verify by hand.
 */

import { experience, projects, skills } from "./data";

export type Dimension = { key: string; label: string; kind: "project" | "job" | "category" };

export const dimensions: Dimension[] = [
  ...projects.map((p) => ({ key: `p:${p.slug}`, label: p.name, kind: "project" as const })),
  ...experience.map((j) => ({ key: `j:${j.company}`, label: j.company, kind: "job" as const })),
  ...skills.map((s) => ({ key: `c:${s.key}`, label: s.label, kind: "category" as const })),
];

export const allSkills: string[] = skills.flatMap((s) => s.items);

/**
 * Token-boundary matching with light stemming.
 *
 * Substring matching is tempting here and completely wrong: "C" would match
 * "React", "Docker" and "Scikit-learn", and "Java" would match "JavaScript",
 * silently inflating every score. Matching on whole tokens keeps the numbers
 * defensible when someone interrogates them.
 */
function tokenize(s: string): string[] {
  const raw = s.toLowerCase().match(/[a-z0-9+#]+/g) ?? [];
  // Fold trivial plurals so "Transformers" matches "Transformer architectures".
  return raw.map((t) => (t.length > 3 && t.endsWith("s") ? t.slice(0, -1) : t));
}

function mentions(haystack: string, skill: string): boolean {
  const present = new Set(tokenize(haystack));
  const needed = tokenize(skill);
  if (needed.length === 0) return false;

  // Every token present → a real mention ("Hugging Face", "OpenAI API").
  if (needed.every((t) => present.has(t))) return true;

  // For multi-word skills the leading token alone is enough: prose saying
  // "OpenAI models" should count as a mention of "OpenAI API".
  return needed.length > 1 && present.has(needed[0]);
}

function buildVector(skill: string): number[] {
  return dimensions.map((dim) => {
    if (dim.kind === "project") {
      const p = projects.find((x) => `p:${x.slug}` === dim.key)!;
      // Stack membership is a strong signal; a prose mention is a weaker one.
      if (p.stack.some((t) => mentions(t, skill))) return 1;
      const prose = [p.approach, p.outcome, ...p.bullets].join(" ");
      return mentions(prose, skill) ? 0.5 : 0;
    }
    if (dim.kind === "job") {
      const j = experience.find((x) => `j:${x.company}` === dim.key)!;
      if (j.stack.some((t) => mentions(t, skill))) return 1;
      return mentions(j.bullets.join(" "), skill) ? 0.5 : 0;
    }
    const cat = skills.find((x) => `c:${x.key}` === dim.key)!;
    return cat.items.includes(skill) ? 0.7 : 0;
  });
}

export const vectors: Record<string, number[]> = Object.fromEntries(
  allSkills.map((s) => [s, buildVector(s)]),
);

export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function similarity(skillA: string, skillB: string): number {
  const a = vectors[skillA];
  const b = vectors[skillB];
  if (!a || !b) return 0;
  return cosine(a, b);
}

/** Shared dimensions, for explaining *why* a score is what it is. */
export function sharedContexts(skillA: string, skillB: string): string[] {
  const a = vectors[skillA];
  const b = vectors[skillB];
  if (!a || !b) return [];
  return dimensions
    .map((d, i) => (a[i] > 0 && b[i] > 0 ? d.label : null))
    .filter((x): x is string => x !== null);
}

export function topNeighbours(skill: string, n = 3): { skill: string; score: number }[] {
  return allSkills
    .filter((s) => s !== skill)
    .map((s) => ({ skill: s, score: similarity(skill, s) }))
    .sort((x, y) => y.score - x.score)
    .slice(0, n);
}
