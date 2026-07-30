/**
 * Section heading. Reveals via the native `view()` timeline — see the `.sda`
 * utilities in globals.css. No client JS.
 */
type Props = {
  index: string;
  title: string;
  kicker?: string;
  align?: "left" | "center";
};

export default function SectionHeading({ index, title, kicker, align = "left" }: Props) {
  return (
    <div className={`sda-stagger ${align === "center" ? "text-center" : ""}`}>
      <div
        className={`flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-faint uppercase ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        <span className="text-violet">{index}</span>
        <span className="h-px w-10 bg-gradient-to-r from-violet/60 to-transparent" />
        <span>{kicker ?? title}</span>
      </div>

      <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl">
        {title}
      </h2>
    </div>
  );
}
