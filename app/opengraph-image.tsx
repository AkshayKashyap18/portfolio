import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/lib/data";

/*
  Satori resolves fontWeight only against faces actually handed to it. With no
  `fonts` option it falls back to a single-weight Noto Sans, where every weight
  renders identically — rendering this tree at 400 and at 800 produced
  byte-identical PNGs, so the name was shipping regular while claiming 800.

  Both weights have to be loaded, not just the display one: supplying `fonts`
  replaces the fallback entirely rather than adding to it, so a lone 800 face
  renders the whole card extrabold and flattens the hierarchy. Any weight
  without a face here silently snaps to the nearest one that has it.
*/
const fontDir = join(process.cwd(), "assets/fonts");
const displayFace = readFileSync(join(fontDir, "BricolageGrotesque-ExtraBold.ttf"));
const bodyFace = readFileSync(join(fontDir, "BricolageGrotesque-Regular.ttf"));

export const alt = `${profile.name} — ${profile.roles[0]}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generated at build time. Mirrors the site's palette so a shared link looks
 * like the page it opens: warm near-black ground, warm off-white type,
 * violet/cyan aurora wash, name set large. The neutrals here have to be kept in
 * step with the @theme tokens in globals.css by hand — this route renders on the
 * server through Satori, so it cannot read CSS custom properties.
 *
 * Composed centre-out rather than bottom-left, for two reasons that both come
 * from where this image actually gets seen. LinkedIn renders it as a Featured
 * card about 350px wide — a 0.29 scale — so nothing here is smaller than 40px,
 * which is the floor for staying readable after that reduction. The previous
 * 20px letterspaced eyebrow landed at roughly 6px. And consumers that crop a
 * 1.91:1 source toward square take the middle, which used to be the empty right
 * half while the name sat in the left edge that got cut.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0908",
          padding: 64,
          position: "relative",
        }}
      >
        {/* Aurora wash, set on a diagonal so neither half reads as dead space */}
        <div
          style={{
            position: "absolute",
            top: -220,
            left: -180,
            width: 820,
            height: 820,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(124,92,255,0.45) 0%, rgba(124,92,255,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -260,
            right: -200,
            width: 780,
            height: 780,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(34,211,238,0.32) 0%, rgba(34,211,238,0) 70%)",
          }}
        />

        {/* Name — the one element that must survive any reduction */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            fontFamily: "Bricolage Grotesque",
            fontSize: 140,
            fontWeight: 800,
            letterSpacing: -6,
            lineHeight: 0.9,
            color: "#F0ECE5",
          }}
        >
          <span>Akshay</span>
          <span style={{ color: "rgba(240,236,229,0.34)" }}>Kashyap</span>
        </div>

        {/* Gradient rule — separates name from role without adding words */}
        <div
          style={{
            width: 300,
            height: 3,
            marginTop: 58,
            borderRadius: 9999,
            background: "linear-gradient(90deg, #7C5CFF, #22D3EE)",
          }}
        />

        {/* Role — the claim, at a size that reads in a Featured card */}
        <div
          style={{
            display: "flex",
            marginTop: 40,
            padding: "14px 34px",
            borderRadius: 9999,
            background: "linear-gradient(90deg, #7C5CFF, #22D3EE)",
            color: "#fff",
            fontSize: 46,
          }}
        >
          {profile.title}
        </div>

        {/*
          Supporting line. 40px is the legibility floor at the 0.29 scale a
          LinkedIn Featured card renders at, so this shortens rather than
          shrinks: a centred 1:1 crop is x 285..915, and a third term pushed
          this span to x 267..932 — clipping the very edges the centre-out
          composition above exists to protect. Location lives in the page's
          JSON-LD, which is where crawlers read it from anyway.
        */}
        <div
          style={{
            display: "flex",
            marginTop: 34,
            fontSize: 40,
            color: "#9C968C",
            letterSpacing: 1,
          }}
        >
          FastAPI · LLM Systems
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Bricolage Grotesque",
          data: bodyFace,
          weight: 400,
          style: "normal",
        },
        {
          name: "Bricolage Grotesque",
          data: displayFace,
          weight: 800,
          style: "normal",
        },
      ],
    },
  );
}
