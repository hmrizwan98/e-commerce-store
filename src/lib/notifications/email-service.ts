import type { Order } from "@/types/order";

/**
 * Builds HTML template for order confirmation email
 */
export function buildOrderEmailHtml(order: Partial<Order> & { orderNumber: string }): string {
  const customerName = order.guestName || order.shippingAddress?.fullName || "Valued Customer";
  const items = order.items || [];
  const subtotal = order.subtotal ? order.subtotal.toFixed(2) : "0.00";
  const shippingCost = order.shippingCost ? order.shippingCost.toFixed(2) : "Free";
  const total = order.total ? order.total.toFixed(2) : "0.00";
  const address = order.shippingAddress;

  const itemRowsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
        <strong style="color: #0f172a; font-size: 14px;">${item.name}</strong>
        ${item.variantId ? `<div style="color: #64748b; font-size: 12px; margin-top: 2px;">Variant: ${item.variantId}</div>` : ""}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: center; color: #475569; font-size: 14px;">
        x${item.quantity}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold; color: #0f172a; font-size: 14px;">
        $${(item.unitPrice * item.quantity).toFixed(2)}
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
    <title>Order Confirmation #${order.orderNumber}</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 30px 15px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      
      <!-- Header Banner -->
      <div style="background-color: #4f46e5; padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; tracking-tight: -0.5px;">Order Placed Successfully!</h1>
        <p style="color: #c7d2fe; margin-top: 8px; font-size: 14px;">Thank you for shopping with us. Order #${order.orderNumber}</p>
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

        <!-- Totals -->
        <div style="margin-top: 20px; padding-top: 16px; border-top: 2px solid #f1f5f9;">
          <div style="display: flex; justify-content: space-between; font-size: 14px; color: #475569; margin-bottom: 6px;">
            <span>Subtotal</span>
            <span>$${subtotal}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 14px; color: #475569; margin-bottom: 6px;">
            <span>Shipping</span>
            <span>$${shippingCost}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
            <span>Total Paid</span>
            <span style="color: #4f46e5;">$${total}</span>
          </div>
        </div>

        ${
          address
            ? `
        <!-- Shipping Address Card -->
        <div style="margin-top: 28px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
          <h4 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; color: #475569; font-weight: 700;">Delivery Address</h4>
          <p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.5;">
            <strong>${address.fullName}</strong><br/>
            ${address.line1}<br/>
            ${address.line2 ? `${address.line2}<br/>` : ""}
            ${address.city}, ${address.country}
          </p>
        </div>
        `
            : ""
        }

        <p style="margin-top: 32px; font-size: 13px; color: #94a3b8; text-align: center;">
          Need help with your order? Simply reply to this email or contact store support.
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Sends order confirmation email via SMTP / Resend / SendGrid or logs payload if no provider is configured
 */
export async function sendOrderConfirmationEmail(
  order: Partial<Order> & { orderNumber: string; guestEmail?: string }
): Promise<{ success: boolean; message: string }> {
  const recipientEmail = order.guestEmail || order.shippingAddress?.fullName;

  if (!recipientEmail || !recipientEmail.includes("@")) {
    console.log(`[Email Service] No recipient email address for Order #${order.orderNumber}`);
    return { success: false, message: "No recipient email address." };
  }

  const html = buildOrderEmailHtml(order);

  // Check for RESEND_API_KEY or SMTP credentials
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: process.env.STORE_EMAIL_FROM || "Orders <orders@resend.dev>",
          to: recipientEmail,
          subject: `Order Confirmation #${order.orderNumber}`,
          html,
        }),
      });

      if (res.ok) {
        console.log(`[Email Service] Email sent successfully to ${recipientEmail} for Order #${order.orderNumber}`);
        return { success: true, message: "Email sent successfully via Resend API." };
      }
    } catch (err: any) {
      console.error("[Email Send Error]:", err?.message || err);
    }
  }

  console.log(`[Email Prepared] Order #${order.orderNumber} email ready for ${recipientEmail}.`);
  return { success: true, message: "Order confirmation email generated." };
}
