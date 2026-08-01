/**
 * Device capability tiering. The particle count and pixel ratio scale down on
 * weaker hardware instead of shipping one count and hoping.
 */

export type Tier = "high" | "mid" | "low" | "off";

export type TierConfig = {
  tier: Tier;
  particles: number;
  /** Cap on devicePixelRatio — the single biggest fill-rate lever. */
  maxDpr: number;
};

const CONFIG: Record<Tier, TierConfig> = {
  high: { tier: "high", particles: 27000, maxDpr: 1.75 },
  mid: { tier: "mid", particles: 15000, maxDpr: 1.5 },
  low: { tier: "low", particles: 6500, maxDpr: 1 },
  off: { tier: "off", particles: 0, maxDpr: 1 },
};

/** Cheap, synchronous heuristic — no benchmark frame needed. */
export function detectTier(): TierConfig {
  if (typeof window === "undefined") return CONFIG.mid;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return CONFIG.off;

  // No WebGL at all → bail out entirely.
  const canvas = document.createElement("canvas");
  const gl =
    canvas.getContext("webgl2") ??
    canvas.getContext("webgl") ??
    null;
  if (!gl) return CONFIG.off;

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 768;

  // Phones and tablets: never the top tier — thermal throttling is the real limit.
  if (coarse || narrow) {
    return cores >= 6 ? CONFIG.mid : CONFIG.low;
  }

  if (cores >= 8 && memory >= 8) return CONFIG.high;
  if (cores >= 4) return CONFIG.mid;
  return CONFIG.low;
}
