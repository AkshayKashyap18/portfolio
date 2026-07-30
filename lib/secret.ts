/**
 * A hidden easter egg: typing a word anywhere on the page makes the particle
 * field spell it, hold, then dissolve back to the normal scroll formations.
 *
 * The word is base64-encoded rather than written in plain text — not real
 * secrecy (the repo is public and this is trivially reversible), just enough
 * that it doesn't turn up in a casual grep or a GitHub search.
 */

const ENCODED = "a2F2YW5h";

let cached: string | null = null;

export function secretWord(): string {
  if (cached) return cached;
  cached = typeof atob === "function" ? atob(ENCODED) : "";
  return cached;
}

/** Rendered in caps — the glyph sampler reads uppercase far more legibly. */
export function secretDisplay(): string {
  return secretWord().toUpperCase();
}

export const secretState = {
  /** True while the field is holding the hidden formation. */
  active: false,
  /** Bumped each activation so the field knows to rebuild its buffer. */
  token: 0,
};

type Listener = () => void;
const listeners = new Set<Listener>();

export function onSecret(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** How long the name stays formed before the field returns to normal. */
export const SECRET_HOLD_MS = 7000;

let timer: number | undefined;

export function triggerSecret(): void {
  if (secretState.active) return;
  secretState.active = true;
  secretState.token += 1;
  listeners.forEach((fn) => fn());

  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    secretState.active = false;
    listeners.forEach((fn) => fn());
  }, SECRET_HOLD_MS);
}

/**
 * Watches typed characters for the word. Ignores keystrokes aimed at inputs, so
 * it never fires while someone is using the tokenizer or the palette.
 */
export function watchForSecret(): () => void {
  const target = secretWord();
  if (!target) return () => {};

  let buffer = "";

  function onKey(e: KeyboardEvent) {
    const el = e.target as HTMLElement | null;
    const tag = el?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el?.isContentEditable) {
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key.length !== 1) return;

    buffer = (buffer + e.key.toLowerCase()).slice(-target.length);
    if (buffer === target) {
      buffer = "";
      triggerSecret();
    }
  }

  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}
