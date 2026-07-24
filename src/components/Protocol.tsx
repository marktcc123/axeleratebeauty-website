"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FadeIn } from "./FadeIn";

type Step = {
  n: string;
  title: string;
  time: string;
  detail: string;
  addon?: boolean;
};

const steps: Step[] = [
  { n: "01", title: "Welcome & Cover", time: "2 min", detail: "Warm blanket, hair wrap, set today's care direction." },
  { n: "02", title: "Skin Reading & Plan", time: "2 min", detail: "Read hydration and oil balance with the AI analyzer." },
  { n: "03", title: "Oil Cleanse", time: "2 min", detail: "Slow outward circles — makeup and sunscreen off." },
  { n: "04", title: "Foam Cleanse", time: "2 min", detail: "Whipped cloud-soft foam for a deeper reset." },
  { n: "05", title: "LPR Boost Peel", time: "5 min", detail: "Dissolve dead cells — open the pathway for actives." },
  { n: "06", title: "Blackhead Softening", time: "5 min", detail: "Softening solution on T-zone — runs parallel to peel.", addon: true },
  { n: "07", title: "Extraction", time: "2 min", detail: "Fine-needle T-zone extraction. Clean, no lingering redness.", addon: true },
  { n: "08", title: "LED Phototherapy", time: "5 min", detail: "Blue for oil-prone zones; red for repair.", addon: true },
  { n: "09", title: "Sculpting Massage", time: "8 min", detail: "Drainage and jawline contour — the step guests remember.", addon: true },
  { n: "10", title: "Calming Mist", time: "30 sec", detail: "Fine mist of Hydro H₂O in slow circles." },
  { n: "11", title: "Ultrasonic Serum + Cream", time: "3 min", detail: "Drive Control Solution ultrasonically; seal with cream." },
  { n: "12", title: "Eye Cover & Gauze", time: "1 min", detail: "Cotton over eyes, smooth gauze across the face." },
  { n: "13", title: "Modelling Mask", time: "5 min", detail: "Whisk Modeling Pack; spread over gauze." },
  { n: "14", title: "Scalp Point Massage", time: "3 min", detail: "Temples and crown — parallel to the mask set.", addon: false },
  { n: "15", title: "Reset & Check-in", time: "3 min", detail: "Refresh tools and reconnect with the guest." },
  { n: "16", title: "Toner · Serum · Cream · SPF", time: "2 min", detail: "Four-layer finish with take-home advice." },
];

export function Protocol() {
  const [active, setActive] = useState(0);
  const current = steps[active];

  return (
    <section id="protocol" className="bg-sand-100 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <FadeIn className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted">
            The 16-Step Ritual
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-ink text-balance sm:text-5xl">
            One ritual. Sixteen steps. Glass-skin result.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Base protocol runs 40 minutes at $89. Ritual+ adds four upgrade steps —
            blackhead softening, extraction, LED, and sculpting massage — for +20 minutes
            and +$20. Existing staff learn it within 4 weeks.
          </p>
        </FadeIn>

        <div className="mt-12 flex flex-wrap gap-4">
          <FadeIn className="border border-stone-deep/15 bg-cream px-6 py-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">The Protocol</p>
            <p className="mt-1 font-serif text-3xl text-ink">$89 · 40 min</p>
            <p className="mt-1 text-sm text-muted">Steps 1–5, 10–16</p>
          </FadeIn>
          <FadeIn delay={0.08} className="border border-accent-wbu/40 bg-cream px-6 py-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-accent-wbu">Ritual+ Add-on</p>
            <p className="mt-1 font-serif text-3xl text-ink">$109 · 60 min</p>
            <p className="mt-1 text-sm text-muted">Full 16 steps · ~30% upgrade rate</p>
          </FadeIn>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_340px]">
          <FadeIn>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {steps.map((step, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={step.n}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`group relative flex flex-col items-start border px-2.5 py-3 text-left transition sm:px-3 ${
                      isActive
                        ? "border-charcoal bg-charcoal text-cream"
                        : step.addon
                          ? "border-accent-wbu/35 bg-cream hover:border-accent-wbu"
                          : "border-stone-deep/10 bg-cream hover:border-stone-deep/30"
                    }`}
                  >
                    <span
                      className={`text-[10px] tracking-wider ${
                        isActive ? "text-cream/70" : step.addon ? "text-accent-wbu" : "text-muted"
                      }`}
                    >
                      {step.n}
                    </span>
                    <span className={`mt-1 text-[11px] leading-tight sm:text-xs ${isActive ? "text-cream" : "text-stone-deep"}`}>
                      {step.title.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-muted">
              <span className="mr-1 inline-block h-2 w-2 bg-accent-wbu/70 align-middle" />
              Warm-toned steps = Ritual+ add-on
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="sticky top-28 min-h-[220px] border border-stone-deep/10 bg-cream p-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.n}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28 }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-serif text-4xl text-ink">{current.n}</p>
                    <div className="text-right">
                      <p className="text-sm text-muted">{current.time}</p>
                      {current.addon && (
                        <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-accent-wbu">
                          Ritual+
                        </p>
                      )}
                    </div>
                  </div>
                  <h3 className="mt-4 font-serif text-2xl text-ink">{current.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{current.detail}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </FadeIn>
        </div>

        <FadeIn className="mt-16 max-w-2xl">
          <p className="font-serif text-2xl text-ink">Trained in under 4 weeks.</p>
          <p className="mt-3 text-muted leading-relaxed">
            Sign in Week 1, soft launch by Week 4. On-site Dermabell trainer certifies
            your existing staff on the 16-step SOP, front-desk scripts, and Ritual+
            upsell — no medical equipment, no new hires required.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
