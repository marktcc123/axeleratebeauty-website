"use client";

import { FadeIn } from "./FadeIn";

const metrics = [
  {
    label: "Average Ticket",
    from: "$30",
    to: "$100+",
    note: "Per visit after Express Facial + aftercare retail",
  },
  {
    label: "Overall Sales",
    value: "3x",
    note: "From the same client base - no new traffic required",
  },
  {
    label: "Profit",
    value: "5x",
    note: "High-margin service + retail; zero new fixed costs",
  },
  {
    label: "Retail Attach",
    value: "+80%",
    note: "Take-home product growth on the same footprint",
  },
];

export function Metrics() {
  return (
    <section id="opportunity" className="bg-atmosphere relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <FadeIn className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-muted">
            The Opportunity
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-ink text-balance sm:text-5xl">
            You already have the space, the staff, and the customers.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted">
            Every guest in your chair is a sale you&apos;ve already closed. Rent and
            salaries are sunk. Layer a Korean facial on top - and convert existing
            brow, lash, hair, and wax traffic into a higher ticket and fuller margin.
          </p>
        </FadeIn>

        <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {metrics.map((m, i) => (
            <FadeIn key={m.label} delay={0.08 * i} className="border-t border-stone-deep/15 pt-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{m.label}</p>
              {"from" in m && m.from ? (
                <p className="mt-3 font-serif text-3xl text-ink sm:text-4xl">
                  <span className="text-ash line-through decoration-1">{m.from}</span>
                  <span className="mx-2 text-muted">&rarr;</span>
                  <span>{m.to}</span>
                </p>
              ) : (
                <p className="mt-3 font-serif text-4xl text-ink sm:text-5xl">{m.value}</p>
              )}
              <p className="mt-3 text-sm leading-relaxed text-muted">{m.note}</p>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.2} className="mt-16 max-w-3xl">
          <p className="text-sm leading-relaxed text-muted">
            Verified results - California brow chain after K-Beauty Express Facial
            implantation. Same stores. Same clients. No new locations. No new CAC.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
