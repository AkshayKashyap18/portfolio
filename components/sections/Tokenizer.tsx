"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Info, Shuffle } from "lucide-react";
import { useMemo, useState } from "react";
import { SAMPLES, tokenize } from "@/lib/tokenize";
import { easeExpo } from "@/lib/motion";

const KIND_STYLE: Record<string, string> = {
  word: "bg-violet/20 text-violet-100 border-violet/30",
  sub: "bg-cyan/15 text-cyan border-cyan/30",
  num: "bg-lime/15 text-lime border-lime/30",
  punct: "bg-white/8 text-muted border-white/15",
  space: "bg-white/5 text-faint border-white/10",
};

export default function Tokenizer() {
  const [text, setText] = useState(SAMPLES[0]);
  const [showInfo, setShowInfo] = useState(false);

  const tokens = useMemo(() => tokenize(text), [text]);
  const visible = tokens.filter((t) => t.kind !== "space" || t.text.includes("\n"));

  function shuffle() {
    const next = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    setText(next === text ? SAMPLES[(SAMPLES.indexOf(next) + 1) % SAMPLES.length] : next);
  }

  return (
    <div className="gradient-border glass flex h-full flex-col rounded-3xl p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-[-0.02em]">Tokenizer</h3>
          <p className="mt-1 font-mono text-[10px] tracking-wider text-faint uppercase">
            How a model sees your text
          </p>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={shuffle}
            aria-label="Try a sample sentence"
            className="grid size-8 place-items-center rounded-lg border border-white/10 text-muted transition-colors hover:text-text"
          >
            <Shuffle className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowInfo((v) => !v)}
            aria-label="How this works"
            aria-expanded={showInfo}
            className={`grid size-8 place-items-center rounded-lg border transition-colors ${
              showInfo ? "border-violet/50 text-violet" : "border-white/10 text-muted hover:text-text"
            }`}
          >
            <Info className="size-3.5" />
          </button>
        </div>
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
            <p className="mt-4 rounded-xl border border-violet/20 bg-violet/[0.06] p-3 text-[12px] leading-relaxed text-muted">
              Language models don&apos;t read characters or words — they read{" "}
              <strong className="font-medium text-text">tokens</strong>. Common words stay
              whole, rare ones fracture into pieces, and a leading space belongs to the token
              after it. This is a{" "}
              <strong className="font-medium text-text">heuristic approximation</strong> of
              GPT-style BPE, running fully client-side; the real vocabulary is ~1.7 MB, so
              counts here are close estimates, not exact.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <label className="mt-5 block">
        <span className="sr-only">Text to tokenize</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          spellCheck={false}
          placeholder="Type anything…"
          className="w-full resize-none rounded-xl border border-white/10 bg-black/25 p-3.5 font-mono text-[13px] leading-relaxed text-text outline-none transition-colors placeholder:text-faint focus:border-violet/50"
        />
      </label>

      {/* Tokens */}
      <div className="mt-4 flex min-h-[92px] flex-wrap content-start gap-1.5 rounded-xl border border-white/8 bg-black/20 p-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((t, i) => (
            <motion.span
              key={`${i}-${t.text}`}
              layout
              initial={{ opacity: 0, scale: 0.86 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.86 }}
              transition={{ duration: 0.18, ease: easeExpo }}
              className={`rounded border px-1.5 py-0.5 font-mono text-[12px] whitespace-pre ${
                KIND_STYLE[t.kind] ?? KIND_STYLE.word
              }`}
            >
              {t.text.replace(/ /g, "·")}
            </motion.span>
          ))}
        </AnimatePresence>

        {visible.length === 0 && (
          <span className="font-mono text-[12px] text-faint">Waiting for input…</span>
        )}
      </div>

      {/* Stats */}
      <div className="mt-auto grid grid-cols-3 gap-3 pt-5">
        {[
          { label: "tokens", value: visible.length },
          { label: "characters", value: text.length },
          {
            label: "chars / token",
            value: visible.length ? (text.length / visible.length).toFixed(1) : "0.0",
          },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
            <p className="font-mono text-xl font-semibold tabular-nums text-gradient">
              {s.value}
            </p>
            <p className="mt-0.5 font-mono text-[9px] tracking-wider text-faint uppercase">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-3 font-mono text-[9px] tracking-wide text-faint">
        ≈ estimate · heuristic BPE, not the exact GPT vocabulary
      </p>
    </div>
  );
}
