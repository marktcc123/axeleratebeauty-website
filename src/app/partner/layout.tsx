import type { Metadata } from "next";
import { PartnerNav } from "@/components/commerce/PartnerNav";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <>
      <PartnerNav session={session} />
      {children}
    </>
  );
}
