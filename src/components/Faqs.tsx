import { FadeIn } from "./FadeIn";

const faqs = [
  {
    q: "What is the difference between the Full Salon System and Professional Programs?",
    a: "The Full Salon System is a consultative implementation for expanding facial services. Professional Programs are focused facial packages for existing treatment businesses and do not include the same equipment, training, or installation support.",
  },
  {
    q: "Who can purchase Professional Programs?",
    a: "Programs are intended for qualified beauty businesses. Visitors can review published contents. Confidential prices and checkout stay locked until an account is approved and a price is published.",
  },
  {
    q: "Do programs include machines or on-site training?",
    a: "Not unless a published package listing expressly includes those items. Do not assume program contents match the Full Salon System.",
  },
  {
    q: "How do I explore the Full Salon System?",
    a: "Book a consultation or store evaluation. We walk through the program and model shop economics with you.",
  },
];

export function Faqs() {
  return (
    <section className="bg-cream py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <FadeIn>
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted">FAQs</p>
          <h2 className="mt-4 font-serif text-4xl text-ink">Clear distinctions. No overstated claims.</h2>
        </FadeIn>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {faqs.map((item) => (
            <div key={item.q} className="border-t border-stone-deep/15 pt-5">
              <h3 className="font-serif text-xl text-ink">{item.q}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
