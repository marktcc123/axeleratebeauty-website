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
        <h1 className="font-serif text-3xl text-ink sm:text-4xl">Welcome</h1>
        {session.organizationName ? (
          <p className="mt-2 text-muted">{session.organizationName}</p>
        ) : null}

        {!session.emailVerified ? (
          <p className="mt-4 text-sm text-muted">
            Confirm your email to unlock shopping at your business price. Check your inbox for the confirmation link.
          </p>
        ) : null}

        {session.emailVerified && status === "pending" ? (
          <p className="mt-4 text-sm text-muted">
            This account still needs access before shopping. Typing a company name does not join an existing group —
            use an invitation if you were asked to join a headquarters. Contact support if you expected to shop already.
          </p>
        ) : null}

        {status === "suspended" ? (
          <p className="mt-4 text-sm text-muted">
            Purchasing is paused on this account. Open Account → Support if you need help.
          </p>
        ) : null}

        {status === "approved" && session.emailVerified && session.locations.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            Your business is ready, but no shipping location is linked yet. Ask your administrator for access, or contact
            support.
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 text-sm">
          <Link href="/partner/account" className="underline-offset-4 hover:underline">
            Account
          </Link>
          <Link href="/professional-programs" className="underline-offset-4 hover:underline">
            Browse Programs
          </Link>
          <Link href="/store-evaluation" className="underline-offset-4 hover:underline">
            Request a Full Salon System consultation
          </Link>
        </div>
      </div>
    </section>
  );
}
