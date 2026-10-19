import { NextResponse } from "next/server";
import { handleStripeEvent } from "@/lib/commerce/stripe-webhook";
import { getStripe } from "@/lib/stripe";
import { createServiceSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const stripe = getStripe();
  const service = await createServiceSupabase();
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !service || !signature || !secret) {
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  }

  const payload = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    const result = await handleStripeEvent(service as never, event);
    if (result.retry) {
      return NextResponse.json({ error: "Event is still processing." }, { status: 409 });
    }
    return NextResponse.json(result);
  } catch (error) {
    await service.from("webhook_failures").insert({
      provider: "stripe",
      event_id: event.id,
      error: error instanceof Error ? error.message : "Webhook processing failed",
    });
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
