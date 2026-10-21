import Link from "next/link";

export function HomeAboutBand() {
  return (
    <section className="bg-cream py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted">About</p>
        <h2 className="mt-3 max-w-xl font-serif text-3xl text-ink sm:text-4xl">
          Dermabell Professional in the United States
        </h2>
        <p className="mt-4 max-w-2xl text-muted leading-relaxed">
          Axelerate Inc. operates Dermabell Professional purchasing and partner support for U.S.
          beauty businesses. Korean headquarters contact details and global distribution forms stay
          on the official brand site — U.S. customers work with our team here.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link href="/contact" className="underline-offset-4 hover:underline">
            Contact Axelerate
          </Link>
          <Link href="/for-professionals" className="underline-offset-4 hover:underline">
            Shop access
          </Link>
          <a
            href="mailto:sales@axeleratebeauty.com"
            className="underline-offset-4 hover:underline"
          >
            sales@axeleratebeauty.com
          </a>
        </div>
      </div>
    </section>
  );
}