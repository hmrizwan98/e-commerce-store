export interface WelcomeEmailPayload {
  storeName: string;
  storeUrl: string;
  adminUrl: string;
  email: string;
  /** A one-time secure password-setup link (Admin SDK generatePasswordResetLink()) -
   * never a plaintext password. Recipient sets their own password by following it. */
  setPasswordLink: string;
}

/** Swappable behind getWelcomeEmailService() - see resend-email-service.ts for the real
 * implementation (falls back to console-email-service.ts's log-only stub when
 * RESEND_API_KEY isn't configured). `delivered` lets callers report an honest
 * success/failure state instead of assuming a resolved promise means real delivery. */
export interface WelcomeEmailService {
  sendWelcomeEmail(payload: WelcomeEmailPayload): Promise<{ delivered: boolean }>;
}
