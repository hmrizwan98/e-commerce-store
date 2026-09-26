import "server-only";
import { resendEmailService } from "./resend-email-service";
import type { WelcomeEmailService } from "./types";

/** Single swap point for the email provider - same shape as
 * src/lib/images/upload-service.ts's STORAGE_ENABLED switch. resendEmailService itself
 * falls back to a clearly-logged no-op when RESEND_API_KEY isn't configured. */
export function getWelcomeEmailService(): WelcomeEmailService {
  return resendEmailService;
}

export type { WelcomeEmailPayload, WelcomeEmailService } from "./types";
