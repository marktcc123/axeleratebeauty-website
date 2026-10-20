import Link from "next/link";
import { canPurchase, type SessionContext } from "@/lib/types";

const links = [
  { href: "/partner/catalog", label: "Catalog", purchaseOnly: true },
  { href: "/partner/orders", label: "Orders", purchaseOnly: false },
  { href: "/partner/billing", label: "Billing", purchaseOnly: false },
  { href: "/partner/profile", label: "Account", purchaseOnly: false },
  { href: "/partner/support", label: "Support", purchaseOnly: false },
] as const;

export function PartnerNav({ session }: { session: SessionContext }) {
  if (!session.userId) return null;
  const approved = canPurchase(session);

  return (
    <nav aria-label="Partner portal" className="border-b border-sand-200 bg-cream">
      <div className="mx-auto flex max-w-6xl flex-wrap gap-x-5 gap-y-2 px-5 py-3 text-sm sm:px-8">
        {links
          .filter((link) => !link.purchaseOnly || approved)
          .map((link) => (
            <Link key={link.href} href={link.href} className="text-stone-deep underline-offset-4 hover:underline">
              {link.label}
            </Link>
          ))}
      </div>
    </nav>
  );
}
