# Plan v2 — Adding professional work, removing "open to work"

Status: **plan only, nothing built yet.** Case-study copy for the two de-identified
professional projects is being extracted from the real codebases.

---

## 1. Decisions locked

| Question | Decision |
|---|---|
| Client names | **None.** Fully de-identified — no client names, no staff names, no internal system identifiers |
| Project names | **Descriptive**, not internal codenames |
| Framing | First person — "I built X", "I was part of the team that Y" |
| Attribution | Explicit **My role** block per project; team metrics labelled as team outcomes |
| Layout | **One Work section, two tabbed groups** — keeps the 6-beat scroll narrative intact |
| Testimonials | **Not used.** They praise the company, not Akshay |
| Positioning | **No "open to work"** anywhere — this is a portfolio, not a job hunt |

### Open question for Akshay
The **Craft** section currently reads `AI Developer @ Alrium`. His own employment is
a credential rather than confidential information, and it's already on his résumé,
so the plan **keeps it**. If he wants it stripped, it's a one-line change in
`lib/data.ts` (`experience[0].company`) — say the word.

---

## 2. Removing "open to work"

Six places carry job-seeking signals today:

| File | Now | Becomes |
|---|---|---|
| `lib/data.ts` | `available: true` | field removed entirely |
| `Hero.tsx` | `● Open to work` + lime pulse | drop the pill; eyebrow becomes `AI · Backend · LLM Systems` + location |
| `Contact.tsx` | "I'm open to roles and collaborations…" | "If you're building something in this space, I'd like to hear about it." |
| `opengraph-image.tsx` | lime dot + `Open to work` | `AI · Backend · LLM Systems` |
| `Craft.tsx` | — | unchanged |
| `globals.css` | `.pulse-dot` | keep the utility (harmless), just unused |

Headline `Let's build something intelligent.` stays — it's an invitation to
collaborate, not a request for employment.

---

## 3. Work section — new structure

One section, one beat (`lattice` formation), two groups behind a segmented control.

```
┌─ 02 — WORK ──────────────────────────────────────────────┐
│  Things I've built                                       │
│                                                          │
│  ╭──────────────────╮ ╭──────────────────╮               │
│  │ Production  (3)  │ │ Personal    (3)  │   ← segmented │
│  ╰──────────────────╯ ╰──────────────────╯     control   │
│                                                          │
│  ◄──── horizontal rail, scroll-driven ────►              │
└──────────────────────────────────────────────────────────┘
```

- **Production first** — it's the stronger, more recent work.
- Segmented control: glass pill, `layoutId` indicator, count badges,
  `role="tablist"` with arrow-key navigation.
- Switching tabs resets the rail to `x: 0` and staggers the new cards in
  (fade + rise, 60ms apart).
- **Beat re-measure on tab change** — the rail's scroll distance depends on card
  count, so `measureBeats()` must re-run or the particle formations drift out of
  sync with the sections. (`BeatTracker` already observes `document.body`, but the
  tab switch needs an explicit re-measure to be safe.)

### Card anatomy (additions in bold)

```
┌──────────────────────────────────────────────────  01 ─┐
│ AGENTIC QUOTE ENGINE            **PRODUCTION · 2026**  │
│ One line hook…                                         │
│                                                        │
│ ┃ MY ROLE                          ← **new block**     │
│ ┃ What Akshay personally owned.                        │
│                                                        │
│ PROBLEM    APPROACH    OUTCOME     ← existing          │
│                                                        │
│ **TEAM OUTCOME · 24h → 4min**      ← **labelled**      │
│                                                        │
│ [stack chips]              [architecture diagram]      │
└────────────────────────────────────────────────────────┘
```

The **My role** block gets an accent left-border so it reads as the most important
thing on the card — because for a portfolio, it is.

---

## 4. Data model changes — `lib/data.ts`

```ts
export type Project = {
  slug: string;
  name: string;                    // descriptive, never a client codename
  tagline: string;
  hook: string;
  problem: string;
  approach: string;
  outcome: string;
  role?: string;                   // NEW — "My role", honest scope
  kind: "production" | "personal"; // NEW — drives the tabs
  period?: string;                 // NEW — "2026"
  teamMetrics?: { label: string; value: string }[]; // NEW — labelled as team
  bullets: string[];
  stack: string[];
  repo?: string;                   // personal projects only
  demo?: string;
  architecture: { nodes: {...}[]; edges: [string, string][] };
  accent: "violet" | "cyan" | "lime";
};
```

Everything stays content-in-`data.ts`, so this never becomes a JSX edit.

---

## 5. The six projects

### Production (de-identified)
| # | Name (working) | What it is |
|---|---|---|
| 1 | **Agentic Quote Engine** | Autonomous agent that turns a plain-English process description into a priced, spec'd quote. LangGraph · Gemini · FastAPI · React · Supabase |
| 2 | **LLM Document Extraction Pipeline** | LLM reads financial rate documents and returns structured offers, replacing a brittle legacy ML model. AWS Bedrock · Claude · Python · Selenium · BeautifulSoup |
| 3 | **Lakehouse Migration Platform** | ERP → medallion lakehouse migration with incremental change detection. *(content pending extraction)* |

### Personal
| # | Name | Change |
|---|---|---|
| 4 | **MindMate** | + real repo link — `github.com/AkshayKashyap18/Mindmate` |
| 5 | **EduMorph** | + real repo link — `github.com/AkshayKashyap18/edumorph` |
| 6 | **MCP Todo** | + real repo link — `github.com/AkshayKashyap18/Mcp-todo` |

> The "repo isn't public yet" tooltip currently on all three cards is **factually
> wrong** — those repos exist and are public. Fixing this is independent of
> everything else here and should ship regardless.

---

## 6. Knock-on improvements

**Skills get real depth.** The professional work legitimately adds: LangGraph,
AWS Bedrock, Microsoft Fabric, Delta Lake, PySpark, Terraform, Gemini, Selenium,
BeautifulSoup, Lambda. Today's skill list (Excel, Power BI, Java) undersells him
badly next to what he actually ships.

**The similarity demo gets better for free.** Its vectors are dimensioned by real
projects and jobs — going from 3 projects to 6, with a much richer stack, makes the
cosine scores more meaningful and the "shared dimensions" explanations more
interesting. Worth re-checking `mentions()` handles multi-word additions like
"Microsoft Fabric" and "AWS Bedrock" (it should: leading-token match).

**Architecture diagrams** — three more scroll-drawn SVG diagrams, one per
professional project. This is where the engineering depth shows.

---

## 7. What I will NOT do

- No client names, staff names, or internal system names.
- No client testimonials.
- No presenting team metrics as personal achievements.
- No invented numbers — every metric traces to a file in the real repo, or is cut.
- No copying the case-study decks' visual style (that's the company's marketing).
- No credentials, connection strings, bucket names, or client data in the repo.

---

## 8. Build order

1. Strip "open to work" (6 small edits) — independent, ships immediately
2. Add real repo links to the 3 personal projects — independent, fixes a wrong claim
3. Extend the `Project` type + add `kind`/`role`/`period`/`teamMetrics`
4. Build the segmented control + tab filtering in `WorkRail`
5. Add `My role` and `Team outcome` blocks to the card
6. Write the 3 production case studies from extracted facts
7. Expand skills, verify the similarity demo still behaves
8. Re-measure beats on tab change; verify formations stay aligned
9. Browser-verify: both tabs, rail distance, mobile, reduced motion
