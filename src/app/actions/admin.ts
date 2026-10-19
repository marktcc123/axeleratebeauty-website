"use server";

import { revalidatePath } from "next/cache";
import { requireAuthorizedService, requirePlatformAdmin } from "@/lib/authz";
import { getZohoAccount } from "@/lib/integrations/zoho/crm";
import { retryFailedZohoJobs } from "@/lib/integrations/zoho/sync";

async function requireAdmin() {
  try {
    const session = await requirePlatformAdmin();
    const service = await requireAuthorizedService(session);
    return { session, service, error: null };
  } catch (error) {
    return { session: null, service: null, error: error instanceof Error ? error.message : "Administrator access required." };
  }
}

export async function setOrganizationStatus(organizationId: string, status: "approved" | "rejected" | "suspended") {
  const { session, service, error } = await requireAdmin();
  if (error || !service || !session) return { error };
  await service.from("organizations").update({ verification_status: status, updated_at: new Date().toISOString() }).eq("id", organizationId);
  await service.from("audit_events").insert({
    actor_id: session.userId,
    action: `business_account_${status}`,
    entity_type: "organization",
    entity_id: organizationId,
  });
  revalidatePath("/admin");
  return { error: null };
}

export async function mapZohoAccount(formData: FormData) {
  const { session, service, error } = await requireAdmin();
  if (error || !service || !session) return { error };

  const organizationId = String(formData.get("organizationId") ?? "").trim();
  const zohoAccountId = String(formData.get("zohoAccountId") ?? "").trim();
  const commercialModel = String(formData.get("commercialModel") ?? "").trim();
  if (!organizationId || !zohoAccountId) return { error: "Organization and exact Zoho Account ID are required." };
  if (!/^\d+$/.test(zohoAccountId)) return { error: "Use the exact Zoho Account ID. Do not bind by company name." };

  try {
    const account = await getZohoAccount(zohoAccountId);
    await service
      .from("organizations")
      .update({
        zoho_account_id: zohoAccountId,
        zoho_sync_status: "mapped",
        commercial_model: commercialModel || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", organizationId);
    await service.from("audit_events").insert({
      actor_id: session.userId,
      action: "zoho_account_mapped",
      entity_type: "organization",
      entity_id: organizationId,
      metadata: { zohoAccountId, zohoName: account.Account_Name ?? null },
    });
    revalidatePath("/admin");
    return { error: null, zohoName: String(account.Account_Name ?? "") };
  } catch (mappingError) {
    return { error: mappingError instanceof Error ? mappingError.message : "Zoho Account could not be verified." };
  }
}

export async function retryZohoSync() {
  const { error } = await requireAdmin();
  if (error) return { error };
  const result = await retryFailedZohoJobs();
  revalidatePath("/admin");
  return { error: null, ...result };
}

export async function upsertProduct(formData: FormData) {
  const { session, service, error } = await requireAdmin();
  if (error || !service || !session) return { error };

  const id = String(formData.get("id") ?? "");
  const payload = {
    sku: String(formData.get("sku") ?? "").trim(),
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    intended_use: String(formData.get("intendedUse") ?? "").trim() || null,
    category: String(formData.get("category") ?? "professional_kit"),
    professional_price_cents: formData.get("priceCents") ? Number(formData.get("priceCents")) : null,
    public_price_visible: false,
    inventory_status: String(formData.get("inventoryStatus") ?? "untracked"),
    available_quantity: formData.get("availableQuantity") ? Number(formData.get("availableQuantity")) : null,
    publication_status: String(formData.get("publicationStatus") ?? "draft"),
    zoho_product_id: String(formData.get("zohoProductId") ?? "").trim() || null,
    product_kind: String(formData.get("productKind") ?? "replenishment"),
    usage_notes: String(formData.get("usageNotes") ?? "").trim() || null,
    precautions: String(formData.get("precautions") ?? "").trim() || null,
    images: String(formData.get("images") ?? "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    highlights: String(formData.get("highlights") ?? "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    updated_at: new Date().toISOString(),
  };

  if (!payload.sku || !payload.slug || !payload.name) {
    return { error: "SKU, slug, and official name are required." };
  }
  if (payload.product_kind === "full_system" && payload.publication_status === "active") {
    return { error: "The Full Salon System stays consultative and cannot be published as a checkout SKU." };
  }
  if (payload.product_kind === "internal_lot") {
    return { error: "In-transit supplier lots are not sellable products." };
  }
  if (payload.publication_status === "active" && payload.professional_price_cents == null && !payload.zoho_product_id) {
    return { error: "An approved cache price or Zoho Product ID is required before a product can be published." };
  }

  if (id) {
    await service.from("products").update(payload).eq("id", id);
  } else {
    await service.from("products").insert({ ...payload, publication_status: payload.publication_status || "draft" });
  }

  await service.from("audit_events").insert({
    actor_id: session.userId,
    action: id ? "product_updated" : "product_created",
    entity_type: "product",
    entity_id: payload.sku,
    metadata: { publication_status: payload.publication_status },
  });
  revalidatePath("/admin");
  revalidatePath("/professional-kits");
  revalidatePath("/professional-programs");
  return { error: null };
}

export async function upsertProductForm(formData: FormData) {
  await upsertProduct(formData);
}

export async function updateOrderFulfillment(orderId: string, fulfillmentStatus: string, trackingNumber?: string) {
  const { session, service, error } = await requireAdmin();
  if (error || !service || !session) return { error };
  await service
    .from("orders")
    .update({
      fulfillment_status: fulfillmentStatus,
      tracking_number: trackingNumber || null,
      status: fulfillmentStatus === "shipped" ? "shipped" : fulfillmentStatus === "delivered" ? "delivered" : undefined,
    })
    .eq("id", orderId);
  await service.from("audit_events").insert({
    actor_id: session.userId,
    action: "order_fulfillment_updated",
    entity_type: "order",
    entity_id: orderId,
    metadata: { fulfillmentStatus, trackingNumber },
  });
  revalidatePath("/admin");
  return { error: null };
}
