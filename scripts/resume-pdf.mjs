/**
 * Renders /resume to public/Akshay-Kashyap-Resume.pdf.
 *
 * The PDF a recruiter downloads and the résumé on the site are the same document
 * now — this script is the only thing that makes that true, so run it whenever
 * lib/data.ts or lib/resume.ts changes:
 *
 *   npm run build && npx next start -p 3123 &
 *   npm run resume:pdf
 *
 * Deliberately NOT a build step and NOT a saved dependency. It needs a real
 * browser, and adding a headless-Chrome package to a portfolio's dependency list
 * to regenerate a document that changes a few times a year is a bad trade. Install
 * it when you need it:
 *
 *   npm i -D puppeteer-core --no-save
 *
 * Chrome's print pipeline is used rather than a PDF library because it produces
 * real selectable text with the fonts embedded, and because it renders the exact
 * print stylesheet in app/resume/print.css — one source of truth for the layout
 * instead of a second implementation that drifts.
 */

import { existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";

const URL = process.env.RESUME_URL || "http://localhost:3123/resume";
const OUT = "public/Akshay-Kashyap-Resume.pdf";

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const chrome = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!chrome) {
  console.error("No Chrome found. Set CHROME_PATH to your browser binary.");
  process.exit(1);
}

const { default: puppeteer } = await import("puppeteer-core");

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();

const failures = [];
page.on("pageerror", (e) => failures.push(e.message));
page.on("response", (r) => {
  if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`);
});

await page.goto(URL, { waitUntil: "networkidle2", timeout: 120_000 });
// Web fonts must be resolved before layout is measured, or the pagination shifts.
await page.evaluateHandle("document.fonts.ready");
await new Promise((r) => setTimeout(r, 1200));

const pdf = await page.pdf({
  // preferCSSPageSize honours the @page rule in print.css, so the margins live
  // with the stylesheet rather than being duplicated here.
  preferCSSPageSize: true,
  printBackground: true,
  displayHeaderFooter: false,
  tagged: true,
});

await writeFile(OUT, pdf);

const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
console.log(`${OUT} — ${(pdf.length / 1024).toFixed(0)} kB, ${pages} page${pages === 1 ? "" : "s"}`);
if (failures.length) {
  console.error("Problems while rendering:", failures.slice(0, 5));
  process.exitCode = 1;
}

await browser.close();
