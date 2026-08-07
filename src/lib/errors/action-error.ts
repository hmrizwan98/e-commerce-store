import "server-only";
import { randomBytes } from "node:crypto";

/**
 * Structured error shape for Server Actions that need to report a KNOWN,
 * anticipated failure (validation, uniqueness conflict, a provisioning step
 * failing) without relying on Next.js's own production error redaction,
 * which replaces any thrown Error's message with an opaque generic string
 * and gives the client nothing to act on or report. Returned as data
 * (`{ success: false, error }`), never thrown - the message here is always
 * safe to render directly; the traceId is what correlates a user's report
 * back to the full error/stack recorded server-side via logActionError().
 */
export type ActionErrorCode =
  | "UNAUTHORIZED"
  | "RATE_LIMITED"
  | "VALIDATION_FAILED"
  | "SLUG_TAKEN"
  | "EMAIL_TAKEN"
  | "DOMAIN_TAKEN"
  | "PROVISIONING_FAILED"
  | "UNKNOWN";

export interface ActionError {
  code: ActionErrorCode;
  step: string;
  message: string;
  traceId: string;
}

export function generateTraceId(): string {
  return randomBytes(8).toString("hex");
}

/** Logs the full error/stack server-side, keyed by traceId - this is the
 * only place the real error detail goes; it never reaches the client. */
export function logActionError(traceId: string, step: string, err: unknown): void {
  console.error(`[action:${traceId}] FAILED at ${step}`, {
    step,
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
}

export function toActionError(traceId: string, step: string, code: ActionErrorCode, message: string): ActionError {
  return { code, step, message, traceId };
}
