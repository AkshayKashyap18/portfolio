"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  Github,
  Mail,
  Phone,
  Search,
  FileSpreadsheet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { navSections, profile, projects } from "@/lib/data";
import { easeExpo } from "@/lib/motion";

type Item = {
  id: string;
  label: string;
  hint?: string;
  group: "Navigate" | "Projects" | "Actions";
  icon: React.ReactNode;
  run: () => void;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onToggleAts: () => void;
};

export default function CommandPalette({ open, onClose, onToggleAts }: Props) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (id: string) => {
      onClose();
      // Let the exit animation start before scrolling.
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    [onClose],
  );

  const items: Item[] = useMemo(() => {
    const nav: Item[] = navSections.map((s) => ({
      id: `nav-${s.id}`,
      label: s.label,
      hint: "Section",
      group: "Navigate",
      icon: <ArrowRight className="size-3.5" />,
      run: () => go(s.id),
    }));

    const proj: Item[] = projects.map((p) => ({
      id: `proj-${p.slug}`,
      label: p.name,
      hint: p.tagline,
      group: "Projects",
      icon: <ArrowRight className="size-3.5" />,
      run: () => go(`project-${p.slug}`),
    }));

    const actions: Item[] = [
      {
        id: "copy-email",
        label: "Copy email address",
        hint: profile.email,
        group: "Actions",
        icon: copied ? <Check className="size-3.5 text-lime" /> : <Copy className="size-3.5" />,
        run: () => {
          navigator.clipboard?.writeText(profile.email);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        },
      },
      {
        id: "email",
        label: "Send an email",
        hint: profile.email,
        group: "Actions",
        icon: <Mail className="size-3.5" />,
        run: () => {
          window.location.href = `mailto:${profile.email}`;
          onClose();
        },
      },
      {
        id: "call",
        label: "Call",
        hint: profile.phone,
        group: "Actions",
        icon: <Phone className="size-3.5" />,
        run: () => {
          window.location.href = `tel:${profile.phone.replace(/\s/g, "")}`;
          onClose();
        },
      },
      {
        id: "github",
        label: "Open GitHub profile",
        hint: profile.githubHandle,
        group: "Actions",
        icon: <Github className="size-3.5" />,
        run: () => {
          window.open(profile.github, "_blank", "noopener,noreferrer");
          onClose();
        },
      },
      {
        id: "resume",
        label: "Download résumé",
        hint: "PDF",
        group: "Actions",
        icon: <Download className="size-3.5" />,
        run: () => {
          const a = document.createElement("a");
          a.href = profile.resume;
          a.download = "Akshay-Kashyap-Resume.pdf";
          a.click();
          onClose();
        },
      },
      {
        id: "ats",
        label: "Toggle recruiter / ATS mode",
        hint: "Plain-text, printable view",
        group: "Actions",
        icon: <FileSpreadsheet className="size-3.5" />,
        run: () => {
          onToggleAts();
          onClose();
        },
      },
    ];

    return [...nav, ...proj, ...actions];
  }, [go, onClose, onToggleAts, copied]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        i.hint?.toLowerCase().includes(q) ||
        i.group.toLowerCase().includes(q),
    );
  }, [items, query]);

  // Global ⌘K / Ctrl+K is registered by the parent; here we handle in-palette keys.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setCursor(0);
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    setCursor(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => (filtered.length ? (c + 1) % filtered.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => (filtered.length ? (c - 1 + filtered.length) % filtered.length : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        filtered[cursor]?.run();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, cursor, onClose]);

  // Keep the active row in view.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${cursor}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const groups: Item["group"][] = ["Navigate", "Projects", "Actions"];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <div className="absolute inset-0 bg-bg/70 backdrop-blur-md" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.28, ease: easeExpo }}
            className="glass relative w-full max-w-xl overflow-hidden rounded-2xl"
          >
            {/* Search row */}
            <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3.5">
              <Search className="size-4 shrink-0 text-faint" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a section, project, or action…"
                className="w-full bg-transparent text-sm text-text outline-none placeholder:text-faint"
                aria-label="Search commands"
              />
              <kbd className="hidden shrink-0 rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-faint sm:block">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
              {filtered.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-faint">
                  Nothing matches “{query}”.
                </p>
              )}

              {groups.map((g) => {
                const rows = filtered.filter((i) => i.group === g);
                if (!rows.length) return null;
                return (
                  <div key={g} className="mb-1">
                    <p className="px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-faint uppercase">
                      {g}
                    </p>
                    {rows.map((item) => {
                      const index = filtered.indexOf(item);
                      const active = index === cursor;
                      return (
                        <button
                          key={item.id}
                          data-index={index}
                          type="button"
                          onMouseEnter={() => setCursor(index)}
                          onClick={item.run}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                            active ? "bg-white/[0.07] text-text" : "text-muted"
                          }`}
                        >
                          <span className={active ? "text-violet" : "text-faint"}>
                            {item.icon}
                          </span>
                          <span className="flex-1 text-sm">{item.label}</span>
                          {item.hint && (
                            <span className="hidden truncate font-mono text-[11px] text-faint sm:block">
                              {item.hint}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 border-t border-white/8 px-4 py-2.5 font-mono text-[10px] text-faint">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span className="ml-auto">{filtered.length} results</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
