import { createServiceSupabase } from "@/lib/supabase/server";
import { createInquiryLead, searchContactByEmail } from "./crm";
import { ZohoError } from "./errors";

export async function enqueueZohoSync(entityType: string, entityId: string, direction: "to_zoho" | "from_zoho" = "to_zoho") {
  const service = await createServiceSupabase();
  if (!service) return null;
  const { data, error } = await service
    .from("zoho_sync_jobs")
    .insert({ entity_type: entityType, entity_id: entityId, direction, status: "pending" })
    .select("id")
    .single();
  if (error) return null;
  return data.id as string;
}

export async function processInquirySync(inquiryId: string) {
  const service = await createServiceSupabase();
  if (!service) throw new ZohoError("Supabase is not configured for Zoho sync.", "not_configured");

  const { data: inquiry, error } = await service.from("inquiries").select("*").eq("id", inquiryId).maybeSingle();
  if (error || !inquiry) throw new ZohoError("Inquiry was not found for sync.", "not_found");

  let zohoAccountId: string | null = null;
  if (inquiry.organization_id) {
    const { data: organization } = await service
      .from("organizations")
      .select("zoho_account_id")
      .eq("id", inquiry.organization_id)
      .maybeSingle();
    zohoAccountId = organization?.zoho_account_id ?? null;
  }

  if (!zohoAccountId && inquiry.email) {
    const contact = await searchContactByEmail(inquiry.email);
    zohoAccountId = contact?.Account_Name?.id ?? null;
  }

  const leadId = await createInquiryLead({
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    businessName: inquiry.business_name,
    message: inquiry.message,
    source: inquiry.source,
    programSlug: inquiry.program_slug,
    locationCount: inquiry.location_count,
    purchaseTimeline: inquiry.purchase_timeline,
    websiteInquiryId: inquiry.id,
    zohoAccountId,
  });

  await service
    .from("inquiries")
    .update({ sync_status: "succeeded", zoho_lead_id: leadId, last_sync_error: null })
    .eq("id", inquiryId);

  await service
    .from("zoho_sync_jobs")
    .update({ status: "succeeded", last_error: null, updated_at: new Date().toISOString() })
    .eq("entity_type", "inquiry")
    .eq("entity_id", inquiryId);

  return leadId;
}

export async function retryFailedZohoJobs() {
  const service = await createServiceSupabase();
  if (!service) return { processed: 0, failed: 0 };
  const { data: jobs } = await service
    .from("zoho_sync_jobs")
    .select("id, entity_type, entity_id, attempt_count")
    .in("status", ["pending", "failed"])
    .order("created_at", { ascending: true })
    .limit(20);

  let processed = 0;
  let failed = 0;
  for (const job of jobs ?? []) {
    try {
      if (job.entity_type === "inquiry") {
        await processInquirySync(job.entity_id);
      } else {
        throw new ZohoError(`No processor for ${job.entity_type}.`, "not_found");
      }
      processed += 1;
    } catch (error) {
      failed += 1;
      await service
        .from("zoho_sync_jobs")
        .update({
          status: "failed",
          attempt_count: (job.attempt_count ?? 0) + 1,
          last_error: error instanceof Error ? error.message : "Unknown sync error",
          next_retry_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);
      if (job.entity_type === "inquiry") {
        await service
          .from("inquiries")
          .update({
            sync_status: "failed",
            last_sync_error: error instanceof Error ? error.message : "Unknown sync error",
          })
          .eq("id", job.entity_id);
      }
    }
  }
  return { processed, failed };
}
