"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/Logo";
import { logoutBusiness } from "@/app/actions/auth";
import type { SessionContext } from "@/lib/types";
import { canPurchase } from "@/lib/types";

const marketingLinks = [
  { href: "/", label: "Home" },
  { href: "/full-salon-system", label: "Full Salon System" },
  { href: "/professional-programs", label: "Professional Programs" },
  { href: "/success-stories", label: "Real Partners" },
  { href: "/for-professionals", label: "For Professionals" },
  { href: "/contact", label: "Contact" },
];

function isPartnerWorkspace(pathname: string) {
  if (pathname === "/cart") return true;
  if (!pathname.startsWith("/partner")) return false;
  return !pathname.startsWith("/partner/login") && !pathname.startsWith("/partner/register");
}

function accountHome(session: SessionContext) {
  if (!session.userId) return "/partner/login";
  return canPurchase(session) ? "/partner/catalog" : "/partner/dashboard";
}

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
  const partnerMode = Boolean(session.userId) && isPartnerWorkspace(pathname);
  const accountHref = accountHome(session);

  const partnerLinks = [
    ...(approved ? [{ href: "/partner/catalog", label: "Catalog" }] : []),
    { href: "/partner/orders", label: "Orders" },
    { href: "/partner/account", label: "Account" },
    { href: "/cart", label: cartCount > 0 ? `Cart (${cartCount})` : "Cart" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 ${transparent && !partnerMode ? "bg-cream/80" : "bg-cream/95"} backdrop-blur-md border-b border-sand-200/80`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:h-20 sm:px-8">
        <Link href={partnerMode ? accountHref : "/"} className="flex flex-col items-start leading-none">
          <Logo variant="dark" className="h-6 w-auto max-w-[9.5rem] sm:h-7 sm:max-w-[11rem]" priority />
          <span className="mt-1 text-[10px] uppercase tracking-[0.22em] text-muted">
            {partnerMode ? "Partner" : "Professional"}
          </span>
        </Link>

        {partnerMode ? (
          <nav aria-label="Partner purchase" className="hidden items-center gap-5 lg:flex">
            {partnerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm tracking-wide transition hover:text-ink ${pathname === link.href || pathname.startsWith(`${link.href}/`) ? "text-ink" : "text-stone-deep/80"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ) : (
          <nav className="hidden items-center gap-5 lg:flex">
            {marketingLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm tracking-wide transition hover:text-ink ${pathname === link.href ? "text-ink" : "text-stone-deep/80"}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="hidden items-center gap-3 lg:flex">
          {partnerMode ? (
            <>
              <Link href="/" className="text-sm text-muted underline-offset-4 hover:underline">
                Website
              </Link>
              <form action={logoutBusiness}>
                <button type="submit" className="text-sm text-stone-deep underline-offset-4 hover:underline">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/store-evaluation" className="bg-charcoal px-4 py-2 text-sm font-medium text-cream hover:bg-ink">
                Book a Consultation
              </Link>
              <Link href={accountHref} className="text-sm text-stone-deep">
                {session.userId ? (approved ? "Catalog" : "My Account") : "Professional Login"}
              </Link>
              {session.userId ? (
                <Link href="/cart" className="text-sm text-stone-deep">
                  Cart{cartCount > 0 ? ` (${cartCount})` : ""}
                </Link>
              ) : null}
            </>
          )}
        </div>

        <button
          type="button"
          className="lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <div className="flex w-5 flex-col gap-1.5">
            <span className="h-px bg-charcoal" />
            <span className="h-px bg-charcoal" />
            <span className="h-px bg-charcoal" />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-sand-200 bg-cream lg:hidden"
          >
            <div id="mobile-navigation" className="flex flex-col px-5 py-4">
              {partnerMode
                ? partnerLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="py-3 text-stone-deep">
                      {link.label}
                    </Link>
                  ))
                : marketingLinks.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="py-3 text-stone-deep">
                      {link.label}
                    </Link>
                  ))}
              {partnerMode ? (
                <>
                  <Link href="/" onClick={() => setOpen(false)} className="py-3">
                    Website
                  </Link>
                  <form action={logoutBusiness}>
                    <button type="submit" className="py-3 text-left">
                      Log out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/store-evaluation" onClick={() => setOpen(false)} className="py-3">
                    Book a Consultation
                  </Link>
                  <Link href={accountHref} onClick={() => setOpen(false)} className="py-3">
                    {session.userId ? (approved ? "Catalog" : "My Account") : "Professional Login"}
                  </Link>
                  {session.userId ? (
                    <Link href="/cart" onClick={() => setOpen(false)} className="py-3">
                      Cart{cartCount > 0 ? ` (${cartCount})` : ""}
                    </Link>
                  ) : null}
                  {session.userId ? (
                    <form action={logoutBusiness}>
                      <button type="submit" className="py-3 text-left">
                        Logout
                      </button>
                    </form>
                  ) : null}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
