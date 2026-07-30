"use client";

import { motion } from "framer-motion";
import { Info } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { allSkills, sharedContexts, similarity, topNeighbours } from "@/lib/similarity";
import { easeExpo } from "@/lib/motion";

function verdict(score: number): { text: string; tone: string } {
  if (score >= 0.75) return { text: "tightly coupled", tone: "text-lime" };
  if (score >= 0.45) return { text: "related", tone: "text-cyan" };
  if (score >= 0.15) return { text: "loosely related", tone: "text-violet" };
  return { text: "unrelated", tone: "text-faint" };
}

function Picker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex-1">
      <span className="mb-2 block font-mono text-[10px] tracking-[0.18em] text-faint uppercase">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 font-mono text-[13px] text-text outline-none transition-colors focus:border-violet/50"
      >
        {allSkills.map((s) => (
          <option key={s} value={s} className="bg-bg-soft">
            {s}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function SimilarityDemo() {
  const [a, setA] = useState("Python");
  const [b, setB] = useState("FastAPI");
  const [showInfo, setShowInfo] = useState(false);

  const score = useMemo(() => similarity(a, b), [a, b]);
  const shared = useMemo(() => sharedContexts(a, b), [a, b]);
  const neighbours = useMemo(() => topNeighbours(a, 3), [a]);
  const v = verdict(score);

  return (
    <div className="gradient-border glass flex h-full flex-col rounded-3xl p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-[-0.02em]">Vector similarity</h3>
          <p className="mt-1 font-mono text-[10px] tracking-wider text-faint uppercase">
            Cosine distance across my real work
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowInfo((s) => !s)}
          aria-label="How this works"
          aria-expanded={showInfo}
          className={`grid size-8 place-items-center rounded-lg border transition-colors ${
            showInfo ? "border-violet/50 text-violet" : "border-white/10 text-muted hover:text-text"
          }`}
        >
          <Info className="size-3.5" />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {showInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: easeExpo }}
            className="overflow-hidden"
          >
            <p className="mt-4 rounded-xl border border-cyan/20 bg-cyan/[0.05] p-3 text-[12px] leading-relaxed text-muted">
              Every skill here is a real vector. Its dimensions are my actual projects, my job,
              and skill categories — a{" "}
              <strong className="font-medium text-text">term-document co-occurrence model</strong>,
              the same intuition behind learned embeddings, but small enough to verify by hand.
              Two skills score high when I&apos;ve genuinely used them together. No API, no
              invented numbers.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 flex gap-3">
        <Picker label="Vector A" value={a} onChange={setA} />
        <Picker label="Vector B" value={b} onChange={setB} />
      </div>

      {/* Score */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-3xl font-semibold tabular-nums text-gradient">
            {score.toFixed(3)}
          </span>
          <span className={`font-mono text-[11px] tracking-wider uppercase ${v.tone}`}>
            {v.text}
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet to-cyan"
            animate={{ width: `${Math.max(score, 0) * 100}%` }}
            transition={{ duration: 0.7, ease: easeExpo }}
          />
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[9px] text-faint">
          <span>0.0 orthogonal</span>
          <span>1.0 identical</span>
        </div>
      </div>

      {/* Shared dimensions */}
      <div className="mt-6">
        <p className="font-mono text-[10px] tracking-[0.18em] text-faint uppercase">
          Shared dimensions
        </p>
        <div className="mt-2.5 flex min-h-[28px] flex-wrap gap-1.5">
          {shared.length ? (
            shared.map((s) => (
              <motion.span
                key={s}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[11px] text-muted"
              >
                {s}
              </motion.span>
            ))
          ) : (
            <span className="font-mono text-[11px] text-faint">
              No overlap — never used together.
            </span>
          )}
        </div>
      </div>

      {/* Nearest neighbours */}
      <div className="mt-auto pt-6">
        <p className="font-mono text-[10px] tracking-[0.18em] text-faint uppercase">
          Nearest to {a}
        </p>
        <ul className="mt-2.5 space-y-1.5">
          {neighbours.map((n) => (
            <li key={n.skill}>
              <button
                type="button"
                onClick={() => setB(n.skill)}
                className="flex w-full items-center gap-3 text-left"
              >
                <span className="w-28 shrink-0 truncate font-mono text-[11px] text-muted transition-colors hover:text-text">
                  {n.skill}
                </span>
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/6">
                  <motion.span
                    className="block h-full rounded-full bg-gradient-to-r from-violet/70 to-cyan/70"
                    initial={{ width: 0 }}
                    animate={{ width: `${n.score * 100}%` }}
                    transition={{ duration: 0.6, ease: easeExpo }}
                  />
                </span>
                <span className="w-10 shrink-0 text-right font-mono text-[10px] tabular-nums text-faint">
                  {n.score.toFixed(2)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
