"use client";

import { useEffect } from "react";
import { FORMATION_LABELS } from "@/lib/formations";
import { detectTier } from "@/lib/deviceTier";
import { profile } from "@/lib/data";

/**
 * A greeting for anyone who opens DevTools — which, on an engineer's portfolio,
 * is the visitor most worth talking to.
 *
 * Everything printed is measured from the running page rather than hardcoded, so
 * it stays true on a phone as well as a workstation. Renders nothing.
 */
let printed = false;

export default function ConsoleGreeting() {
  useEffect(() => {
    // React strict mode double-invokes effects in dev; only greet once.
    if (printed) return;
    printed = true;

    const tier = detectTier();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const heading = [
      "color:#7c5cff",
      "font-weight:800",
      "font-size:15px",
      "letter-spacing:0.14em",
    ].join(";");
    const label = "color:#6e6e7c;font-family:monospace;font-size:11px";
    const value = "color:#ededf2;font-family:monospace;font-size:11px";
    const accent = "color:#22d3ee;font-family:monospace;font-size:11px";

    const row = (k: string, v: string) => {
      console.log(`%c${k.padEnd(13)}%c${v}`, label, value);
    };

    console.log(`%c${profile.firstName.toUpperCase()} ${profile.lastName.toUpperCase()}`, heading);
    console.log(`%c${profile.roles.join(" · ")}`, accent);

    row("particles", tier.particles.toLocaleString());
    row("formations", String(FORMATION_LABELS.length));
    row("device tier", tier.tier);
    row("dpr cap", String(dpr));
    row("shader", "custom GLSL, no post-processing");
    row("network", "MLP + backprop, written from scratch");

    console.log(
      "%cSo you opened the console. Try holding the mouse down on the background — and there's more than that hidden in here.",
      "color:#9494a3;font-style:italic;font-size:11px",
    );
    console.log(`%c${profile.github}`, "color:#7c5cff;font-family:monospace;font-size:11px");
  }, []);

  return null;
}
