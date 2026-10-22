import { NextResponse, type NextRequest } from "next/server";
import { decideAuthCallback, exchangeFailureKey } from "@/lib/auth/callback";
import { logAuthEvent } from "@/lib/auth/log";
import { loginErrorUrl } from "@/lib/auth/paths";
import { isSupabaseConfigured } from "@/lib/config";
import { createRouteSupabase } from "@/lib/supabase/route";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const decision = decideAuthCallback({
    configured: isSupabaseConfigured(),
    code: url.searchParams.get("code"),
    error: url.searchParams.get("error"),
    errorCode: url.searchParams.get("error_code"),
    next: url.searchParams.get("next"),
  });

  if (decision.action === "error") {
    logAuthEvent({ stage: "auth_callback", code: decision.key, configured: isSupabaseConfigured() });
    return NextResponse.redirect(loginErrorUrl(url.origin, decision.key));
  }

  const destination = new URL(decision.next, url.origin);
  const response = NextResponse.redirect(destination);
  const supabase = createRouteSupabase(request, response);
  if (!supabase) {
    logAuthEvent({ stage: "auth_callback", code: "not_configured", configured: false });
    return NextResponse.redirect(loginErrorUrl(url.origin, "not_configured"));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(decision.code);
  if (error) {
    const key = exchangeFailureKey(error);
    logAuthEvent({ stage: "auth_callback", code: error.code ?? key, status: error.status });
    return NextResponse.redirect(loginErrorUrl(url.origin, key));
  }

  logAuthEvent({ stage: "auth_callback", code: "exchanged", configured: true });
  return response;
}
