import { redirect } from "next/navigation";

/** Legacy billing URL — billing lives under Account. */
export default function BillingRedirectPage() {
  redirect("/partner/account?section=billing#billing");
}
