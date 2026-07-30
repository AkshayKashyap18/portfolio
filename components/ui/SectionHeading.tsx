"use client";

import { motion } from "framer-motion";
import { inView, reveal, stagger } from "@/lib/motion";

type Props = {
  index: string;
  title: string;
  kicker?: string;
  align?: "left" | "center";
};

export default function SectionHeading({ index, title, kicker, align = "left" }: Props) {
  return (
    <motion.div
      variants={stagger(0, 0.08)}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      className={align === "center" ? "text-center" : ""}
    >
      <motion.div
        variants={reveal}
        className={`flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-faint uppercase ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        <span className="text-violet">{index}</span>
        <span className="h-px w-10 bg-gradient-to-r from-violet/60 to-transparent" />
        <span>{kicker ?? title}</span>
      </motion.div>

      <motion.h2
        variants={reveal}
        className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-balance sm:text-5xl"
      >
        {title}
      </motion.h2>
    </motion.div>
  );
}
