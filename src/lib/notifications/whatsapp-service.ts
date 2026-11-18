import { formatMoney, type CurrencySettings } from "@/lib/currency/format";
import { getGeneralSettings } from "@/lib/firebase/repositories/site-settings";
import type { Order } from "@/types/order";
import { buildOrderTrackingUrl } from "@/lib/orders/tracking-url";

/**
 * Clean and format phone numbers into international format without + (e.g. 03001234567 -> 923001234567)
 */
export function formatPhoneNumber(phone: string, defaultCountryCode = "92"): string {
  if (!phone) return "";
  let cleaned = phone.replace(/\D/g, ""); // Remove all non-digits
  
  if (cleaned.startsWith("0")) {
    cleaned = defaultCountryCode + cleaned.substring(1);
  } else if (!cleaned.startsWith("92") && !cleaned.startsWith("1") && cleaned.length === 10) {
    cleaned = defaultCountryCode + cleaned;
  }
  return cleaned;
}

export type WhatsAppNotificationType =
  | "ORDER_PLACED"
  | "ORDER_CONFIRMED"
  | "ORDER_DISPATCHED"
  | "ORDER_DELIVERED";

export type WhatsAppDeliveryStatus = "sent" | "failed" | "not_configured" | "no_recipient" | "disabled";

export interface SendWhatsAppResult {
  status: WhatsAppDeliveryStatus;
  /** True only when the WhatsApp gateway accepted the message. */
  success: boolean;
  message: string;
  /** Click-to-chat link the admin can open manually (always built when there is a phone). */
  waLink: string;
}

export const WHATSAPP_STATUS_MESSAGES: Record<WhatsAppDeliveryStatus, string> = {
  sent: "WhatsApp message sent automatically.",
  failed: "The WhatsApp gateway could not deliver the message.",
  not_configured: "Not sent automatically - no WhatsApp gateway is configured on this platform. Use the order's WhatsApp button to message the customer.",
  no_recipient: "Not sent - the order has no phone number.",
  disabled: "Not sent - automatic WhatsApp alerts are turned off in Settings → Notifications.",
};

/** True when the platform has an automated WhatsApp gateway (env only - values never exposed). */
export function isWhatsAppGatewayConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN);
}

/**
 * Builds standard WhatsApp message text based on order event type
 */
export function buildWhatsAppMessageText(
  type: WhatsAppNotificationType,
  order: Partial<Order> & { orderNumber: string },
  currency?: CurrencySettings | null,
  /** The store's storefront URL - enables the tracking link in "dispatched" messages. */
  storefrontUrl?: string | null
): string {
  const customerName = order.guestName || order.shippingAddress?.fullName || "Valued Customer";
  const orderNum = order.orderNumber;
  const totalAmount = formatMoney(order.total ?? 0, currency);
  const itemsText = order.items
    ? order.items.map((i) => `• ${i.name} (x${i.quantity})`).join("\n")
    : "Items in order";
  const addressText = order.shippingAddress
    ? [order.shippingAddress.line1, order.shippingAddress.city].filter(Boolean).join(", ")
    : "Your delivery address";

  switch (type) {
    case "ORDER_PLACED":
      return `🛒 *Order Placed Successfully!*

Hello *${customerName}*, thank you for your order!
Your Order *#${orderNum}* has been received.

📦 *Order Details:*
${itemsText}

💰 *Total Amount:* ${totalAmount}
📍 *Delivery Address:* ${addressText}

We are processing your order and will send you another update once confirmed. Thank you for shopping with us!`;

    case "ORDER_CONFIRMED":
      return `✅ *Order Confirmed!*

Hi *${customerName}*, great news!
Your Order *#${orderNum}* has been confirmed by our team. 

We are currently packing your items for dispatch. You will receive another notification once your parcel is on its way!`;

    case "ORDER_DISPATCHED":
      const trackingInfoText = order.trackingNumber
        ? `\n📦 *Tracking / Consignment #:* ${order.trackingNumber}`
        : "";
      const courierText = order.courierName
        ? `\n🚚 *Courier Provider:* ${order.courierName}`
        : "";
      // Previously a hardcoded https://yourstore.com placeholder (never a working link),
      // and only for customers who gave an email.
      const trackingUrl = buildOrderTrackingUrl(storefrontUrl, order);
      const trackingPageLink = trackingUrl ? `\n\n🔍 *Track your order live on our store:* \n${trackingUrl}` : "";

      return `🚚 *Order Dispatched!*

Hi *${customerName}*, your Order *#${orderNum}* is on its way to your address!
${courierText}${trackingInfoText}

📍 *Shipping To:* ${addressText}${trackingPageLink}

Get ready to receive your parcel soon! Thank you for choosing us.`;

    case "ORDER_DELIVERED":
      return `🎁 *Order Delivered - We value your feedback!*

Hi *${customerName}*, your Order *#${orderNum}* has been delivered! 

We hope you love your purchase! ❤️
Please reply to this message with your review or let us know if you need any assistance. Your feedback helps us serve you better.

Thank you for shopping with us!`;
    default:
      return `Update on Order #${orderNum}`;
  }
}

/**
 * Sends an automated WhatsApp message through the platform's gateway (if one is configured)
 * and reports what REALLY happened. It used to return success:true ("link generated") even
 * when nothing was sent. The click-to-chat link is still returned for manual use.
 */
export async function sendWhatsAppNotification(
  type: WhatsAppNotificationType,
  order: Partial<Order> & { orderNumber: string; shippingAddress?: any },
  currency?: CurrencySettings | null,
  storefrontUrl?: string | null,
  opts: { enabled?: boolean; fetchImpl?: typeof fetch } = {}
): Promise<SendWhatsAppResult> {
  const rawPhone = order.shippingAddress?.phone || (order as any).guestPhone || "";
  const phone = formatPhoneNumber(rawPhone);
  const messageText = buildWhatsAppMessageText(type, order, currency, storefrontUrl);
  const waLink = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}` : "";
  const result = (status: WhatsAppDeliveryStatus): SendWhatsAppResult => ({
    status,
    success: status === "sent",
    message: WHATSAPP_STATUS_MESSAGES[status],
    waLink,
  });

  if (opts.enabled === false) return result("disabled");
  if (!phone) return result("no_recipient");
  if (!isWhatsAppGatewayConfigured()) return result("not_configured");

  try {
    const response = await (opts.fetchImpl ?? fetch)(process.env.WHATSAPP_API_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}` },
      body: JSON.stringify({ messaging_product: "whatsapp", to: phone, type: "text", text: { body: messageText } }),
    });
    if (response.ok) return result("sent");
    console.warn(`[WhatsApp] Gateway rejected ${type} for order #${order.orderNumber} (HTTP ${response.status}).`);
    return result("failed");
  } catch (err: any) {
    console.error(`[WhatsApp] Gateway unreachable for order #${order.orderNumber}:`, err?.name || "error");
    return result("failed");
  }
}
