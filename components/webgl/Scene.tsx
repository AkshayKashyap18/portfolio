"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { detectTier, type TierConfig } from "@/lib/deviceTier";
import ParticleField from "./ParticleField";
import GutterStreams from "./GutterStreams";

/**
 * The fixed, full-viewport WebGL layer that every section sits on top of.
 *
 * Mounted only after the tier check, and never at all when WebGL is missing or
 * the visitor prefers reduced motion — in those cases the CSS fallback in
 * globals.css carries the page.
 */
export default function Scene() {
  const [config, setConfig] = useState<TierConfig | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setConfig(detectTier());
  }, []);

  // Let CSS pull the static fallback back once real particles are on screen.
  const active = !!config && config.tier !== "off" && !failed;
  useEffect(() => {
    document.body.dataset.webgl = active ? "on" : "off";
  }, [active]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden
      // The canvas is decorative; the page reads fine without it.
    >
      <Canvas
        dpr={[1, config!.maxDpr]}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          // Nothing reads back from the buffer, so let the driver discard it.
          preserveDrawingBuffer: false,
        }}
        camera={{ position: [0, 0, 9], fov: 55, near: 0.1, far: 60 }}
        // Pause rendering when the tab is hidden.
        frameloop="always"
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          const canvas = gl.domElement;
          const onLost = (e: Event) => {
            e.preventDefault();
            setFailed(true);
          };
          canvas.addEventListener("webglcontextlost", onLost);
        }}
      >
        <ParticleField count={config!.particles} tier={config!.tier} />
        {/* The nebula continuing past the reading column, into the gutters */}
        <GutterStreams count={Math.round(config!.particles / 32)} />
      </Canvas>
    </div>
  );
}
