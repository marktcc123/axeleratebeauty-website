import Image from "next/image";
import Link from "next/link";

export function HomeProgramsBand() {
  return (
    <section className="bg-cream py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[5/4] overflow-hidden bg-sand-100">
          <Image
            src="/images/training/train-01.webp"
            alt="On-site Dermabell professional training"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Professional Programs</p>
          <h2 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">
            Equipment, training, and implementation
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            Full salon systems and structured facial programs stay consultative. They are not
            self-checkout cart items — our U.S. team helps with evaluation and rollout.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/professional-programs" className="bg-charcoal px-6 py-3 text-sm text-cream">
              Explore Professional Programs
            </Link>
            <Link href="/full-salon-system" className="text-sm underline-offset-4 hover:underline">
              Full Salon System
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
