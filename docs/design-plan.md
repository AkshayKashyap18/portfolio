# Akshay Kashyap — Portfolio

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind v4 · Framer Motion · three.js + @react-three/fiber · Lenis
**Direction:** near-black canvas, one WebGL centerpiece, type-led layout

> This document describes what is actually built. An earlier draft (aurora blobs
> + glass cards everywhere) was torn down — see *Rejected directions* at the end.

---

## 1. The centerpiece

A **42,000-particle GPU field** fixed behind the entire page that **morphs between
six formations as you scroll**. It is the whole idea; everything else defers to it.

| # | Formation | Section | Meaning |
|---|---|---|---|
| 0 | `nebula` | Hero | 50 gaussian clusters + connective haze — a projected embedding space |
| 1 | `initials` | Who | Particles sampled from rendered "AK" glyphs |
| 2 | `lattice` | Work | Jittered 3D grid — a network graph mid-layout |
| 3 | `sphere` | Craft | Even Fibonacci shell |
| 4 | `wave` | Playground | Rippling activation surface |
| 5 | `singularity` | Contact | Collapse to a dense glowing core |

### How the morph works
All six formations live on the GPU **simultaneously** as vertex attributes
(`position` + `aP1`…`aP5`). The CPU sends two one-hot weight vectors (`uWA`/`uWB`)
plus a morph factor, so the shader blends between **any** two formations without
re-uploading a single buffer.

Key details that make it read as expensive rather than cheap:
- **Per-particle stagger** — each particle delays its departure by a hashed seed
  (`fract(aSeed * 13.137) * uStagger`), so the field settles like a swarm instead
  of snapping as one rigid mass.
- **Arced flight paths** — particles bow outward mid-transit (`sin(local * π)`).
- **Curl-noise drift** — divergence-free flow so the field never looks frozen;
  drift *calms* during a morph so the formation stays legible.
- **Core-dominant point falloff** (`pow(halo, 6.0)`) — a tight bright centre reads
  as a rendered point; a wide soft blob reads as stock bokeh.
- **Per-particle colour** across the violet→cyan ramp, blowing out toward white
  under the cursor. 2% of particles twinkle on their own cycle.
- **Cursor force** in view space — particles are pushed away and flare.

### Beat alignment
`lib/beats.ts` measures **real section geometry**, not a fraction of the document,
so each formation resolves exactly when its section is centred. It re-measures on
resize and after fonts load, because the work rail's height depends on measured
content width. Field brightness is per-beat (`BEAT_OPACITY`) — quiet behind
text-heavy sections, assertive on the hero and the closing collapse.

---

## 2. Page flow

```
00  Intro       counter 000→100, curtain lifts, field blooms out of a singularity
01  Hero        name only, one line of pitch                       [nebula]
02  Who         "I build backends that think." + 3 facts           [AK initials]
03  Work        horizontal-scrolling rail — 3 projects             [lattice]
04  Craft       stack marquees + current role + study/recognition  [sphere]
05  Playground  tokenizer + vector-similarity demos                [wave]
06  Contact     oversized CTA, email, direct details               [singularity]
```

**Fixed chrome:** floating glass nav (materializes on scroll, `layoutId` pill
tracks the active section) · 2px gradient scroll-progress bar · `⌘K` command
palette · cursor spotlight + label-morphing ring · right-side **beat rail**
naming the current section and its formation · recruiter/ATS mode.

### Intro timing (ms from mount)
```
0    →1500   counter runs 000 → 100
1350 →2750   field blooms out of the singularity
1680         curtain lifts — so the bloom is visible THROUGH it
```
Plays **once per session** (`sessionStorage`); skipped entirely under
`prefers-reduced-motion`. The hero holds its entrance until the curtain starts
lifting, so the per-character reveal isn't spent behind an opaque panel.

---

## 3. Motion system

| Name | Spec | Where |
|---|---|---|
| `ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | all entrances |
| `spring-soft` | `stiffness 120, damping 20` | hovers, magnetism |
| `spring-snappy` | `stiffness 280, damping 28` | nav pill, beat dot |
| Reveal | `opacity 0→1`, `y 28→0`, `blur 6→0`, 700ms | section blocks |
| Kinetic text | per-character mask reveal, `y 108%→0` + 4° rotate | headings |
| Stagger | 60–90ms children · 28–45ms characters | lists, headings |

**Smooth scroll:** Lenis, `duration 1.05`, cubic ease-out. Deliberately *not*
scroll-jacking — wheel input maps 1:1 to distance, only interpolation is smoothed.
Native momentum is left alone on touch.

**Scroll state lives outside React** (`lib/scrollStore.ts`). The WebGL layer reads
it every frame in `useFrame`; React is only woken when progress moves >0.5%.
Putting scroll in React state is the single most common way these sites go janky.

---

## 4. The playground demos — honesty notes

Both run fully client-side, no API, nothing sent anywhere.

**Tokenizer** — a *heuristic approximation* of GPT-style BPE, labelled as such in
the UI. The real `cl100k_base` vocabulary is ~1.7MB; shipping it to make a toy
exact isn't worth the bundle. Counts are close estimates.

**Vector similarity** — genuinely real numbers. Each skill becomes a sparse vector
over actual artifacts (3 projects + 1 job + 5 skill categories); scores are true
cosine similarity. It's a term-document co-occurrence model — the same intuition
behind learned embeddings, small enough to verify by hand. The UI names the shared
dimensions so any score can be audited.

> Matching is **token-boundary with light stemming**, not substring. Substring
> matching had `C` matching "React"/"Docker"/"Scikit-learn" and `Java` matching
> "JavaScript", silently inflating every score.

---

## 5. Performance & accessibility guardrails

- **Device tiering** (`lib/deviceTier.ts`): 42k particles desktop / 22k mid /
  9k low, `devicePixelRatio` capped 1.75/1.5/1.0. Coarse pointers never get the
  top tier — thermal throttling is the real limit, not peak FLOPs.
- **three.js is dynamically imported** — not in the initial bundle. First load JS
  ≈172 kB; the page is fully readable before the canvas arrives.
- **Graceful degradation:** no WebGL, context loss, or reduced-motion → canvas is
  never mounted and a CSS gradient (`.field-fallback`) carries the page.
- **`.content-scrim`** sits between canvas and content so copy can never lose a
  contrast fight with the field.
- Canvas is `aria-hidden` decoration; the marquee has an `sr-only` real list.
- Transform/opacity/filter only. Reduced motion collapses everything to a 150ms
  fade and swaps the horizontal rail for a vertical stack.
- SEO: generated OG image, JSON-LD `Person`, sitemap, robots.

---

## 6. File map

```
app/
  layout.tsx              fonts, metadata, JSON-LD
  page.tsx               composes the six beats
  globals.css            @theme tokens, keyframes, scrim, ATS mode
  opengraph-image.tsx    generated 1200×630 link preview
  icon.svg · sitemap.ts · robots.ts
components/
  webgl/     Scene, ParticleField, BeatTracker, particles.glsl, noise.glsl
  layout/    Nav, Preloader, BeatRail, ScrollProgress, CursorGlow,
             CommandPalette, Footer
  sections/  Hero, Statement, WorkRail, Craft, Playground, Contact,
             Tokenizer, SimilarityDemo, ArchitectureDiagram
  ui/        KineticText, MagneticButton, Reveal, Section, SectionHeading
  providers/ SmoothScroll (Lenis)
lib/
  data.ts        ALL content — single source of truth, never edit JSX for copy
  formations.ts  the six particle formations
  beats.ts       scroll → formation mapping
  similarity.ts  co-occurrence vectors + cosine
  tokenize.ts    heuristic BPE
  motion.ts · scrollStore.ts · deviceTier.ts · intro.ts · site.ts
```

---

## 7. Still open

1. **Project links** — no public repos or live demos yet. Cards link to the GitHub
   *profile* with a tooltip saying so; adding `repo`/`demo` to any project in
   `data.ts` makes real buttons appear automatically. **Never fabricate these.**
2. **LinkedIn** — not on the résumé; add to `profile` in `data.ts` if wanted.
3. **Deploy** — set `NEXT_PUBLIC_SITE_URL` when a domain is pointed at it.
4. **Anime background page** — parked. A separate page with crossfading art
   (Ken Burns drift, ~8s swap / 2s dissolve, vignette + grain). Images must be
   owned or licensed; heavy darkening so it reads as atmosphere, not wallpaper.

## Rejected directions

- **Aurora blobs + glass cards on every section** — competent but generic; the
  user's verdict was "very mid". Replaced by the particle field.
- **2D canvas neural graph in About** — superseded by the WebGL field.
- **Explorable 3D world / drivable scene** — maximum wow, but heavy on mobile and
  hostile to a recruiter who wants the résumé in 10 seconds.
- **Pre-rendered image sequence** for scroll animation — needs 100–200 authored
  frames and megabytes of transfer; procedural WebGL is sharper and ~50× lighter.
