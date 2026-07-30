"use client";

import { ArrowUp, FileSpreadsheet } from "lucide-react";
import { profile } from "@/lib/data";

export default function Footer({ onToggleClean, clean }: { onToggleClean: () => void; clean: boolean }) {
  return (
    <footer className="relative border-t border-white/8 px-6 py-10">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[11px] tracking-wide text-muted">
            {profile.name}
          </p>
          <p className="mt-1 font-mono text-[10px] text-faint">
            © {new Date().getFullYear()} · Built with Next.js, Tailwind &amp; Framer Motion
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleClean}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 font-mono text-[11px] transition-colors ${
              clean
                ? "border-violet/50 bg-violet/10 text-text"
                : "border-white/10 text-muted hover:text-text"
            }`}
            aria-pressed={clean}
          >
            <FileSpreadsheet className="size-3" />
            {clean ? "Exit clean mode" : "Clean mode"}
          </button>

          <a
            href="#top"
            aria-label="Back to top"
            className="clean-hide grid size-9 place-items-center rounded-full border border-white/10 text-muted transition-all duration-300 hover:-translate-y-0.5 hover:text-text"
          >
            <ArrowUp className="size-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
