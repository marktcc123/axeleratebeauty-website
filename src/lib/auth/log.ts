export type AuthLogStage =
  | "login"
  | "password_reset_request"
  | "auth_callback"
  | "password_update";

export function redactAuthLog(input: {
  stage: AuthLogStage;
  code?: string | null;
  status?: number | null;
  configured?: boolean;
}) {
  return {
    stage: input.stage,
    code: input.code ?? null,
    status: input.status ?? null,
    configured: input.configured ?? null,
  };
}

export function logAuthEvent(input: {
  stage: AuthLogStage;
  code?: string | null;
  status?: number | null;
  configured?: boolean;
}) {
  console.info("auth.event", redactAuthLog(input));
}
