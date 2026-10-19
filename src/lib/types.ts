export type VerificationStatus = "pending" | "approved" | "rejected" | "suspended";
export type PublicationStatus = "draft" | "active" | "archived";
export type InventoryStatus = "untracked" | "in_stock" | "out_of_stock";
export type OrgRole = "pending" | "member" | "company_admin";
export type LocationRole = "buyer" | "store_admin" | "hq_admin";
export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";
export type OrderKind = "replenishment" | "program" | "contract_installment";
export type CatalogSource = "supabase_cache" | "zoho_commerce";

export type PackageContent = {
  name: string;
  sku?: string;
  quantity?: number;
};

export type AuthorizedLocation = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  role: LocationRole;
};

export type Product = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string | null;
  intendedUse: string | null;
  category: string;
  highlights: string[];
  contents: PackageContent[];
  usageNotes: string | null;
  precautions: string | null;
  images: string[];
  currency: string;
  professionalPriceCents: number | null;
  publicPriceVisible: boolean;
  inventoryStatus: InventoryStatus;
  availableQuantity: number | null;
  shippingAttributes: Record<string, unknown>;
  publicationStatus: PublicationStatus;
  reorderEligible: boolean;
  relatedProductIds: string[];
  zohoCrmProductId?: string | null;
  zohoCommerceProductId?: string | null;
  zohoVariantId?: string | null;
  productKind?: "replenishment" | "program" | "full_system" | "internal_lot";
};

export type CartItem = {
  productId: string;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
};

export type SessionContext = {
  userId: string | null;
  email: string | null;
  fullName: string | null;
  isPlatformAdmin: boolean;
  organizationId: string | null;
  organizationName: string | null;
  verificationStatus: VerificationStatus | null;
  orgRole: OrgRole | null;
  locations: AuthorizedLocation[];
  activeLocationId: string | null;
};

export function canPurchase(session: SessionContext | null) {
  return Boolean(
    session?.userId &&
      session.organizationId &&
      session.verificationStatus === "approved" &&
      session.activeLocationId,
  );
}

export function isPending(session: SessionContext | null) {
  return session?.verificationStatus === "pending";
}

export function canAccessLocation(session: SessionContext | null, locationId: string | null) {
  if (!session?.userId || !locationId) return false;
  return session.locations.some((location) => location.id === locationId);
}
