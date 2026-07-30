"use client";

import { motion } from "framer-motion";
import { inView, reveal } from "@/lib/motion";

type Props = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "span";
};

/** The canonical scroll reveal wrapper — fade + rise + de-blur, once. */
export default function Reveal({ children, delay = 0, className, as = "div" }: Props) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}
