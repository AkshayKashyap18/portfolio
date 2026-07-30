"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Project } from "@/lib/data";
import { easeExpo } from "@/lib/motion";

const ACCENT = {
  violet: "#7c5cff",
  cyan: "#22d3ee",
  lime: "#a3e635",
} as const;

/**
 * Renders a project's system diagram as SVG. Edges draw themselves via
 * stroke-dashoffset when the diagram scrolls into view; nodes pop in after.
 */
export default function ArchitectureDiagram({ project }: { project: Project }) {
  const reduce = useReducedMotion();
  const { nodes, edges } = project.architecture;
  const accent = ACCENT[project.accent];

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/8 bg-black/25 p-2">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-[190px] w-full sm:h-[210px]"
        role="img"
        aria-label={`${project.name} architecture: ${edges
          .map(([a, b]) => `${byId[a]?.label} to ${byId[b]?.label}`)
          .join(", ")}`}
      >
        {/* Edges */}
        {edges.map(([a, b], i) => {
          const from = byId[a];
          const to = byId[b];
          if (!from || !to) return null;
          return (
            <motion.line
              key={`${a}-${b}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={accent}
              strokeWidth={0.4}
              strokeOpacity={0.5}
              vectorEffect="non-scaling-stroke"
              initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, delay: 0.15 + i * 0.09, ease: easeExpo }}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((n, i) => (
          <motion.g
            key={n.id}
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.4, delay: 0.5 + i * 0.07 }}
          >
            <circle cx={n.x} cy={n.y} r={1.6} fill={accent} />
            <circle
              cx={n.x}
              cy={n.y}
              r={3.4}
              fill="none"
              stroke={accent}
              strokeWidth={0.25}
              strokeOpacity={0.35}
              vectorEffect="non-scaling-stroke"
            />
          </motion.g>
        ))}
      </svg>

      {/* Labels live in HTML so they never distort with the non-uniform viewBox */}
      <div className="pointer-events-none absolute inset-2">
        {nodes.map((n, i) => (
          <motion.span
            key={n.id}
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 4 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.4, delay: 0.55 + i * 0.07 }}
            className="absolute -translate-x-1/2 font-mono text-[9px] tracking-wide whitespace-nowrap text-muted"
            style={{ left: `${n.x}%`, top: `calc(${n.y}% + 10px)` }}
          >
            {n.label}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
