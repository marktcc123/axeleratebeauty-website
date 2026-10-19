import Stripe from "stripe";
import { isStripeConfigured } from "@/lib/config";

export function getStripe() {
  if (!isStripeConfigured()) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}
