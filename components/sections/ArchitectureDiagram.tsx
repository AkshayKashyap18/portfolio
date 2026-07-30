"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import type { Project } from "@/lib/data";
import { easeExpo } from "@/lib/motion";

const ACCENT = {
  violet: "#7c5cff",
  cyan: "#22d3ee",
  lime: "#a3e635",
} as const;

/** One pulse traversal, in seconds. */
const FLOW_DURATION = 2.6;
/** Delay between consecutive edges, so flow propagates rather than firing at once. */
const EDGE_STAGGER = 0.34;

/**
 * A project's system diagram, rendered as SVG.
 *
 * Edges draw themselves via pathLength when scrolled into view, then data
 * *flows* — a round-capped dash travels each edge on a staggered loop, and each
 * node flares as the pulse reaches it. The result reads as a running system
 * rather than a static picture.
 *
 * The pulse is a stroke dash rather than a circle deliberately: the viewBox uses
 * preserveAspectRatio="none" to fill its container, which would squash a circle
 * into an ellipse. A dash with vectorEffect="non-scaling-stroke" stays perfectly
 * round at any aspect ratio.
 */
export default function ArchitectureDiagram({ project }: { project: Project }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // Only animate while on screen — six looping animations per card adds up.
  const visible = useInView(ref, { margin: "10%" });
  const { nodes, edges } = project.architecture;
  const accent = ACCENT[project.accent];

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const flowing = visible && !reduce;

  /** When the pulse on the last inbound edge reaches this node. */
  function arrivalDelay(nodeId: string): number {
    const inbound = edges.findIndex(([, to]) => to === nodeId);
    if (inbound < 0) return 0;
    return inbound * EDGE_STAGGER + FLOW_DURATION * 0.82;
  }

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden rounded-2xl border border-white/8 bg-black/25 p-2"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-[150px] w-full sm:h-[168px]"
        role="img"
        aria-label={`${project.name} architecture: ${edges
          .map(([a, b]) => `${byId[a]?.label} to ${byId[b]?.label}`)
          .join(", ")}`}
      >
        {/* Static edges — drawn once on entry */}
        {edges.map(([a, b], i) => {
          const from = byId[a];
          const to = byId[b];
          if (!from || !to) return null;
          return (
            <motion.line
              key={`edge-${a}-${b}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={accent}
              strokeWidth={0.4}
              strokeOpacity={0.32}
              vectorEffect="non-scaling-stroke"
              initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.8, delay: 0.15 + i * 0.09, ease: easeExpo }}
            />
          );
        })}

        {/* Travelling pulses — the "data flowing" layer */}
        {flowing &&
          edges.map(([a, b], i) => {
            const from = byId[a];
            const to = byId[b];
            if (!from || !to) return null;
            return (
              <line
                key={`flow-${a}-${b}`}
                className="arch-flow"
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={accent}
                strokeWidth={2.2}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                style={{
                  animationDuration: `${FLOW_DURATION}s`,
                  animationDelay: `${i * EDGE_STAGGER}s`,
                }}
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
            {/* Flare ring — expands as a pulse lands */}
            {flowing && (
              <circle
                className="arch-node-flare"
                cx={n.x}
                cy={n.y}
                r={3.4}
                fill="none"
                stroke={accent}
                strokeWidth={1.4}
                vectorEffect="non-scaling-stroke"
                style={{
                  animationDuration: `${FLOW_DURATION}s`,
                  animationDelay: `${arrivalDelay(n.id)}s`,
                }}
              />
            )}
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
