import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { setOrganizationStatus, updateOrderFulfillment, upsertProductForm } from "@/app/actions/admin";
import { AdminInviteForm, AdminRetrySyncForm, AdminZohoMapForm } from "@/components/forms/AdminTools";
import { KNOWN_ZOHO_ACCOUNT_CANDIDATES } from "@/lib/integrations/zoho/mappings";
import { PageIntro } from "@/components/site/PageIntro";
import { formatMoney } from "@/lib/commerce/guards";
import { isDevPreviewEnabled } from "@/lib/dev-preview";
import { getSession } from "@/lib/session";
import { createServiceSupabase } from "@/lib/supabase/server";

export default async function AdminPage() {
  const session = await getSession();
  if (!session.isPlatformAdmin) redirect("/partner/login");
  const service = await createServiceSupabase();
  const preview = isDevPreviewEnabled((await headers()).get("host"));
  if (!service && !preview) {
    return (
      <section className="bg-cream px-5 py-24">
        <div className="mx-auto max-w-3xl">
          <PageIntro eyebrow="Admin" title="Service role is not configured." />
        </div>
      </section>
    );
  }

  const [{ data: organizations }, { data: products }, { data: orders }, { data: paidOrders }] = service
    ? await Promise.all([
        service.from("organizations").select("*").order("created_at", { ascending: false }),
        service.from("products").select("*").order("created_at", { ascending: false }),
        service.from("orders").select("*").order("created_at", { ascending: false }),
        service.from("orders").select("total_cents, payment_status"),
      ])
    : [
        { data: [] },
        { data: [] },
        { data: [] },
        { data: [] },
      ];

  const revenue = (paidOrders ?? [])
    .filter((order) => order.payment_status === "paid")
    .reduce((sum, order) => sum + (order.total_cents ?? 0), 0);

  return (
    <section className="bg-cream px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-16">
        <PageIntro eyebrow="Administration" title="Accounts, catalog, and paid orders." />
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="border-t border-stone-deep/15 pt-4">
            <p className="text-xs uppercase text-muted">Paid revenue</p>
            <p className="font-serif text-3xl">{formatMoney(revenue)}</p>
          </div>
          <div className="border-t border-stone-deep/15 pt-4">
            <p className="text-xs uppercase text-muted">Orders</p>
            <p className="font-serif text-3xl">{orders?.length ?? 0}</p>
          </div>
          <div className="border-t border-stone-deep/15 pt-4">
            <p className="text-xs uppercase text-muted">Pending accounts</p>
            <p className="font-serif text-3xl">{organizations?.filter((org) => org.verification_status === "pending").length ?? 0}</p>
          </div>
        </div>

        <div>
          <h2 className="font-serif text-3xl text-ink">Business accounts</h2>
          <div className="mt-6 space-y-4">
            {organizations?.map((org) => (
              <div key={org.id} className="flex flex-col gap-3 border border-sand-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-serif text-xl">{org.name}</p>
                  <p className="text-sm text-muted">{org.verification_status} · {org.state}</p>
                </div>
                <div className="flex gap-2">
                  {(["approved", "rejected", "suspended"] as const).map((status) => (
                    <form key={status} action={async () => {
                      "use server";
                      await setOrganizationStatus(org.id, status);
                    }}>
                      <button className="border border-sand-200 px-3 py-1 text-sm">{status}</button>
                    </form>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-serif text-3xl text-ink">CRM mapping and invitations</h2>
          <p className="mt-2 text-sm text-muted">
            Bind a website account only after reading the exact Zoho Account. Company-name matching is not used.
          </p>
          <ul className="mt-4 space-y-1 text-sm text-muted">
            {KNOWN_ZOHO_ACCOUNT_CANDIDATES.map((candidate) => (
              <li key={candidate.zohoAccountId}>
                {candidate.label}: {candidate.zohoAccountId}
              </li>
            ))}
          </ul>
          <AdminZohoMapForm />
          <AdminInviteForm />
          <AdminRetrySyncForm />
        </div>

        <div>
          <h2 className="font-serif text-3xl text-ink">Create or update a product</h2>
          <p className="mt-2 text-sm text-muted">Products stay Draft until you set an approved cache price or Zoho Product ID and mark them Active. Public pages never show professional prices.</p>
          <form action={upsertProductForm} className="mt-6 grid gap-3 md:grid-cols-2">
            <input name="sku" placeholder="SKU" className="border border-sand-200 px-3 py-2" required />
            <input name="slug" placeholder="slug" className="border border-sand-200 px-3 py-2" required />
            <input name="name" placeholder="Official name" className="border border-sand-200 px-3 py-2 md:col-span-2" required />
            <textarea name="description" placeholder="Description" className="border border-sand-200 px-3 py-2 md:col-span-2" />
            <textarea name="intendedUse" placeholder="Professional intended use" className="border border-sand-200 px-3 py-2 md:col-span-2" />
            <input name="priceCents" type="number" placeholder="Price in cents" className="border border-sand-200 px-3 py-2" />
            <select name="publicationStatus" defaultValue="draft" className="border border-sand-200 px-3 py-2">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
            <select name="inventoryStatus" defaultValue="untracked" className="border border-sand-200 px-3 py-2">
              <option value="untracked">Untracked</option>
              <option value="in_stock">In stock</option>
              <option value="out_of_stock">Out of stock</option>
            </select>
            <input name="availableQuantity" type="number" placeholder="Available quantity" className="border border-sand-200 px-3 py-2" />
            <textarea name="images" placeholder="Image URLs, one per line" className="border border-sand-200 px-3 py-2 md:col-span-2" />
            <textarea name="highlights" placeholder="Highlights, one per line" className="border border-sand-200 px-3 py-2 md:col-span-2" />
            <button className="bg-charcoal px-5 py-3 text-sm text-cream md:col-span-2">Save product</button>
          </form>
          <ul className="mt-6 space-y-2 text-sm text-muted">
            {products?.map((product) => (
              <li key={product.id}>{product.sku} · {product.name} · {product.publication_status}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-3xl text-ink">Orders</h2>
          <div className="mt-6 space-y-4">
            {orders?.map((order) => (
              <form key={order.id} action={async (formData) => {
                "use server";
                await updateOrderFulfillment(order.id, String(formData.get("fulfillment") ?? "unfulfilled"), String(formData.get("tracking") ?? ""));
              }} className="grid gap-3 border border-sand-200 bg-white p-4 md:grid-cols-4">
                <p className="md:col-span-4">{order.order_number} · {order.payment_status} · {formatMoney(order.total_cents)}</p>
                <select name="fulfillment" defaultValue={order.fulfillment_status} className="border border-sand-200 px-3 py-2">
                  <option value="unfulfilled">Unfulfilled</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
                <input name="tracking" placeholder="Tracking number" defaultValue={order.tracking_number ?? ""} className="border border-sand-200 px-3 py-2" />
                <button className="bg-charcoal px-4 py-2 text-sm text-cream">Update</button>
              </form>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
