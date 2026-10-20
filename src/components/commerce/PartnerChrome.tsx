import { LocationSelect } from "@/components/commerce/LocationSelect";
import type { SessionContext } from "@/lib/types";

/** Store context strip only — purchase links live in SiteHeader partner mode. */
export function PartnerChrome({
  session,
}: {
  session: SessionContext;
  cartCount?: number;
}) {
  if (!session.userId) return null;

  return (
    <div className="border-b border-sand-200 bg-cream">
      <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-3 px-5 py-3 sm:px-8">
        <div className="min-w-0 flex-1">
          <LocationSelect locations={session.locations} activeLocationId={session.activeLocationId} />
        </div>
        {session.organizationName ? (
          <p className="max-w-xs text-right text-xs text-muted sm:text-sm">
            {session.organizationName}
            {session.verificationStatus ? ` · ${session.verificationStatus}` : ""}
          </p>
        ) : null}
      </div>
    </div>
  );
}
