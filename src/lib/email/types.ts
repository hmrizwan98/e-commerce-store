export interface WelcomeEmailPayload {
  storeName: string;
  storeUrl: string;
  adminUrl: string;
  email: string;
  temporaryPassword: string;
}

/** Swappable behind getWelcomeEmailService() - see console-email-service.ts for the only
 * implementation today (no SMTP integration yet, architecture only). */
export interface WelcomeEmailService {
  sendWelcomeEmail(payload: WelcomeEmailPayload): Promise<void>;
}
