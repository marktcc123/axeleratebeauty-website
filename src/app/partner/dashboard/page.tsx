import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutBusiness } from "@/app/actions/auth";
import { LocationSelect } from "@/components/commerce/LocationSelect";
import { PageIntro } from "@/components/site/PageIntro";
import { getSession } from "@/lib/session";
import { canPurchase } from "@/lib/types";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session.userId) redirect("/partner/login");

  const status = session.verificationStatus ?? "pending";
  const approved = canPurchase(session);

  const links = approved
    ? [
        ["/partner/catalog", "Order authorized products"],
        ["/partner/orders", "Orders and reorder"],
        ["/partner/billing", "Billing and payments"],
        ["/partner/profile", "Business profile"],
        ["/partner/support", "Support"],
        ["/store-evaluation", "Full Salon System consultation"],
      ]
    : [
        ["/professional-programs", "Browse Professional Programs"],
        ["/store-evaluation", "Request a Full Salon System consultation"],
        ["/partner/profile", "Business profile"],
        ["/partner/support", "Contact partner support"],
        ["/contact", "Sales contact"],
      ];

  return (
    <section className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <PageIntro
          eyebrow="Partner account"
          title={approved ? "Continue purchasing for your store." : "Welcome to Dermabell Professional."}
        />
        <p className="mt-4 text-muted">
          Account status: <strong>{status}</strong>
          {session.organizationName ? ` · ${session.organizationName}` : ""}
        </p>
        <div className="mt-6 max-w-xl">
          <LocationSelect locations={session.locations} activeLocationId={session.activeLocationId} />
        </div>
        {status === "pending" && (
          <p className="mt-4 max-w-2xl text-sm text-muted">
            Purchasing stays locked until verification is approved. You can still explore Professional Programs and request a Full Salon System consultation.
          </p>
        )}
        {status === "suspended" && (
          <p className="mt-4 max-w-2xl text-sm text-muted">
            This account is paused. Contact partner support if you need help restoring access.
          </p>
        )}
        {status === "approved" && session.locations.length === 0 && (
          <p className="mt-4 max-w-2xl text-sm text-muted">
            Your account is approved, but no store is linked yet. Ask an administrator to assign a store before ordering.
          </p>
        )}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="border border-sand-200 bg-white px-5 py-6 text-stone-deep hover:border-stone-deep/40">
              {label}
            </Link>
          ))}
        </div>
        <form action={logoutBusiness} className="mt-10">
          <button className="text-sm underline-offset-4 hover:underline">Logout</button>
        </form>
      </div>
    </section>
  );
}
