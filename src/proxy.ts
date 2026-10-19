import { type NextRequest, NextResponse } from "next/server";
import { isDevPreviewEnabled } from "@/lib/dev-preview";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  const path = request.nextUrl.pathname;
  const preview = isDevPreviewEnabled(request.nextUrl.hostname) || isDevPreviewEnabled(request.headers.get("host"));

  if (path.startsWith("/partner") && !["/partner/login", "/partner/register"].includes(path)) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL && !preview) {
      return NextResponse.redirect(new URL("/partner/login", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
