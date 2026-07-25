"use client";

import { FadeIn } from "./FadeIn";
import { Media } from "./Media";

const numbers = [
  { value: "5", label: "Korea Smedia Brand Awards", note: "2025 · Aesthetic cosmetics" },
  { value: "8", label: "Consecutive years No.1", note: "Korea Consumer Satisfaction Index" },
  { value: "4", label: "ISO certifications", note: "9001 · 14001 · 17024 · 22716" },
  { value: "5,500+", label: "Partner salons across Asia", note: "Clinics · spas · beauty schools" },
];

const awards = [
  { title: "Korea Premium Company Award", result: "Grand Prize" },
  { title: "Korea Brand One Winner Awards", result: "Grand Prize" },
  { title: "Korea Consumer Preference Award", result: "1st Place" },
  { title: "Korea Customer Satisfaction Award", result: "1st Place" },
  { title: "Best Innovative Company Brand Award", result: "1st Place" },
];

export function Trust() {
  return (
    <section id="trust" className="bg-atmosphere-dark py-24 text-cream sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <FadeIn className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-ash">
            Trust & Credibility
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-cream text-balance sm:text-5xl">
            Winner of 5 awards. No.1 for 8 consecutive years.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-ash">
            A consumer-voted record in Korea&apos;s aesthetic cosmetics category - validated
            by the Korea Consumer Satisfaction Index every year since 2018.
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {numbers.map((n, i) => (
            <FadeIn key={n.label} delay={0.06 * i} className="border-t border-cream/15 pt-5">
              <p className="font-serif text-4xl text-cream sm:text-5xl">{n.value}</p>
              <p className="mt-2 text-sm font-medium text-cream/90">{n.label}</p>
              <p className="mt-1 text-xs text-ash">{n.note}</p>
            </FadeIn>
          ))}
        </div>

        <div className="mt-16 grid items-center gap-10 lg:grid-cols-2">
          <FadeIn>
            <Media
              src="/images/awards-smedia.webp"
              alt="Dermabell winner of 5 Korea Smedia Brand Awards 2025"
              width={820}
              height={495}
              sizes="(max-width: 1024px) 100vw, 520px"
            />
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-[11px] uppercase tracking-[0.2em] text-ash">
              Korea Smedia Brand Awards · 2025
            </p>
            <ul className="mt-6 space-y-4">
              {awards.map((a) => (
                <li
                  key={a.title}
                  className="flex items-baseline justify-between gap-4 border-b border-cream/10 pb-3"
                >
                  <span className="text-sm text-cream/85">{a.title}</span>
                  <span className="shrink-0 font-serif text-accent-wbu">{a.result}</span>
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>

        <FadeIn className="mt-16">
          <p className="mb-5 text-[11px] uppercase tracking-[0.2em] text-ash">
            Customer Satisfaction · 2018-2025
          </p>
          <Media
            src="/images/awards-trophies.webp"
            alt="Dermabell consecutive customer satisfaction trophies"
            width={820}
            height={580}
            sizes="100vw"
            className="overflow-hidden"
            imgClassName="object-cover object-center"
          />
        </FadeIn>
      </div>
    </section>
  );
}
