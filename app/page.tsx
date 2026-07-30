"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import SmoothScroll from "@/components/providers/SmoothScroll";
import BeatTracker from "@/components/webgl/BeatTracker";
import Nav from "@/components/layout/Nav";
import Preloader from "@/components/layout/Preloader";
import BeatRail from "@/components/layout/BeatRail";
import SecretKeys from "@/components/layout/SecretKeys";
import ConsoleGreeting from "@/components/layout/ConsoleGreeting";
import ScrollProgress from "@/components/layout/ScrollProgress";
import CursorGlow from "@/components/layout/CursorGlow";
import CommandPalette from "@/components/layout/CommandPalette";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Statement from "@/components/sections/Statement";
import WorkRail from "@/components/sections/WorkRail";
import Craft from "@/components/sections/Craft";
import Playground from "@/components/sections/Playground";
import Contact from "@/components/sections/Contact";

/**
 * three.js stays out of the initial bundle — the page is fully readable before
 * the WebGL layer ever arrives.
 */
const Scene = dynamic(() => import("@/components/webgl/Scene"), { ssr: false });

export default function Home() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [ats, setAts] = useState(false);

  const toggleAts = useCallback(() => setAts((v) => !v), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.dataset.ats = String(ats);
    return () => {
      delete document.body.dataset.ats;
    };
  }, [ats]);

  return (
    <SmoothScroll>
      {/* Base wash, always present — the canvas layers over it. */}
      <div className="field-fallback ats-hide" aria-hidden />
      {!ats && (
        <>
          <BeatTracker />
          <Scene />
          <SecretKeys />
          <ConsoleGreeting />
          {/* Keeps copy legible over whatever the field is doing. */}
          <div className="content-scrim ats-hide" aria-hidden />
        </>
      )}

      {!ats && <Preloader />}
      <ScrollProgress />
      <CursorGlow />
      <Nav onOpenPalette={() => setPaletteOpen(true)} />
      {!ats && <BeatRail />}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onToggleAts={toggleAts}
      />

      {/*
        Section order is load-bearing: each beat lines up with one particle
        formation — nebula, "AK", lattice, sphere, wave, singularity.
      */}
      <main className="relative">
        <Hero />
        <Statement />
        <WorkRail />
        <Craft />
        <Playground />
        <Contact />
      </main>

      <Footer onToggleAts={toggleAts} ats={ats} />
    </SmoothScroll>
  );
}
