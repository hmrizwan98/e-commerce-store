import { formatMoney, type CurrencySettings } from "@/lib/currency/format";
import type { Order } from "@/types/order";

/** Store branding for customer-facing order emails - the email is FROM the store the
 * customer bought from (its name, logo, theme color, reply-to), not from Webriiz. */
export interface OrderEmailBrand {
  storeName: string;
  logoUrl?: string;
  /** Theme primary color (#rrggbb); falls back to indigo. */
  primaryColor?: string;
  /** Where customer replies go - the store's own support/contact email. */
  replyTo?: string;
}

export interface OrderEmailOptions {
  currency?: CurrencySettings | null;
  brand?: OrderEmailBrand;
}

const DEFAULT_BRAND_COLOR = "#4f46e5";
const EMAIL_PATTERN = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function brandColor(brand?: OrderEmailBrand): string {
  return brand?.primaryColor && /^#[0-9a-f]{6}$/i.test(brand.primaryColor) ? brand.primaryColor : DEFAULT_BRAND_COLOR;
}

/** White or near-black text, whichever reads better on the brand color. */
function textOn(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.6 ? "#0f172a" : "#ffffff";
}

export function isValidEmail(value: string | undefined | null): value is string {
  return !!value && EMAIL_PATTERN.test(value.trim()) && !/@example\.com$/i.test(value.trim());
}

/** The sending ADDRESS must be on a domain verified in Resend (webriiz.com), so a store's
 * Gmail/other address can't be the From address - the store's NAME is used as the display
 * name instead, and its own email goes in Reply-To. Override with ORDER_EMAIL_FROM_ADDRESS. */
function orderSenderAddress(): string {
  const configured = process.env.ORDER_EMAIL_FROM_ADDRESS?.trim();
  if (isValidEmail(configured)) return configured;
  const root = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || "webriiz.com").trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `orders@${root}`;
}

/**
 * Builds HTML template for order confirmation email
 */
export function buildOrderEmailHtml(
  order: Partial<Order> & { orderNumber: string },
  { currency, brand }: OrderEmailOptions = {}
): string {
  const customerName = escapeHtml(order.guestName || order.shippingAddress?.fullName || "Valued Customer");
  const storeName = escapeHtml(brand?.storeName || "our store");
  const color = brandColor(brand);
  const onColor = textOn(color);
  const logoUrl = brand?.logoUrl && /^https:\/\//i.test(brand.logoUrl) ? escapeHtml(brand.logoUrl) : "";
  const items = order.items || [];
  const subtotal = formatMoney(order.subtotal ?? 0, currency);
  const shippingCost = order.shippingCost ? formatMoney(order.shippingCost, currency) : "Free";
  const total = formatMoney(order.total ?? 0, currency);
  const address = order.shippingAddress;

  const itemRowsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
        <strong style="color: #0f172a; font-size: 14px;">${escapeHtml(item.name)}</strong>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: center; color: #475569; font-size: 14px;">
        x${item.quantity}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold; color: #0f172a; font-size: 14px;">
        ${formatMoney(item.unitPrice * item.quantity, currency)}
      </td>
    </tr>
  `
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${storeName} - Order Confirmation #${escapeHtml(order.orderNumber)}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 30px 15px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      
      <!-- Header Banner -->
      <div style="background-color: ${color}; padding: 32px 24px; text-align: center;">
        ${
          logoUrl
            ? `<img src="${logoUrl}" alt="${storeName}" style="max-height: 48px; max-width: 180px; margin: 0 auto 16px; display: block; background: #ffffff; border-radius: 10px; padding: 6px 10px;" />`
            : `<p style="color: ${onColor}; margin: 0 0 12px; font-size: 18px; font-weight: 800; letter-spacing: 0.5px;">${storeName}</p>`
        }
        <h1 style="color: ${onColor}; margin: 0; font-size: 24px; font-weight: 800;">Order Placed Successfully!</h1>
        <p style="color: ${onColor}; opacity: 0.85; margin-top: 8px; font-size: 14px;">Thank you for shopping with ${storeName}. Order #${escapeHtml(order.orderNumber)}</p>
      </div>

      <!-- Content Container -->
      <div style="padding: 32px 28px;">
        <p style="font-size: 16px; color: #1e293b; margin-top: 0;">Hi <strong>${customerName}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">We’ve received your order and are currently getting it ready. You will receive another notification when your items are confirmed and shipped.</p>

        <!-- Order Items Table -->
        <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-top: 28px; margin-bottom: 12px; font-weight: 700;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid #e2e8f0; text-align: left;">
              <th style="padding-bottom: 8px; font-size: 12px; color: #64748b; text-transform: uppercase;">Item</th>
              <th style="padding-bottom: 8px; font-size: 12px; color: #64748b; text-transform: uppercase; text-align: center;">Qty</th>
              <th style="padding-bottom: 8px; font-size: 12px; color: #64748b; text-transform: uppercase; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRowsHtml}
          </tbody>
        </table>

        <!-- Totals - a table, not flexbox: Gmail strips display:flex, which squashed
             "Subtotal" and its amount together. -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border-top: 2px solid #f1f5f9;">
          <tr>
            <td style="padding: 12px 0 4px; font-size: 14px; color: #475569;">Subtotal</td>
            <td style="padding: 12px 0 4px; font-size: 14px; color: #475569; text-align: right;">${subtotal}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-size: 14px; color: #475569;">Shipping</td>
            <td style="padding: 4px 0; font-size: 14px; color: #475569; text-align: right;">${shippingCost}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0 0; border-top: 1px solid #e2e8f0; font-size: 18px; font-weight: 800; color: #0f172a;">${
              order.paymentMethod === "cod" ? "Order Total (Cash on Delivery)" : "Order Total"
            }</td>
            <td style="padding: 12px 0 0; border-top: 1px solid #e2e8f0; font-size: 18px; font-weight: 800; color: ${color}; text-align: right;">${total}</td>
          </tr>
        </table>

        ${
          address
            ? `
        <!-- Shipping Address Card -->
        <div style="margin-top: 28px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
          <h4 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; color: #475569; font-weight: 700;">Delivery Address</h4>
          <p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.5;">
            <strong>${escapeHtml(address.fullName)}</strong><br/>
            ${escapeHtml(address.line1)}<br/>
            ${address.line2 ? `${escapeHtml(address.line2)}<br/>` : ""}
            ${escapeHtml(address.city)}, ${escapeHtml(address.country)}
          </p>
        </div>
        `
            : ""
        }

        <p style="margin-top: 32px; font-size: 13px; color: #94a3b8; text-align: center;">
          Need help with your order? Simply reply to this email to contact ${storeName}.
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}

/** What actually happened to a customer email - stored on the order and shown in Admin. */
export type EmailDeliveryStatus =
  | "pending" // queued after checkout, attempt not finished yet
  | "sent" // the provider accepted it
  | "failed" // the provider rejected it or could not be reached
  | "not_configured" // no email provider on this platform - nothing was sent
  | "no_recipient" // the customer gave no (valid) email address
  | "disabled"; // turned off in Settings (Notifications -> Email or Email Templates)

export interface EmailDeliveryResult {
  status: EmailDeliveryStatus;
  /** True only when the provider accepted the email. */
  success: boolean;
  /** Safe, admin-facing text - never contains credentials or raw provider responses. */
  message: string;
}

export const EMAIL_STATUS_MESSAGES: Record<EmailDeliveryStatus, string> = {
  pending: "Sending the confirmation email…",
  sent: "Confirmation email sent to the customer.",
  failed: "The confirmation email could not be delivered by the email provider.",
  not_configured: "Not sent - no email provider is configured on this platform.",
  no_recipient: "Not sent - the customer didn't give a valid email address.",
  disabled: "Not sent - order confirmation emails are turned off in Settings.",
};

export function emailResult(status: EmailDeliveryStatus): EmailDeliveryResult {
  return { status, success: status === "sent", message: EMAIL_STATUS_MESSAGES[status] };
}

/** Default subject = exactly what order emails have always used. */
export const DEFAULT_ORDER_SUBJECT_TEMPLATE = "{{storeName}}: Order Confirmation #{{orderNumber}}";

/**
 * Subject from the store's Email Templates setting. Only {{storeName}} and {{orderNumber}}
 * are replaced; line breaks are removed (header injection) and the length is capped. An empty
 * template falls back to the default.
 */
export function renderOrderSubject(template: string | undefined | null, vars: { storeName: string; orderNumber: string }): string {
  const source = template && template.trim() ? template : DEFAULT_ORDER_SUBJECT_TEMPLATE;
  const out = source
    .replace(/\{\{\s*storeName\s*\}\}/g, vars.storeName)
    .replace(/\{\{\s*orderNumber\s*\}\}/g, vars.orderNumber)
    .replace(/[\r\n]+/g, " ")
    .trim();
  return (out || `${vars.storeName}: Order Confirmation #${vars.orderNumber}`).slice(0, 200);
}

export interface OrderEmailSendOptions extends OrderEmailOptions {
  /** Store setting (Email Templates -> Order Confirmation subject). */
  subjectTemplate?: string;
  /** Settings -> Notifications -> Email AND Email Templates -> Order Confirmation enabled. */
  enabled?: boolean;
  /** Injected in tests; defaults to global fetch. */
  fetchImpl?: typeof fetch;
}

/**
 * Sends the order confirmation email through Resend (the platform's existing provider) and
 * reports what REALLY happened. It used to return success:true even when Resend rejected the
 * email or no provider was configured.
 */
export async function sendOrderConfirmationEmail(
  order: Partial<Order> & { orderNumber: string; guestEmail?: string },
  options: OrderEmailSendOptions = {}
): Promise<EmailDeliveryResult> {
  if (options.enabled === false) return emailResult("disabled");
  const recipientEmail = order.guestEmail?.trim();
  if (!isValidEmail(recipientEmail)) return emailResult("no_recipient");

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn(`[Email Service] No email provider configured - order #${order.orderNumber} confirmation not sent.`);
    return emailResult("not_configured");
  }

  const html = buildOrderEmailHtml(order, options);
  const storeName = (options.brand?.storeName || "Order Update").replace(/[\r\n<>\"]/g, "").trim();
  const replyTo = isValidEmail(options.brand?.replyTo) ? options.brand!.replyTo!.trim() : undefined;
  const doFetch = options.fetchImpl ?? fetch;

  try {
    const res = await doFetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `${storeName} <${orderSenderAddress()}>`,
        to: recipientEmail,
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject: renderOrderSubject(options.subjectTemplate, { storeName, orderNumber: order.orderNumber }),
        html,
      }),
    });
    if (res.ok) return emailResult("sent");
    // Status code only in the server log - the provider's body can echo request details.
    console.error(`[Email Service] Resend rejected order #${order.orderNumber} email (HTTP ${res.status}).`);
    return emailResult("failed");
  } catch (err: any) {
    console.error(`[Email Service] Could not reach the email provider for order #${order.orderNumber}:`, err?.name || "error");
    return emailResult("failed");
  }
}
