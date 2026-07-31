import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
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
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
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
