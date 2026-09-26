import "server-only";
import { getPlatformEmailSettings } from "@/lib/firebase/repositories/platform-settings";
import { consoleEmailService } from "./console-email-service";
import type { WelcomeEmailService, WelcomeEmailPayload } from "./types";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function buildWelcomeEmailHtml(payload: WelcomeEmailPayload): string {
  const storeName = escapeHtml(payload.storeName);
  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><title>Your Webriiz store ${storeName} is ready</title></head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 30px 15px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background-color: #4f46e5; padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">Your Webriiz store is ready</h1>
      </div>
      <div style="padding: 32px 28px;">
        <p style="font-size: 15px; color: #1e293b;">Your Webriiz store, <strong>${storeName}</strong>, has been created and your admin account is ready.</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">
          Set your password to get started, then sign in from your Store Admin dashboard.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${payload.setPasswordLink}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 999px;">
            Set Your Password
          </a>
        </div>
        <p style="font-size: 13px; color: #64748b;">Store admin dashboard: <a href="${payload.adminUrl}">${payload.adminUrl}</a></p>
        <p style="font-size: 13px; color: #64748b;">Storefront: <a href="${payload.storeUrl}">${payload.storeUrl}</a></p>
        <p style="margin-top: 28px; font-size: 12px; color: #94a3b8;">This link will expire. If you didn't expect this email, you can safely ignore it.</p>
      </div>
    </div>
  </body>
  </html>`;
}

/** Real email delivery via Resend's HTTP API (no SDK dependency - same raw-fetch
 * pattern already used by src/lib/notifications/email-service.ts for order
 * confirmations). Falls back to the log-only stub when RESEND_API_KEY is unset, so
 * environments without it configured degrade clearly instead of crashing. */
export const resendEmailService: WelcomeEmailService = {
  async sendWelcomeEmail(payload: WelcomeEmailPayload): Promise<{ delivered: boolean }> {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return consoleEmailService.sendWelcomeEmail(payload);
    }

    const platformEmail = await getPlatformEmailSettings().catch(() => null);
    const from = platformEmail
      ? `${platformEmail.fromName} <${platformEmail.fromEmail}>`
      : process.env.STORE_EMAIL_FROM || "Webriiz <support@webriiz.com>";

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendApiKey}` },
        body: JSON.stringify({
          from,
          to: payload.email,
          subject: `Your Webriiz store "${payload.storeName}" has been created - set your password`,
          html: buildWelcomeEmailHtml(payload),
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error("[welcome-email] Resend API returned an error:", res.status, body);
        return { delivered: false };
      }
      return { delivered: true };
    } catch (err) {
      console.error("[welcome-email] failed to send via Resend:", err);
      return { delivered: false };
    }
  },
};
