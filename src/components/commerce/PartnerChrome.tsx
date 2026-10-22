import { LocationSelect } from "@/components/commerce/LocationSelect";
import type { SessionContext } from "@/lib/types";

/** Business / shipping context only — purchase links live in SiteHeader partner mode. */
export function PartnerChrome({
  session,
}: {
  session: SessionContext;
  cartCount?: number;
}) {
  if (!session.userId) return null;

  const paused = session.verificationStatus === "suspended";
  const multiStore = session.locations.length > 1;

  return (
    <div className="border-b border-sand-200 bg-cream">
      <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-3 px-5 py-3 sm:px-8">
        <div className="min-w-0 flex-1">
          <LocationSelect locations={session.locations} activeLocationId={session.activeLocationId} />
        </div>
        <div className="max-w-xs text-right text-xs text-muted sm:text-sm">
          {session.organizationName ? (
            <p>
              <span className="text-stone-deep">{session.organizationName}</span>
              {!multiStore ? <span className="text-muted"> · Business</span> : null}
            </p>
          ) : null}
          {paused ? (
            <p className="mt-1 text-accent-tac">Purchasing paused — contact support.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
