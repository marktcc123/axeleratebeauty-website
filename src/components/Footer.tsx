"use client";

import { FadeIn } from "./FadeIn";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer id="contact" className="bg-sand-50">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <FadeIn className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted">
            Next Step
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-ink text-balance sm:text-5xl">
            Book your Store Evaluation.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Give us 30 minutes — a working session where we walk you through the full
            program in detail, answer every question, and model your shop&apos;s unit
            economics with you.
          </p>
        </FadeIn>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <FadeIn className="border-t border-stone-deep/15 pt-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Email</p>
            <a
              href="mailto:sales@axeleratebeauty.com"
              className="mt-2 block font-serif text-2xl text-ink transition hover:text-accent-wbu"
            >
              sales@axeleratebeauty.com
            </a>
          </FadeIn>
          <FadeIn delay={0.08} className="border-t border-stone-deep/15 pt-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Phone</p>
            <a
              href="tel:+19016619930"
              className="mt-2 block font-serif text-2xl text-ink transition hover:text-accent-wbu"
            >
              +1 (901) 661-9930
            </a>
          </FadeIn>
          <FadeIn delay={0.12} className="border-t border-stone-deep/15 pt-6 sm:col-span-2 lg:col-span-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Operator</p>
            <p className="mt-2 font-serif text-2xl text-ink">Axelerate Inc.</p>
            <p className="mt-1 text-sm text-muted">Exclusive U.S. operator for Dermabell</p>
          </FadeIn>
        </div>

        <FadeIn className="mt-10">
          <a
            href="mailto:sales@axeleratebeauty.com?subject=Store%20Evaluation%20Request"
            className="inline-flex bg-charcoal px-8 py-4 text-sm font-medium tracking-wide text-cream transition hover:bg-ink"
          >
            Book a Store Evaluation
          </a>
        </FadeIn>
      </div>

      <div className="border-t border-sand-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Logo variant="dark" className="h-5 w-auto sm:h-6" />
          <p>Operated by Axelerate Inc. in the US</p>
          <p>© {new Date().getFullYear()} Axelerate Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
