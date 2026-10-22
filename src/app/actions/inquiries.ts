"use server";

import { isZohoCrmConfigured } from "@/lib/config";
import { enqueueZohoSync, processInquirySync } from "@/lib/integrations/zoho/sync";
import { checkRateLimit, clientKey } from "@/lib/rate-limit";
import { getSession } from "@/lib/session";
import { createServiceSupabase } from "@/lib/supabase/server";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function submitInquiry(formData: FormData) {
  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const phone = text(formData, "phone");
  const businessName = text(formData, "businessName");
  const message = text(formData, "message");
  const source = text(formData, "source") || "store_evaluation";
  const programSlug = text(formData, "programSlug");
  const purchaseTimeline = text(formData, "purchaseTimeline");
  const locationCountRaw = text(formData, "locationCount");
  const locationCount = locationCountRaw ? Number(locationCountRaw) : null;

  if (!name || !email || !businessName) {
    return { error: "Name, email, and business name are required." };
  }
  if (!/^[^\s@]+@[^\s@]+$/.test(email)) {
    return { error: "Enter a valid business email." };
  }
  if (locationCount != null && (!Number.isInteger(locationCount) || locationCount < 1 || locationCount > 500)) {
    return { error: "Enter a realistic number of stores." };
  }

  const limited = checkRateLimit(clientKey("inquiry", email), 5, 15 * 60 * 1000);
  if (!limited.ok) {
    return { error: "Please wait before submitting another inquiry." };
  }

  const service = await createServiceSupabase();
  if (!service) {
    return { error: "The inquiry could not be saved. Account services are not connected yet." };
  }

  const session = await getSession();
  const { data, error } = await service
    .from("inquiries")
    .insert({
      organization_id: session.organizationId,
      name,
      email,
      phone: phone || null,
      business_name: businessName,
      message: message || null,
      source,
      program_slug: programSlug || null,
      purchase_timeline: purchaseTimeline || null,
      location_count: locationCount,
      sync_status: "pending",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "The inquiry could not be saved. Please try again or email sales@axeleratebeauty.com." };
  }

  await enqueueZohoSync("inquiry", data.id);
  if (isZohoCrmConfigured()) {
    try {
      await processInquirySync(data.id);
    } catch {
      // The inquiry is already saved. Sync remains retryable.
    }
  }

  return {
    error: null,
    inquiryId: data.id,
    mailto: `mailto:sales@axeleratebeauty.com?subject=${encodeURIComponent(`Dermabell inquiry: ${source}`)}&body=${encodeURIComponent(`${message}\n\n${name}\n${businessName}\n${email}\n${phone}`)}`,
  };
}
