/**
 * Scroll reveal, powered by the native CSS `view()` timeline rather than
 * JavaScript. No Framer Motion, no IntersectionObserver, no main-thread work —
 * which leaves the frame budget to the particle shader.
 *
 * Deliberately not a client component: it renders plain markup, so it costs
 * nothing at runtime.
 */
type Props = {
  children: React.ReactNode;
  /** 1–3 — nudges the reveal later in the scroll, replacing a time delay. */
  delay?: 0 | 1 | 2 | 3;
  className?: string;
  as?: "div" | "li" | "section" | "span";
};

const DELAY_CLASS: Record<number, string> = {
  0: "",
  1: "[animation-range:entry_10%_cover_30%]",
  2: "[animation-range:entry_16%_cover_36%]",
  3: "[animation-range:entry_22%_cover_42%]",
};

export default function Reveal({ children, delay = 0, className = "", as = "div" }: Props) {
  const Tag = as;
  return (
    <Tag className={`sda ${DELAY_CLASS[delay] ?? ""} ${className}`.trim()}>{children}</Tag>
  );
}
