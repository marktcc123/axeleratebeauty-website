import { isZohoCommerceConfigured, isZohoCrmConfigured } from "@/lib/config";
import { ZohoError } from "./errors";

const DATA_CENTERS = {
  US: { accounts: "https://accounts.zoho.com", api: "https://www.zohoapis.com" },
  EU: { accounts: "https://accounts.zoho.eu", api: "https://www.zohoapis.eu" },
  IN: { accounts: "https://accounts.zoho.in", api: "https://www.zohoapis.in" },
  AU: { accounts: "https://accounts.zoho.com.au", api: "https://www.zohoapis.com.au" },
  JP: { accounts: "https://accounts.zoho.jp", api: "https://www.zohoapis.jp" },
  CA: { accounts: "https://accounts.zohocloud.ca", api: "https://www.zohoapis.ca" },
} as const;

export function getZohoConfig() {
  if (!isZohoCrmConfigured()) {
    throw new ZohoError("Zoho CRM credentials are not configured.", "not_configured");
  }

  const accountsUrl = (process.env.ZOHO_ACCOUNTS_URL ?? DATA_CENTERS.US.accounts).replace(/\/$/, "");
  return {
    clientId: process.env.ZOHO_CLIENT_ID!,
    clientSecret: process.env.ZOHO_CLIENT_SECRET!,
    refreshToken: process.env.ZOHO_REFRESH_TOKEN!,
    accountsUrl,
    fallbackApiDomain: process.env.ZOHO_API_DOMAIN ?? DATA_CENTERS.US.api,
    redirectUri: process.env.ZOHO_REDIRECT_URI ?? "",
    commerceOrgId: process.env.ZOHO_COMMERCE_ORG_ID ?? "",
    commerceApiDomain: process.env.ZOHO_COMMERCE_API_DOMAIN ?? "https://commerce.zoho.com",
    commerceEnabled: isZohoCommerceConfigured(),
    scopes: [
      "ZohoCRM.modules.leads.CREATE",
      "ZohoCRM.modules.leads.READ",
      "ZohoCRM.modules.accounts.READ",
      "ZohoCRM.modules.contacts.READ",
      "ZohoCRM.modules.contacts.CREATE",
      "ZohoCRM.modules.deals.CREATE",
      "ZohoCRM.modules.deals.READ",
    ],
  };
}

export function getZohoCommerceConfig() {
  const config = getZohoConfig();
  if (!config.commerceEnabled) {
    throw new ZohoError("Zoho Commerce is not configured.", "not_configured");
  }
  return config;
}
