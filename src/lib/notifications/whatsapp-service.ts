import { getGeneralSettings } from "@/lib/firebase/repositories/site-settings";
import type { Order } from "@/types/order";

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

export interface SendWhatsAppResult {
  success: boolean;
  message: string;
  waLink: string;
}

/**
 * Builds standard WhatsApp message text based on order event type
 */
export function buildWhatsAppMessageText(
  type: WhatsAppNotificationType,
  order: Partial<Order> & { orderNumber: string }
): string {
  const customerName = order.guestName || order.shippingAddress?.fullName || "Valued Customer";
  const orderNum = order.orderNumber;
  const totalAmount = order.total ? order.total.toFixed(2) : "0.00";
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

💰 *Total Amount:* $${totalAmount}
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
      const trackingPageLink = order.guestEmail
        ? `\n\n🔍 *Track your order live on our store:* \nhttps://yourstore.com/order-tracking?orderNumber=${encodeURIComponent(orderNum)}&email=${encodeURIComponent(order.guestEmail)}`
        : "";

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
 * Sends automated WhatsApp notification via WhatsApp Cloud API / UltraMsg / Gateway API
 * AND generates direct wa.me link for manual admin fallback.
 */
export async function sendWhatsAppNotification(
  type: WhatsAppNotificationType,
  order: Partial<Order> & { orderNumber: string; shippingAddress?: any }
): Promise<SendWhatsAppResult> {
  const rawPhone = order.shippingAddress?.phone || (order as any).guestPhone || "";
  const phone = formatPhoneNumber(rawPhone);
  const messageText = buildWhatsAppMessageText(type, order);
  const encodedText = encodeURIComponent(messageText);
  const waLink = phone ? `https://wa.me/${phone}?text=${encodedText}` : "";

  if (!phone) {
    return {
      success: false,
      message: "No phone number provided for WhatsApp notification.",
      waLink: "",
    };
  }

  // Check for environment keys for automated gateway (WhatsApp Cloud API / UltraMsg / GreenAPI / Twilio)
  const apiUrl = process.env.WHATSAPP_API_URL; // e.g. https://graph.facebook.com/v18.0/PHONE_NUMBER_ID/messages or UltraMsg endpoint
  const apiToken = process.env.WHATSAPP_API_TOKEN;

  if (apiUrl && apiToken) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "text",
          text: { body: messageText },
        }),
      });

      if (response.ok) {
        console.log(`[WhatsApp] Sent ${type} notification to ${phone} for Order #${order.orderNumber}`);
        return { success: true, message: "WhatsApp message sent successfully via Gateway API.", waLink };
      } else {
        const errorBody = await response.text();
        console.warn(`[WhatsApp API Warning] Gateway returned status ${response.status}:`, errorBody);
      }
    } catch (err: any) {
      console.error("[WhatsApp Send Error]:", err?.message || err);
    }
  }

  // Fallback: log link for click-to-chat
  console.log(`[WhatsApp Link Ready] For Order #${order.orderNumber} -> ${waLink}`);
  return {
    success: true,
    message: "WhatsApp Click-to-Chat link generated.",
    waLink,
  };
}
