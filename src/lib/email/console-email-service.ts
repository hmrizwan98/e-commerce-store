import "server-only";
import type { WelcomeEmailService, WelcomeEmailPayload } from "./types";

/** No SMTP integration yet - logs what would be sent so the calling code path (createStore)
 * has a real service boundary to call today, ready to swap for a real provider later. */
export const consoleEmailService: WelcomeEmailService = {
  async sendWelcomeEmail(payload: WelcomeEmailPayload): Promise<void> {
    console.log("[welcome-email] would send to", payload.email, {
      storeName: payload.storeName,
      storeUrl: payload.storeUrl,
      adminUrl: payload.adminUrl,
    });
  },
};
