import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { profile } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-jb",
  display: "swap",
});

/*
  The display face, chosen rather than defaulted.

  --font-display previously pointed at var(--font-geist), which is defined nowhere
  in this repository: Geist is Vercel's own typeface and was never loaded here. An
  undefined var() inside a font-family list invalidates the whole declaration, so
  every heading silently inherited Inter — the most-used typeface on the web and
  the one a generated site always lands on. The token also had no consumers, so
  even a valid value would have changed nothing.

  Bricolage Grotesque over the alternatives, decided by rendering the name at
  108px in eight faces and looking at them rather than reading about them. Inter
  and Space Grotesk are the two most template-adjacent sans faces there are.
  Instrument Serif was the most striking by a distance and is the one to revisit,
  but it ships a single 400 weight, and 400-weight high-contrast hairlines at
  clamp(3rem, 13vw, 10.5rem) sit directly over 42,000 moving particles — thin
  strokes would shimmer against them. Bricolage has genuine character in the 'a'
  terminal and the straight-tailed 'y', carries weights to 800 so the existing
  type scale still works, and holds up at display size.
*/
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display-face",
  display: "swap",
  /*
    opsz only. Passing wdth as well ships the full three-axis file at 131 kB when
    the two-axis build is 77 kB, and nothing sets a width — the wdth override
    that briefly existed was removed for making the headings collide. 54 kB of
    font for an axis with no consumer.
  */
  axes: ["opsz"],
});
const SITE = SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: `${profile.name} — ${profile.roles[0]}`,
    template: `%s — ${profile.name}`,
  },
  description: profile.pitch,
  authors: [{ name: profile.name, url: profile.github }],
  creator: profile.name,
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE,
    title: `${profile.name} — ${profile.roles[0]}`,
    description: profile.pitch,
    siteName: profile.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — ${profile.roles[0]}`,
    description: profile.pitch,
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.roles[0],
  email: `mailto:${profile.email}`,
  telephone: profile.phone,
  url: SITE,
  sameAs: [profile.github],
  address: { "@type": "PostalAddress", addressLocality: "Bangalore", addressCountry: "IN" },
  alumniOf: { "@type": "CollegeOrUniversity", name: "REVA University" },
  worksFor: { "@type": "Organization", name: "Alrium" },
  knowsAbout: ["Artificial Intelligence", "Backend Development", "FastAPI", "Large Language Models"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} ${bricolage.variable}`}>
      <body>
        {children}
        <div className="grain-overlay clean-hide" aria-hidden />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
