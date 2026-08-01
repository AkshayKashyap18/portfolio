"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Download, Github, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { profile } from "@/lib/data";
import Section from "@/components/ui/Section";
import MagneticButton from "@/components/ui/MagneticButton";

export default function Contact() {
  const [copied, setCopied] = useState(false);

  function copyEmail() {
    navigator.clipboard?.writeText(profile.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Section id="contact" className="pb-20">
      <div className="sda-stagger relative">
        <div
          className="flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-faint uppercase"
        >
          <span className="text-violet">05</span>
          <span className="h-px w-10 bg-gradient-to-r from-violet/60 to-transparent" />
          <span>Contact</span>
        </div>

        <h2
          className="mt-6 max-w-3xl text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02] font-semibold tracking-[-0.024em] text-balance"
        >
          Let&apos;s build something{" "}
          <span className="text-gradient">intelligent</span>.
        </h2>

        <p
          className="mt-6 max-w-md text-[17px] leading-relaxed text-muted text-pretty"
        >
          If you&apos;re building something in AI or backend engineering and want to talk
          shop, the fastest way to reach me is email — I reply to everything.
        </p>

        {/* Email */}
        <div className="mt-10">
          <a
            href={`mailto:${profile.email}`}
            data-cursor="email"
            className="group relative inline-block text-[clamp(1.1rem,3.6vw,2rem)] font-medium tracking-[-0.02em] break-all"
          >
            {profile.email}
            <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-violet to-cyan transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
          </a>

          <button
            type="button"
            onClick={copyEmail}
            aria-label="Copy email address"
            className="clean-hide relative ml-3 inline-grid size-9 translate-y-1 place-items-center rounded-full border border-white/10 text-muted transition-colors hover:text-text"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Check className="size-4 text-lime" />
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Copy className="size-3.5" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Buttons */}
        <div className="mt-10 flex flex-wrap gap-3">
          <MagneticButton href={`mailto:${profile.email}`} cursorLabel="write">
            <Mail className="size-4" />
            Email me
          </MagneticButton>
          <MagneticButton href={profile.github} external variant="ghost" cursorLabel="open">
            <Github className="size-4" />
            GitHub
          </MagneticButton>
          <MagneticButton href={profile.resume} download variant="ghost" cursorLabel="get">
            <Download className="size-4" />
            Résumé
          </MagneticButton>
        </div>

        {/* Direct details */}
        <dl
          className="mt-14 grid gap-6 border-t border-white/8 pt-8 sm:grid-cols-3"
        >
          {[
            { label: "Email", value: profile.email, icon: Mail, href: `mailto:${profile.email}` },
            {
              label: "Phone",
              value: profile.phone,
              icon: Phone,
              href: `tel:${profile.phone.replace(/\s/g, "")}`,
            },
            {
              label: "GitHub",
              value: profile.githubHandle,
              icon: Github,
              href: profile.github,
            },
          ].map((d) => (
            <div key={d.label}>
              <dt className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] text-faint uppercase">
                <d.icon className="size-3" />
                {d.label}
              </dt>
              <dd className="mt-1.5">
                <a
                  href={d.href}
                  className="inline-flex min-h-6 items-center text-[14px] break-all text-muted transition-colors hover:text-text"
                >
                  {d.value}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
