/**
 * Maps scroll position to a fractional formation index.
 *
 * Driven by real section geometry rather than a fraction of the document, so
 * each formation is fully resolved exactly when its section is centred — the
 * page and the particle field stay in lockstep even as section heights change
 * (the work rail's height depends on measured content width).
 */

/** Section ids in formation order: nebula, AK, lattice, sphere, wave, singularity. */
export const BEAT_IDS = ["top", "about", "work", "stack", "playground", "contact"] as const;

/**
 * Per-beat field brightness. Low by design — the field is atmosphere behind the
 * type, never competition for it. Only the hero and the closing singularity get
 * to be assertive, and even then not much.
 */
export const BEAT_OPACITY = [0.95, 0.6, 0.42, 0.55, 0.48, 1.0] as const;

let anchors: number[] = [];
/**
 * Whether the last measurement actually found every section.
 *
 * Tracked separately because the padding below keeps `anchors` at full length
 * even when nothing was found, which made a length check report success on a
 * page containing none of the six ids.
 */
let complete = false;

export function measureBeats(): void {
  const next: number[] = [];
  let found = 0;

  BEAT_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) {
      next.push(next.length ? next[next.length - 1] + window.innerHeight : 0);
      return;
    }
    found += 1;
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    // Centre of the section is where its formation should be fully resolved.
    next.push(top + rect.height / 2);
  });

  // Guarantee monotonicity so interpolation can never divide by zero.
  for (let i = 1; i < next.length; i++) {
    if (next[i] <= next[i - 1]) next[i] = next[i - 1] + 1;
  }

  anchors = next;
  complete = found === BEAT_IDS.length;
}

export function hasBeats(): boolean {
  return complete && anchors.length === BEAT_IDS.length;
}

/** Fractional stage index for a given scroll position. */
export function stageFromScroll(scrollY: number, viewportHeight: number): number {
  if (anchors.length < 2) return 0;

  const focus = scrollY + viewportHeight / 2;

  if (focus <= anchors[0]) return 0;
  const last = anchors.length - 1;
  if (focus >= anchors[last]) return last;

  for (let i = 0; i < last; i++) {
    const a = anchors[i];
    const b = anchors[i + 1];
    if (focus >= a && focus <= b) {
      return i + (focus - a) / (b - a);
    }
  }
  return last;
}

/** Field opacity for a fractional stage. */
export function opacityFromStage(stageF: number): number {
  const i = Math.min(Math.floor(stageF), BEAT_OPACITY.length - 2);
  const t = stageF - i;
  return BEAT_OPACITY[i] + (BEAT_OPACITY[i + 1] - BEAT_OPACITY[i]) * t;
}
