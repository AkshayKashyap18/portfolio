import { ImageResponse } from "next/og";
import { profile } from "@/lib/data";

export const alt = `${profile.name} — ${profile.roles[0]}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generated at build time. Mirrors the site's palette so a shared link looks
 * like the page it opens — dot grid, violet/cyan wash, name set large.
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
          justifyContent: "flex-end",
          background: "#07070B",
          padding: 72,
          position: "relative",
        }}
      >
        {/* Aurora wash */}
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -120,
            width: 760,
            height: 760,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(124,92,255,0.42) 0%, rgba(124,92,255,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 40,
            right: -140,
            width: 620,
            height: 620,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(34,211,238,0.3) 0%, rgba(34,211,238,0) 70%)",
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 20,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#9494a3",
            fontFamily: "monospace",
          }}
        >
          AI · Backend · LLM Systems
          <div style={{ width: 60, height: 1, background: "rgba(255,255,255,0.2)" }} />
          Bangalore, India
        </div>

        {/* Name */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 28,
            fontSize: 132,
            fontWeight: 800,
            letterSpacing: -6,
            lineHeight: 0.92,
            color: "#EDEDF2",
          }}
        >
          <span>Akshay</span>
          <span style={{ color: "rgba(237,237,242,0.35)" }}>Kashyap</span>
        </div>

        {/* Role strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginTop: 36,
            fontSize: 28,
            color: "#9494a3",
          }}
        >
          <span
            style={{
              padding: "10px 24px",
              borderRadius: 9999,
              background: "linear-gradient(90deg, #7C5CFF, #22D3EE)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 24,
            }}
          >
            AI Developer
          </span>
          <span>Backend · LLM Systems</span>
        </div>
      </div>
    ),
    size,
  );
}
