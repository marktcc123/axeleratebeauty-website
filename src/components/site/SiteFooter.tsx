import Link from "next/link";
import { Logo } from "@/components/Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-sand-200 bg-sand-50">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        <div>
          <Logo variant="dark" className="h-5 w-auto max-w-[10rem]" />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Dermabell Professional — Korean skincare solutions for beauty businesses.
            Operated in the U.S. by Axelerate Inc.
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Explore</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/for-professionals">Shop</Link>
            <Link href="/professional-programs">Professional Programs</Link>
            <Link href="/full-salon-system">Full Salon System</Link>
            <Link href="/success-stories">Partner stories</Link>
          </div>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Account & support</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/partner/login">Sign in</Link>
            <Link href="/partner/register">Create business account</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/store-evaluation">Store evaluation</Link>
          </div>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Policies</p>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/policies/shipping">Shipping Policy</Link>
            <Link href="/policies/returns">Return and Refund Policy</Link>
            <Link href="/policies/privacy">Privacy Policy</Link>
            <Link href="/policies/terms">Terms of Sale</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-sand-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>sales@axeleratebeauty.com · +1 (901) 661-9930</p>
          <p>© {new Date().getFullYear()} Axelerate Inc.</p>
        </div>
      </div>
    </footer>
  );
}
