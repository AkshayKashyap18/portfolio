"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { useState } from "react";
import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { easeExpo } from "@/lib/motion";
import Tokenizer from "./Tokenizer";
import NeuralTrainer from "./NeuralTrainer";

const NOTES = [
  {
    title: "Tokenizer",
    body:
      "Language models don't read words, they read tokens. Common words stay whole, rare ones fracture into pieces, and a leading space belongs to the token after it. Type anything and watch it split.",
    honest:
      "A heuristic approximation of GPT-style BPE — the real vocabulary is ~1.7 MB, so counts here are close estimates, not exact.",
  },
  {
    title: "Live neural network",
    body:
      "A real multi-layer perceptron training as you watch: forward pass, binary cross-entropy, analytic gradients, gradient descent. The background is its decision surface and opacity is its confidence. Click to add points and it adapts.",
    honest:
      "Written from scratch — no library, no API, no pre-trained weights. Try XOR with a single hidden layer and watch it fail; that's exactly why depth matters.",
  },
];

export default function Playground() {
  // Open by default — an explainer nobody notices isn't an explainer.
  const [open, setOpen] = useState(true);

  return (
    <Section id="playground">
      <SectionHeading index="04" title="Playground" kicker="Try it yourself" />

      <Reveal delay={1}>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <p className="max-w-xl text-[15px] text-muted text-pretty">
            Two things I work with daily, made touchable — how a model reads your text, and
            what a network actually learns.
          </p>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            data-cursor={open ? "hide" : "read"}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/12 px-4 py-2 font-mono text-[11px] tracking-wide text-muted transition-colors hover:border-white/30 hover:text-text"
          >
            What is this?
            <ChevronDown
              className={`size-3 transition-transform duration-500 ${open ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </Reveal>

      {/* Info panel — what each demo is, and what's real vs approximated */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: easeExpo }}
            className="ats-hide overflow-hidden"
          >
            <div className="glass mt-6 rounded-2xl p-5 sm:p-6">
              <div className="grid gap-6 sm:grid-cols-2">
                {NOTES.map((n) => (
                  <div key={n.title}>
                    <p className="font-mono text-[10px] tracking-[0.22em] text-violet uppercase">
                      {n.title}
                    </p>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted text-pretty">
                      {n.body}
                    </p>
                    <p className="mt-2 text-[12px] leading-relaxed text-faint text-pretty">
                      {n.honest}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-5 flex items-center gap-2 border-t border-white/8 pt-4 font-mono text-[10px] tracking-wide text-faint">
                <ShieldCheck className="size-3 shrink-0 text-lime" />
                Everything here runs client-side. No API calls, no telemetry — nothing you
                type ever leaves your browser.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="ats-hide mt-10 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <Tokenizer />
        </Reveal>
        <Reveal delay={1}>
          <NeuralTrainer />
        </Reveal>
      </div>
    </Section>
  );
}
