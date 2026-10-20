import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { canPurchase } from "@/lib/types";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session.userId) redirect("/partner/login");

  if (canPurchase(session)) {
    redirect("/partner/catalog");
  }

  const status = session.verificationStatus ?? "pending";

  return (
    <section className="bg-cream px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Account status</p>
        <h1 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">Welcome to Dermabell Professional</h1>
        <p className="mt-4 text-muted">
          Status: <strong>{status}</strong>
          {session.organizationName ? ` · ${session.organizationName}` : ""}
        </p>
        {status === "pending" && (
          <p className="mt-4 text-sm text-muted">
            Purchasing stays locked until verification is approved. Explore Professional Programs or request a Full Salon System consultation while you wait.
          </p>
        )}
        {status === "suspended" && (
          <p className="mt-4 text-sm text-muted">
            This account is paused. Use Account → Support if you need help restoring access.
          </p>
        )}
        {status === "approved" && session.locations.length === 0 && (
          <p className="mt-4 text-sm text-muted">
            Your account is approved, but no store is linked yet. Ask an administrator to assign a store before ordering.
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 text-sm">
          <Link href="/professional-programs" className="underline-offset-4 hover:underline">
            Browse Professional Programs
          </Link>
          <Link href="/store-evaluation" className="underline-offset-4 hover:underline">
            Request a Full Salon System consultation
          </Link>
          <Link href="/partner/account" className="underline-offset-4 hover:underline">
            Open account
          </Link>
        </div>
      </div>
    </section>
  );
}
