"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { logoutBusiness } from "@/app/actions/auth";
import type { SessionContext } from "@/lib/types";
import { canPurchase } from "@/lib/types";

const links = [
  { href: "/", label: "Home" },
  { href: "/full-salon-system", label: "Full Salon System" },
  { href: "/professional-programs", label: "Professional Programs" },
  { href: "/success-stories", label: "Real Partners" },
  { href: "/for-professionals", label: "For Professionals" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({
  session,
  cartCount,
}: {
  session: SessionContext;
  cartCount: number;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const transparent = pathname === "/";
  const approved = canPurchase(session);

  return (
    <header className={`sticky top-0 z-50 ${transparent ? "bg-cream/80" : "bg-cream/95"} backdrop-blur-md border-b border-sand-200/80`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:h-20 sm:px-8">
        <Link href="/" className="flex flex-col items-start leading-none">
          <Logo variant="dark" className="h-6 w-auto max-w-[9.5rem] sm:h-7 sm:max-w-[11rem]" priority />
          <span className="mt-1 text-[10px] uppercase tracking-[0.22em] text-muted">Professional</span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm tracking-wide transition hover:text-ink ${pathname === link.href ? "text-ink" : "text-stone-deep/80"}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/store-evaluation" className="bg-charcoal px-4 py-2 text-sm font-medium text-cream hover:bg-ink">
            Book a Consultation
          </Link>
          <Link href={session.userId ? "/partner/dashboard" : "/partner/login"} className="text-sm text-stone-deep">
            {session.userId ? "My Account" : "Professional Login"}
          </Link>
          <Link href="/cart" className="text-sm text-stone-deep">
            Cart{cartCount > 0 ? ` (${cartCount})` : ""}
          </Link>
        </div>

        <button type="button" className="lg:hidden" aria-label="Open menu" onClick={() => setOpen((v) => !v)}>
          <div className="flex w-5 flex-col gap-1.5">
            <span className="h-px bg-charcoal" />
            <span className="h-px bg-charcoal" />
            <span className="h-px bg-charcoal" />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-sand-200 bg-cream lg:hidden">
            <div className="flex flex-col px-5 py-4">
              {links.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="py-3 text-stone-deep">
                  {link.label}
                </Link>
              ))}
              <Link href="/store-evaluation" onClick={() => setOpen(false)} className="py-3">Book a Consultation</Link>
              <Link href={session.userId ? "/partner/dashboard" : "/partner/login"} onClick={() => setOpen(false)} className="py-3">
                {session.userId ? "My Account" : "Professional Login"}
              </Link>
              <Link href="/cart" onClick={() => setOpen(false)} className="py-3">Cart{cartCount > 0 ? ` (${cartCount})` : ""}</Link>
              {approved && (
                <>
                  <Link href="/professional-programs" onClick={() => setOpen(false)} className="py-3">Browse Professional Programs</Link>
                  <Link href="/partner/orders" onClick={() => setOpen(false)} className="py-3">My Orders</Link>
                </>
              )}
              {session.userId && (
                <form action={logoutBusiness}>
                  <button type="submit" className="py-3 text-left">Logout</button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
