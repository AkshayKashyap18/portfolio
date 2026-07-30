/**
 * Canonical site URL. Change this once you point a domain at the deployment —
 * metadata, sitemap and robots all read from here.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://akshaykashyap.vercel.app";
