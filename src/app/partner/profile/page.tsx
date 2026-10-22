import { redirect } from "next/navigation";

/** Legacy profile URL — renamed to Account. */
export default function ProfileRedirectPage() {
  redirect("/partner/account");
}
