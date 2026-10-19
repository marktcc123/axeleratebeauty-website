"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
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
            Dermabell Professional · U.S. by Axelerate Inc.
          </p>
          <h1 className="sr-only">Elevate Your Beauty Business with Professional Korean Skincare.</h1>
          <Logo
            variant="dark"
            className="h-9 w-auto max-w-[11rem] sm:h-14 sm:max-w-[16rem] lg:h-16 lg:max-w-[18rem]"
            priority
          />
          <p className="mt-5 font-serif text-2xl leading-snug text-stone-deep text-balance sm:text-3xl lg:text-[2.15rem]">
            Elevate Your Beauty Business with Professional Korean Skincare.
          </p>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">
            Start with a focused professional facial program, or explore a complete salon
            implementation solution. Dermabell helps beauty businesses expand their services
            with Korean skincare expertise.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/full-salon-system" className="inline-flex bg-charcoal px-7 py-3.5 text-sm font-medium text-cream hover:bg-ink">
              Explore the Full Salon System
            </Link>
            <Link href="/professional-programs" className="text-sm tracking-wide text-stone-deep underline-offset-4 hover:underline">
              Explore Professional Programs
            </Link>
          </div>
          <Link href="/success-stories" className="mt-4 inline-block text-sm text-muted underline-offset-4 hover:underline">
            Watch a Real U.S. Implementation
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
