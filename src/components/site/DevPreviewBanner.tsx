import { isDevPreviewEnabled } from "@/lib/dev-preview";
import { headers } from "next/headers";
import Link from "next/link";

export async function DevPreviewBanner() {
  const host = (await headers()).get("host");
  if (!isDevPreviewEnabled(host)) return null;

  return (
    <div className="bg-charcoal px-5 py-2 text-center text-xs text-cream sm:px-8">
      Local preview is on. This is not a real signed-in account.{" "}
      <Link href="/partner/dashboard" className="underline underline-offset-2">
        Dashboard
      </Link>
      {" · "}
      <Link href="/admin" className="underline underline-offset-2">
        Admin
      </Link>
      {" · "}
      Turn off by setting <code>DEV_PREVIEW_AUTH=false</code> in <code>.env.local</code> and restarting{" "}
      <code>npm run dev</code>.
    </div>
  );
}
