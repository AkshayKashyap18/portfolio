/**
 * Frame-rate scroll state kept OUTSIDE React.
 *
 * The WebGL scene reads this every frame in useFrame. If scroll progress lived
 * in React state, every pixel of scroll would re-render the tree — the single
 * most common way these sites end up janky.
 */

type ScrollState = {
  /** 0–1 across the whole document. */
  progress: number;
  /** Raw pixels. */
  y: number;
  /** Signed px/frame, smoothed — drives motion-reactive effects. */
  velocity: number;
  /** Normalized pointer, -1..1, origin at viewport centre. */
  pointerX: number;
  pointerY: number;
  /** Whether the pointer is currently over the document. */
  pointerActive: boolean;
  /** Held down — the particle field collapses toward the cursor while true. */
  pointerDown: boolean;
  /** Timestamp of the last release, so the field can fire a shockwave. */
  pointerReleasedAt: number;
};

export const scrollState: ScrollState = {
  progress: 0,
  y: 0,
  velocity: 0,
  pointerX: 0,
  pointerY: 0,
  pointerActive: false,
  pointerDown: false,
  pointerReleasedAt: -Infinity,
};

/** Subscribers that DO need React updates (nav, progress bar) — throttled. */
type Listener = (progress: number) => void;
const listeners = new Set<Listener>();

export function subscribeProgress(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

let lastNotified = -1;

export function setScroll(y: number, progress: number, velocity: number) {
  scrollState.y = y;
  scrollState.progress = progress;
  scrollState.velocity = velocity;

  // Only wake React when the value moves meaningfully (0.5% of the page).
  if (Math.abs(progress - lastNotified) > 0.005) {
    lastNotified = progress;
    listeners.forEach((fn) => fn(progress));
  }
}

export function setPointer(x: number, y: number, active = true) {
  scrollState.pointerX = x;
  scrollState.pointerY = y;
  scrollState.pointerActive = active;
}

export function setPointerDown(down: boolean) {
  if (scrollState.pointerDown && !down) {
    scrollState.pointerReleasedAt = performance.now();
  }
  scrollState.pointerDown = down;
}
