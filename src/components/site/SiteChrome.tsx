import { readCart } from "@/lib/cart-cookie";
import { getSession } from "@/lib/session";
import { DevPreviewBanner } from "./DevPreviewBanner";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const cart = await readCart();
  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <DevPreviewBanner />
      <SiteHeader session={session} cartCount={cartCount} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
