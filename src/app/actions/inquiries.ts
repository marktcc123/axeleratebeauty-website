"use server";

import { createServiceSupabase } from "@/lib/supabase/server";
import { getSession } from "@/lib/session";

export async function submitInquiry(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const businessName = String(formData.get("businessName") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const source = String(formData.get("source") ?? "store_evaluation");

  if (!name || !email || !businessName) {
    return { error: "Name, email, and business name are required." };
  }

  const session = await getSession();
  const service = await createServiceSupabase();
  if (service) {
    await service.from("inquiries").insert({
      organization_id: session.organizationId,
      name,
      email,
      phone: phone || null,
      business_name: businessName,
      message: message || null,
      source,
    });
  }

  const subject = encodeURIComponent(`Dermabell inquiry: ${source}`);
  const body = encodeURIComponent(
    `${message}\n\n${name}\n${businessName}\n${email}\n${phone}`,
  );
  return {
    error: null,
    mailto: `mailto:sales@axeleratebeauty.com?subject=${subject}&body=${body}`,
  };
}
