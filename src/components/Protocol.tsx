"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FadeIn } from "./FadeIn";
import { Media } from "./Media";

const trainingShots = [
  {
    src: "/images/training/train-01.webp",
    alt: "On-site team observing a live Express Facial demonstration",
  },
  {
    src: "/images/training/train-02.webp",
    alt: "Dermabell trainer reviewing products with partner staff",
  },
  {
    src: "/images/training/train-03.webp",
    alt: "Classroom training session for salon staff certification",
  },
  {
    src: "/images/training/train-04.webp",
    alt: "Hands-on facial technique training at the treatment bed",
  },
  {
    src: "/images/training/train-05.webp",
    alt: "Guided protocol practice with professional back-bar setup",
  },
] as const;

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
  const [trainIndex, setTrainIndex] = useState(0);
  const current = steps[active];
  const trainShot = trainingShots[trainIndex];

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
            Base protocol runs 40 minutes. Ritual+ adds four upgrade steps —
            blackhead softening, extraction, LED, and sculpting massage — for +20 minutes.
            Existing staff learn it within 4 weeks.
          </p>
        </FadeIn>

        <div className="mt-12 flex flex-wrap gap-4">
          <FadeIn className="border border-stone-deep/15 bg-cream px-6 py-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">The Protocol</p>
            <p className="mt-1 font-serif text-3xl text-ink">40 min</p>
            <p className="mt-1 text-sm text-muted">Steps 1–5, 10–16</p>
          </FadeIn>
          <FadeIn delay={0.08} className="border border-accent-wbu/40 bg-cream px-6 py-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-accent-wbu">Ritual+ Add-on</p>
            <p className="mt-1 font-serif text-3xl text-ink">60 min</p>
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

        <FadeIn className="mt-20 grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:items-center">
          <div className="lg:max-w-none lg:pr-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted">
              Staff Enablement
            </p>
            <h3 className="mt-4 font-serif text-3xl leading-[1.15] tracking-tight text-ink text-balance sm:text-4xl lg:text-[2.75rem]">
              Trained in under 4 weeks.
            </h3>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg sm:leading-relaxed">
              Sign in Week 1, soft launch by Week 4. On-site Dermabell trainer certifies
              your existing staff on the 16-step SOP, front-desk scripts, and Ritual+
              upsell - no medical equipment, no new hires required.
            </p>
            <dl className="mt-8 grid max-w-md grid-cols-2 gap-x-6 gap-y-5 border-t border-stone-deep/15 pt-6">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-muted">Week 1</dt>
                <dd className="mt-1 font-serif text-lg text-ink">Sign & plan</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-muted">Week 2-3</dt>
                <dd className="mt-1 font-serif text-lg text-ink">Train on SOP</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-muted">Week 4</dt>
                <dd className="mt-1 font-serif text-lg text-ink">Soft launch</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.2em] text-muted">Outcome</dt>
                <dd className="mt-1 font-serif text-lg text-ink">Staff certified</dd>
              </div>
            </dl>
          </div>

          <div className="w-full">
            <div className="overflow-hidden bg-cream">
              <AnimatePresence mode="wait">
                <motion.div
                  key={trainShot.src}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Media
                    src={trainShot.src}
                    alt={trainShot.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 420px"
                    className="aspect-[4/3]"
                    imgClassName="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-2.5 grid grid-cols-5 gap-1.5">
              {trainingShots.map((shot, i) => (
                <button
                  key={shot.src}
                  type="button"
                  aria-label={`Show training photo ${i + 1}`}
                  onClick={() => setTrainIndex(i)}
                  className={`overflow-hidden transition ${
                    i === trainIndex
                      ? "ring-2 ring-charcoal ring-offset-2 ring-offset-sand-100"
                      : "opacity-65 hover:opacity-100"
                  }`}
                >
                  <Media
                    src={shot.src}
                    alt=""
                    fill
                    sizes="72px"
                    className="aspect-square"
                    imgClassName="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
