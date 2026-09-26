import "server-only";
import type { WelcomeEmailService, WelcomeEmailPayload } from "./types";

/** Fallback used when RESEND_API_KEY isn't configured (see resend-email-service.ts) -
 * logs clearly that the email was NOT actually delivered, rather than silently
 * pretending it was, so this degraded state is visible in server logs. */
export const consoleEmailService: WelcomeEmailService = {
  async sendWelcomeEmail(payload: WelcomeEmailPayload): Promise<{ delivered: boolean }> {
    console.warn(
      "[welcome-email] RESEND_API_KEY not configured - email NOT delivered. Would have sent to",
      payload.email,
      {
        storeName: payload.storeName,
        storeUrl: payload.storeUrl,
        adminUrl: payload.adminUrl,
        // Logged so the link isn't silently lost when no provider is configured -
        // an operator can still copy it out of server logs and hand it to the
        // recipient manually until RESEND_API_KEY is set up.
        setPasswordLink: payload.setPasswordLink,
      }
    );
    return { delivered: false };
  },
};
