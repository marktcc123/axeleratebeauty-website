"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FadeIn } from "./FadeIn";
import { Media } from "./Media";
import {
  boostPeels,
  controlSolutions,
  gallery,
  highEssential,
  professionalLine,
  skinPrograms,
} from "@/data/products";

export function System() {
  const [activeAmpoule, setActiveAmpoule] = useState(0);
  const [activeProgram, setActiveProgram] = useState(0);
  const [familyIndex, setFamilyIndex] = useState(0);
  const ampoule = controlSolutions[activeAmpoule];
  const program = skinPrograms[activeProgram];
  const family = gallery.family[familyIndex];

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
            Real product photography from the Dermabell catalog. One shelf covers every
            guest: 5 Activators, 10 Control Solutions, 5 Completion Creams.
          </p>
        </FadeIn>

        {/* Family product photography carousel */}
        <FadeIn className="mt-12">
          <div className="overflow-hidden bg-sand-50">
            <AnimatePresence mode="wait">
              <motion.div
                key={family.src}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <Media
                  src={family.src}
                  alt={family.alt}
                  width={1200}
                  height={1500}
                  sizes="(max-width: 1152px) 100vw, 1152px"
                  className="max-h-[70vh]"
                  imgClassName="max-h-[70vh] w-full object-contain object-center"
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs tracking-wide text-muted">
              Fit-formance system family · studio catalog
            </p>
            <div className="flex gap-2">
              {gallery.family.map((shot, i) => (
                <button
                  key={shot.src}
                  type="button"
                  aria-label={`Show family shot ${i + 1}`}
                  onClick={() => setFamilyIndex(i)}
                  className={`h-2 w-2 transition ${
                    i === familyIndex ? "bg-charcoal" : "bg-ash/50 hover:bg-ash"
                  }`}
                />
              ))}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.08} className="mt-12 max-w-3xl space-y-6">
          <p className="font-serif text-2xl text-ink">5 x 10 x 5</p>
          <p className="text-muted">
            Up to 250 customized recipes from a single Fit-formance kit - no dead stock.
            Proprietary ActiColpep and Plant Exosomes LTPS sit at the core of every
            Activator, Solution, and Cream.
          </p>
        </FadeIn>

        {/* 5 skin programs */}
        <FadeIn className="mt-24">
          <h3 className="font-serif text-3xl text-ink">5 Skin Programs</h3>
          <p className="mt-3 max-w-xl text-muted">
            Each program pairs a Formula Concentration Activator with a matching Formula
            Completion Cream - color-coded for fast chair-side selection.
          </p>

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
                <span className="h-2 w-2 shrink-0" style={{ backgroundColor: p.tone }} />
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

        {/* 10 Control Solutions with product flyers */}
        <FadeIn className="mt-24">
          <h3 className="font-serif text-3xl text-ink">10 Control Solutions</h3>
          <p className="mt-3 max-w-2xl text-muted">
            Click a code to preview the official product card - concern, key active, and
            before/after reference for staff training and guest education.
          </p>

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

          <div className="mt-8 grid items-start gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
            <div className="space-y-5">
              <Media
                src="/images/ampoules.webp"
                alt="Control Solution ampoule vials 01-10"
                width={800}
                height={800}
                sizes="(max-width: 1024px) 100vw, 480px"
                className="bg-sand-50"
                imgClassName="object-cover"
              />
              <div className="border-t border-stone-deep/10 pt-5">
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
                    <p className="mt-3 font-serif text-xl text-ink">
                      Key active · {ampoule.ingredient}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{ampoule.blurb}</p>
                    <p className="mt-4 text-xs leading-relaxed text-muted">
                      Freely mixable · standalone · stronger synergy with Dermabell Duo
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={ampoule.image}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden bg-white"
              >
                <Media
                  src={ampoule.image}
                  alt={`${ampoule.code} Control Solution product card`}
                  width={900}
                  height={1125}
                  sizes="(max-width: 1024px) 100vw, 560px"
                  imgClassName="object-contain object-top"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </FadeIn>

        {/* Studio product photography */}
        <FadeIn className="mt-24">
          <h3 className="font-serif text-3xl text-ink">In-spa product stills</h3>
          <p className="mt-3 max-w-xl text-muted">
            Wash-off packs, peels, and chair-side formulas - the visuals guests see on
            your shelf.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.studio.map((shot) => (
              <figure key={shot.src} className="bg-sand-50">
                <Media
                  src={shot.src}
                  alt={shot.alt}
                  width={900}
                  height={1200}
                  sizes="(max-width: 1024px) 50vw, 360px"
                  className="aspect-[3/4]"
                  imgClassName="h-full w-full object-cover"
                />
                <figcaption className="px-3 py-3 text-xs tracking-wide text-muted">
                  {shot.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </FadeIn>

        {/* Line lists */}
        <div className="mt-24 grid gap-12 lg:grid-cols-2">
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
        </div>

        {/* High-Essential retail attach with photos */}
        <FadeIn className="mt-24">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">High-Essential</p>
          <h3 className="mt-2 font-serif text-3xl text-ink">Retail attach that sells itself</h3>
          <p className="mt-3 max-w-xl text-muted">
            Melting Mask and Luxe Glow Cream drive the +80% aftercare retail lift - shown
            with official product photography.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {highEssential.map((item) => (
              <figure key={item.name} className="bg-sand-50">
                <Media
                  src={item.image}
                  alt={item.name}
                  width={900}
                  height={1200}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="aspect-[3/4] bg-ink/5"
                  imgClassName="h-full w-full object-cover"
                />
                <figcaption className="space-y-2 px-4 py-4">
                  <p className="font-serif text-xl text-ink">{item.name}</p>
                  <p className="text-sm leading-relaxed text-muted">{item.detail}</p>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {gallery.accents.map((shot) => (
              <Media
                key={shot.src}
                src={shot.src}
                alt={shot.alt}
                width={800}
                height={600}
                sizes="33vw"
                className="aspect-[4/3] overflow-hidden bg-sand-100"
                imgClassName="h-full w-full object-cover"
              />
            ))}
          </div>
        </FadeIn>

        {/* Hand cards */}
        <FadeIn className="mt-20">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Product Hand Card</p>
          <h3 className="mt-2 font-serif text-2xl text-ink">Partner catalog pages</h3>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <figure>
              <Media
                src="/images/handcard/page-1.webp"
                alt="Dermabell hand card page 1"
                width={1200}
                height={1696}
                sizes="(max-width: 768px) 100vw, 560px"
                className="border border-sand-200 bg-white"
                imgClassName="object-contain object-top"
              />
              <figcaption className="mt-2 text-xs text-muted">
                Page 1 · Professional Line + Control Solutions
              </figcaption>
            </figure>
            <figure>
              <Media
                src="/images/handcard/page-2.webp"
                alt="Dermabell hand card page 2"
                width={1200}
                height={1696}
                sizes="(max-width: 768px) 100vw, 560px"
                className="border border-sand-200 bg-white"
                imgClassName="object-contain object-top"
              />
              <figcaption className="mt-2 text-xs text-muted">
                Page 2 · Activators, Creams, Peels, High-Essential
              </figcaption>
            </figure>
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
                  Solution delivery and Ritual+ phototherapy.
                </p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1} className="bg-sand-100 p-8 sm:p-10">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Kick-Off Package</p>
            <p className="mt-3 font-serif text-3xl text-ink sm:text-4xl">Everything to go live</p>
            <p className="mt-2 text-sm text-muted">One-time setup. No franchise fee. No royalty.</p>
            <ul className="mt-8 space-y-4 text-sm text-stone-deep">
              <li className="border-b border-stone-deep/10 pb-3">
                Fit-formance products + SOP + training
              </li>
              <li className="border-b border-stone-deep/10 pb-3">
                AI Analyzer + Duo 2-in-1
              </li>
              <li className="border-b border-stone-deep/10 pb-3">
                Materials + 600-session consumables
              </li>
            </ul>
            <p className="mt-8 text-sm leading-relaxed text-muted">
              Typical payback in weeks, not months - ask us to model your store numbers.
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
