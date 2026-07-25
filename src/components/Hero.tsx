"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Logo } from "./Logo";

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/hero-duo.webp"
          alt="Two clients with radiant glass skin after Dermabell Express Facial"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[78%_center] sm:object-[72%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/92 via-sand-50/75 to-white/15 sm:via-sand-50/55 sm:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-cream/85 via-transparent to-white/35" />
        <div className="absolute inset-0 bg-white/10" />
      </div>

      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 sm:justify-center sm:px-8 sm:pb-24 sm:pt-32">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl"
        >
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.28em] text-muted">
            Exclusive U.S. Operator · Axelerate Inc.
          </p>

          <h1 className="sr-only">Dermabell.</h1>
          <Logo
            variant="dark"
            className="h-9 w-auto max-w-[11rem] sm:h-14 sm:max-w-[16rem] lg:h-16 lg:max-w-[18rem]"
            priority
          />

          <p className="mt-5 font-serif text-2xl leading-snug text-stone-deep text-balance sm:text-3xl lg:text-[2.15rem]">
            Monetize your existing clients with the K-Beauty Express Facial.
          </p>

          <p className="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">
            Add a 40-minute premium Korean facial to your beauty store. 3x your
            ticket, 5x your profit, with zero new fixed costs.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <motion.a
              href="#contact"
              whileHover={reduce ? undefined : { y: -2 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              className="inline-flex items-center bg-charcoal px-7 py-3.5 text-sm font-medium tracking-wide text-cream transition hover:bg-ink"
            >
              Book a Store Evaluation
            </motion.a>
            <a
              href="#system"
              className="text-sm tracking-wide text-stone-deep underline-offset-4 transition hover:underline"
            >
              See the system
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-14 hidden max-w-xl grid-cols-3 gap-6 border-t border-stone-deep/15 pt-6 sm:grid"
        >
          {[
            { label: "Service", value: "40-60 min" },
            { label: "Protocol", value: "16 steps" },
            { label: "Launch", value: "4 weeks" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{item.label}</p>
              <p className="mt-1 font-serif text-xl text-ink">{item.value}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
