"use client";

import Section from "@/components/ui/Section";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Tokenizer from "./Tokenizer";
import SimilarityDemo from "./SimilarityDemo";

export default function Playground() {
  return (
    <Section id="playground">
      <SectionHeading index="04" title="Playground" kicker="Try it yourself" />

      <Reveal delay={0.1}>
        <p className="mt-5 max-w-xl text-[15px] text-muted text-pretty">
          Two things I work with daily, made touchable. Both run entirely in your browser —
          no API calls, nothing sent anywhere.
        </p>
      </Reveal>

      <div className="ats-hide mt-12 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <Tokenizer />
        </Reveal>
        <Reveal delay={0.1}>
          <SimilarityDemo />
        </Reveal>
      </div>
    </Section>
  );
}
