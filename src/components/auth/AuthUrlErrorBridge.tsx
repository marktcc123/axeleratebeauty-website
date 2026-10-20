"use client";

import { useEffect } from "react";
import { mapCallbackQueryError } from "@/lib/auth/messages";

export function AuthUrlErrorBridge() {
  useEffect(() => {
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const mapped = mapCallbackQueryError(params.get("error"), params.get("error_code"));
    if (mapped) {
      window.location.replace(`/partner/login?error=${mapped}`);
      return;
    }
    if (params.get("access_token") || params.get("refresh_token") || params.get("type") === "recovery") {
      window.location.replace("/partner/login?error=implicit_link");
    }
  }, []);

  return null;
}
