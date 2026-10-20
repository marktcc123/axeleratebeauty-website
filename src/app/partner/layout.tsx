import type { Metadata } from "next";
import { PartnerChrome } from "@/components/commerce/PartnerChrome";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <>
      <PartnerChrome session={session} />
      {children}
    </>
  );
}
