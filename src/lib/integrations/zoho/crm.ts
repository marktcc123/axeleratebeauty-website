import { zohoRequest } from "./oauth";
import { ZohoError, zohoErrorFromResponse } from "./errors";

type InquiryInput = {
  name: string;
  email: string;
  phone?: string | null;
  businessName: string;
  message?: string | null;
  source: string;
  programSlug?: string | null;
  locationCount?: number | null;
  purchaseTimeline?: string | null;
  websiteInquiryId: string;
  zohoAccountId?: string | null;
};

export async function getZohoAccount(accountId: string) {
  const response = await zohoRequest(`/crm/v8/Accounts/${accountId}`);
  const text = await response.text();
  if (response.status === 204 || response.status === 404) {
    throw new ZohoError("Zoho Account was not found.", "not_found", false, response.status);
  }
  if (!response.ok) throw zohoErrorFromResponse(response.status, text);
  const payload = JSON.parse(text) as { data?: Array<Record<string, unknown>> };
  const account = payload.data?.[0];
  if (!account) throw new ZohoError("Zoho Account response was empty.", "not_found");
  return account;
}

export async function createInquiryLead(input: InquiryInput) {
  const lastName = input.name.trim().split(/\s+/).slice(-1)[0] || input.businessName;
  const response = await zohoRequest("/crm/v8/Leads", {
    method: "POST",
    body: JSON.stringify({
      data: [
        {
          Last_Name: lastName,
          First_Name: input.name.trim().split(/\s+/)[0] ?? input.name,
          Email: input.email,
          Phone: input.phone ?? undefined,
          Company: input.businessName,
          Description: input.message ?? undefined,
          Lead_Source: input.source,
          Website_Inquiry_ID: input.websiteInquiryId,
          Program_Interest: input.programSlug ?? undefined,
          Store_Count: input.locationCount ?? undefined,
          Purchase_Timeline: input.purchaseTimeline ?? undefined,
          Account_Name: input.zohoAccountId ? { id: input.zohoAccountId } : undefined,
        },
      ],
    }),
  });
  const text = await response.text();
  if (!response.ok) throw zohoErrorFromResponse(response.status, text);
  const payload = JSON.parse(text) as { data?: Array<{ details?: { id?: string } }> };
  const id = payload.data?.[0]?.details?.id;
  if (!id) throw new ZohoError("Zoho did not return a Lead ID.", "invalid_response");
  return id;
}

export async function searchContactByEmail(email: string) {
  const criteria = encodeURIComponent(`(Email:equals:${email})`);
  const response = await zohoRequest(`/crm/v8/Contacts/search?criteria=${criteria}`);
  if (response.status === 204) return null;
  const text = await response.text();
  if (!response.ok) throw zohoErrorFromResponse(response.status, text);
  const payload = JSON.parse(text) as { data?: Array<{ id: string; Account_Name?: { id?: string } }> };
  return payload.data?.[0] ?? null;
}
