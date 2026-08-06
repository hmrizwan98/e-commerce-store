import "server-only";
import { consoleEmailService } from "./console-email-service";
import type { WelcomeEmailService } from "./types";

/** Single swap point for a real email provider later - same shape as
 * src/lib/images/upload-service.ts's STORAGE_ENABLED switch. */
export function getWelcomeEmailService(): WelcomeEmailService {
  return consoleEmailService;
}

export type { WelcomeEmailPayload, WelcomeEmailService } from "./types";
