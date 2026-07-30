/**
 * Load-intro state, kept outside React so the WebGL layer can read it per frame.
 *
 * The intro plays once per session — a curtain that replays on every navigation
 * stops being an entrance and becomes a toll booth.
 */

export const introState = {
  /** 0 → 1 across the intro. Starts at 1 (skipped) if already seen. */
  t: 0,
  active: true,
};

const KEY = "ak-intro-played";

export function shouldPlayIntro(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.sessionStorage.getItem(KEY)) return false;
  } catch {
    // Private mode / storage disabled — just play it.
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return true;
}

export function markIntroPlayed(): void {
  try {
    window.sessionStorage.setItem(KEY, "1");
  } catch {
    /* ignore */
  }
}

export function skipIntro(): void {
  introState.t = 1;
  introState.active = false;
  announceIntroDone();
}

/** Fired when the curtain starts lifting, so the hero can begin its entrance. */
export const INTRO_DONE_EVENT = "ak:intro-done";

export function announceIntroDone(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(INTRO_DONE_EVENT));
  }
}
