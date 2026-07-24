"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FadeIn } from "./FadeIn";
import {
  boostPeels,
  controlSolutions,
  highEssential,
  professionalLine,
  skinPrograms,
} from "@/data/products";

export function System() {
  const [activeAmpoule, setActiveAmpoule] = useState(0);
  const [activeProgram, setActiveProgram] = useState(0);
  const ampoule = controlSolutions[activeAmpoule];
  const program = skinPrograms[activeProgram];

  return (
    <section id="system" className="relative bg-cream py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <FadeIn className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted">
            The Dermabell System
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-ink text-balance sm:text-5xl">
            Fit-formance: 1 inventory, 250 recipes.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Built from the Dermabell professional hand-card matrix. One shelf covers
            every guest: 5 Activators open the pathway, 10 Control Solutions target the
            concern, 5 Completion Creams seal the finish.
          </p>
        </FadeIn>

        <div className="mt-14 grid items-center gap-12 lg:grid-cols-2">
          <FadeIn>
            <img
              src="/images/product-line.png"
              alt="Dermabell Fit-formance professional product line"
              className="w-full object-cover"
            />
          </FadeIn>

          <FadeIn delay={0.12} className="space-y-8">
            <div>
              <p className="font-serif text-2xl text-ink">5 x 10 x 5</p>
              <p className="mt-2 text-muted">
                Up to 250 customized recipes from a single Fit-formance kit - no dead
                stock. Proprietary ActiColpep and Plant Exosomes LTPS sit at the core of
                every Activator, Solution, and Cream.
              </p>
            </div>

            <div className="space-y-4 border-t border-stone-deep/10 pt-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Proprietary</p>
                <p className="mt-1 font-serif text-xl text-ink">ActiColpep</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Dandelion-root Lactobacillus postbiotic + Oligopeptide-1 + five collagen
                  types (I, III, IV, VII, XVII) - engineered to penetrate, not sit on skin.
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Patent 10-2646353</p>
                <p className="mt-1 font-serif text-xl text-ink">Plant Exosomes LTPS</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Low-temperature vacuum extraction preserves 135-220 nm nanovesicles that
                  signal skin cells directly.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* 5 skin programs from hand card */}
        <FadeIn className="mt-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="font-serif text-3xl text-ink">5 Skin Programs</h3>
              <p className="mt-3 max-w-xl text-muted">
                Each program pairs a Formula Concentration Activator with a matching
                Formula Completion Cream - color-coded for fast chair-side selection.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {skinPrograms.map((p, i) => (
              <button
                key={p.code}
                type="button"
                onClick={() => setActiveProgram(i)}
                className={`flex items-center gap-2 border px-3 py-2 text-left transition ${
                  i === activeProgram
                    ? "border-charcoal bg-charcoal text-cream"
                    : "border-sand-200 bg-sand-50 text-stone-deep hover:border-stone-deep/40"
                }`}
              >
                <span
                  className="h-2 w-2 shrink-0"
                  style={{ backgroundColor: p.tone }}
                />
                <span className="text-xs font-medium tracking-wide">{p.code}</span>
                <span className={`text-xs ${i === activeProgram ? "text-cream/70" : "text-muted"}`}>
                  {p.name}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 border-t border-stone-deep/10 pt-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={program.code}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="grid gap-8 sm:grid-cols-2"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                    Concentration Activator · 100ml
                  </p>
                  <p className="mt-2 font-serif text-xl text-ink">{program.code} Activator</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{program.activator}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
                    Completion Cream · 190g / 30g
                  </p>
                  <p className="mt-2 font-serif text-xl text-ink">{program.code} Cream</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{program.cream}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </FadeIn>

        {/* 10 Control Solutions from hand card */}
        <FadeIn className="mt-24">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h3 className="font-serif text-3xl text-ink">10 Control Solutions</h3>
              <p className="mt-3 max-w-lg text-muted">
                Fit-formance ampoules (3.5ml x 7). Each vial targets one concern with a
                named active - freely mixable, standalone, or driven in with the Dermabell Duo.
              </p>
            </div>
            <img
              src="/images/ampoules.png"
              alt="Dermabell Control Solution ampoules 01-10"
              className="w-full object-cover"
            />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {controlSolutions.map((a, i) => {
              const on = i === activeAmpoule;
              return (
                <button
                  key={a.code}
                  type="button"
                  onClick={() => setActiveAmpoule(i)}
                  className={`border-t-2 px-2 py-3 text-left transition ${
                    on ? "bg-sand-100" : "bg-transparent hover:bg-sand-50"
                  }`}
                  style={{ borderColor: a.tone }}
                >
                  <p className="text-xs font-medium tracking-wide text-stone-deep">{a.code}</p>
                  <p className="mt-0.5 text-sm text-muted">{a.concern}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-6 border border-stone-deep/10 bg-sand-50 p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={ampoule.code}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <p className="font-serif text-3xl text-ink">{ampoule.code}</p>
                  <p className="text-sm uppercase tracking-[0.18em] text-muted">
                    {ampoule.concern}
                  </p>
                </div>
                <p className="mt-4 font-serif text-xl text-ink">
                  Key active · {ampoule.ingredient}
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                  {ampoule.blurb}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </FadeIn>

        {/* Professional + Peels + High-Essential from hand card */}
        <div className="mt-24 grid gap-12 lg:grid-cols-3">
          <FadeIn>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Professional Line</p>
            <h3 className="mt-2 font-serif text-2xl text-ink">Back-bar essentials</h3>
            <ul className="mt-5 space-y-2.5 border-t border-stone-deep/10 pt-5">
              {professionalLine.map((item) => (
                <li key={item} className="text-sm text-muted">
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>

          <FadeIn delay={0.08}>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">LPR Boost Peel</p>
            <h3 className="mt-2 font-serif text-2xl text-ink">3-step exfoliation</h3>
            <ul className="mt-5 space-y-4 border-t border-stone-deep/10 pt-5">
              {boostPeels.map((peel) => (
                <li key={peel.name}>
                  <p className="text-sm font-medium text-stone-deep">{peel.name}</p>
                  <p className="mt-1 text-sm text-muted">{peel.detail}</p>
                </li>
              ))}
            </ul>
          </FadeIn>

          <FadeIn delay={0.12}>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">High-Essential</p>
            <h3 className="mt-2 font-serif text-2xl text-ink">Retail attach</h3>
            <ul className="mt-5 space-y-2.5 border-t border-stone-deep/10 pt-5">
              {highEssential.map((item) => (
                <li key={item} className="text-sm text-muted">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              Home-care heroes for checkout - Melting Mask, Luxe Glow Cream, and more drive
              the +80% aftercare retail lift.
            </p>
          </FadeIn>
        </div>

        {/* Hand card reference visuals */}
        <FadeIn className="mt-20">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Product Hand Card</p>
          <h3 className="mt-2 font-serif text-2xl text-ink">Full catalog reference</h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <img
              src="/images/handcard/page-1.png"
              alt="Dermabell product hand card - Professional Line and Control Solutions"
              className="w-full border border-sand-200 object-cover object-top"
            />
            <img
              src="/images/handcard/page-2.png"
              alt="Dermabell product hand card - Activators, Creams, Peels, High-Essential"
              className="w-full border border-sand-200 object-cover object-top"
            />
          </div>
        </FadeIn>

        <div className="mt-24 grid gap-12 lg:grid-cols-2">
          <FadeIn className="space-y-6">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted">
              The Equipment
            </p>
            <h3 className="font-serif text-3xl text-ink">Two machines. The whole conversion engine.</h3>

            <div className="space-y-6 border-t border-stone-deep/10 pt-6">
              <div>
                <p className="font-serif text-xl text-ink">AI Skin Analyzer</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  60-second scan of moisture, pigmentation, pores, wrinkles, sensitivity,
                  and texture. A customer-facing report does the selling - not your staff.
                </p>
              </div>
              <div>
                <p className="font-serif text-xl text-ink">Dermabell Duo 2-in-1</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Ultrasonic infusion + multi-wavelength LED in one chassis. Drives Control
                  Solution delivery and Ritual+ phototherapy. Plug-in. No clinic permits.
                </p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1} className="bg-sand-100 p-8 sm:p-10">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Kick-Off Package</p>
            <p className="mt-3 font-serif text-5xl text-ink">$20,000</p>
            <p className="mt-2 text-sm text-muted">One-time. No franchise fee. No royalty.</p>

            <ul className="mt-8 space-y-4 text-sm text-stone-deep">
              <li className="flex justify-between gap-4 border-b border-stone-deep/10 pb-3">
                <span>Fit-formance products + SOP + training</span>
                <span className="shrink-0 text-muted">$13,000</span>
              </li>
              <li className="flex justify-between gap-4 border-b border-stone-deep/10 pb-3">
                <span>AI Analyzer + Duo 2-in-1</span>
                <span className="shrink-0 text-muted">$5,000</span>
              </li>
              <li className="flex justify-between gap-4 border-b border-stone-deep/10 pb-3">
                <span>Materials + 600-session consumables</span>
                <span className="shrink-0 text-muted">$2,000</span>
              </li>
            </ul>

            <p className="mt-8 text-sm leading-relaxed text-muted">
              Typical payback in 5-6 weeks. Consumables cover 600 sessions - investment
              recovered well before session 400.
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
