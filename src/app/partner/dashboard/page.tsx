import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutBusiness } from "@/app/actions/auth";
import { PageIntro } from "@/components/site/PageIntro";
import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session.userId) redirect("/partner/login");

  return (
    <section className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <PageIntro eyebrow="Partner Dashboard" title={`Welcome back to Dermabell Professional.`} />
        <p className="mt-4 text-muted">
          Account status: <strong>{session.verificationStatus ?? "pending"}</strong>
          {session.organizationName ? ` · ${session.organizationName}` : ""}
        </p>
        {session.verificationStatus !== "approved" && (
          <p className="mt-4 max-w-2xl text-sm text-muted">
            Purchasing stays locked until verification is approved and a price is published. You can still explore Professional Programs and request a Full Salon System consultation.
          </p>
        )}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["/professional-programs", "Browse Professional Programs"],
            ["/partner/orders", "View Orders / Reorder"],
            ["/partner/profile", "Manage Business Profile"],
            ["/store-evaluation", "Explore the Full Salon System"],
            ["/contact", "Contact Partner Support"],
          ].map(([href, label]) => (
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
