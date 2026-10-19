import { getZohoCommerceConfig } from "./config";
import { getZohoAccessContext } from "./oauth";
import { ZohoError, zohoErrorFromResponse } from "./errors";

export type ZohoCommerceProduct = {
  productId: string;
  name: string;
  sku: string | null;
  status: string | null;
  rateCents: number | null;
  availableStock: number | null;
};

function dollarsToCents(value: unknown) {
  if (value == null || value === "") return null;
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return null;
  return Math.round(amount * 100);
}

export async function listCommerceProductsBySku(sku: string) {
  const config = getZohoCommerceConfig();
  const context = await getZohoAccessContext();
  const response = await fetch(`${config.commerceApiDomain.replace(/\/$/, "")}/store/api/v1/products?filter_by=Status.All`, {
    headers: {
      Authorization: `Zoho-oauthtoken ${context.accessToken}`,
      "X-com-zoho-store-organizationid": config.commerceOrgId,
    },
    cache: "no-store",
  });
  const text = await response.text();
  if (!response.ok) throw zohoErrorFromResponse(response.status, text);
  const payload = JSON.parse(text) as {
    products?: Array<{
      product_id: string;
      name: string;
      status?: string;
      variants?: Array<{
        sku?: string;
        rate?: number | string;
        purchase_rate?: number | string;
        available_sale_stock?: number;
      }>;
    }>;
  };

  const matches: ZohoCommerceProduct[] = [];
  for (const product of payload.products ?? []) {
    for (const variant of product.variants ?? []) {
      if ((variant.sku ?? "").trim() !== sku) continue;
      matches.push({
        productId: product.product_id,
        name: product.name,
        sku: variant.sku ?? null,
        status: product.status ?? null,
        rateCents: dollarsToCents(variant.rate),
        availableStock: variant.available_sale_stock ?? null,
      });
    }
  }
  return matches;
}

export function assertCommerceNotUsedAsPublicPriceApi() {
  throw new ZohoError(
    "The Zoho Commerce storefront public API is not used for customer or supplier prices.",
    "conflict",
  );
}
