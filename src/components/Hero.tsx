"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "./Logo";
import { HOME_TEXTURE } from "@/data/brand-content";

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section id="top" className="relative overflow-hidden bg-sand-50">
      <div className="absolute inset-0">
        <Image
          src={HOME_TEXTURE.src}
          alt={HOME_TEXTURE.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/88 to-cream/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-cream/95 via-transparent to-cream/25" />
      </div>

      <div className="relative mx-auto flex min-h-[78svh] max-w-6xl flex-col justify-end px-5 pb-14 pt-28 sm:min-h-[70svh] sm:justify-center sm:px-8 sm:pb-20 sm:pt-32">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl"
        >
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.28em] text-muted">
            Dermabell Professional · U.S. by Axelerate Inc.
          </p>
          <Logo
            variant="dark"
            className="h-9 w-auto max-w-[11rem] sm:h-12 sm:max-w-[15rem]"
            priority
          />
          <h1 className="mt-6 font-serif text-3xl leading-tight text-ink text-balance sm:text-4xl lg:text-[2.65rem]">
            Korean Skincare for Professional Businesses
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">
            Shop replenishment products at your business price, or explore equipment, training, and
            implementation programs with our U.S. team.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/for-professionals"
              className="inline-flex bg-charcoal px-7 py-3.5 text-sm font-medium text-cream hover:bg-ink"
            >
              Shop Products
            </Link>
            <Link
              href="/professional-programs"
              className="text-sm tracking-wide text-stone-deep underline-offset-4 hover:underline"
            >
              Explore Professional Programs
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
