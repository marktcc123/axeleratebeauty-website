import { redirect } from "next/navigation";

/** Legacy support URL — support lives under Account. */
export default function SupportRedirectPage() {
  redirect("/partner/account?section=support#support");
}
