/**
 * What each Settings → Notifications channel and Email Template can REALLY do - pure, shared
 * by the Settings UI and the tests. Only booleans about the platform setup reach the browser;
 * never keys or URLs.
 */
export type ChannelKey = "email" | "push" | "sms" | "whatsapp";
export interface PlatformChannels {
  /** An email provider (Resend) is configured on the platform. */
  emailProvider: boolean;
  /** An automated WhatsApp gateway is configured on the platform. */
  whatsappGateway: boolean;
}

export interface ChannelInfo {
  key: ChannelKey;
  label: string;
  /** The toggle changes real behaviour. False = shown disabled as "Not available". */
  implemented: boolean;
  /** Implemented but the platform has no provider - toggle kept, with a clear warning. */
  configured: boolean;
  description: string;
}

export function describeChannels(p: PlatformChannels): ChannelInfo[] {
  return [
    {
      key: "email",
      label: "Email Notifications",
      implemented: true,
      configured: p.emailProvider,
      description: p.emailProvider
        ? "Order confirmation email to the customer after checkout. Also needs Email Templates → Order Confirmation turned on."
        : "No email provider is configured on this platform, so no emails are sent even when this is on.",
    },
    {
      key: "push",
      label: "Push Notifications",
      implemented: false,
      configured: false,
      description: "Not available - browser push notifications aren't built yet. New orders already appear (with sound) in this Admin while it is open.",
    },
    {
      key: "sms",
      label: "SMS Notifications",
      implemented: false,
      configured: false,
      description: "Not available - no SMS provider is connected to Webriiz.",
    },
    {
      key: "whatsapp",
      label: "WhatsApp Alerts",
      implemented: true,
      configured: p.whatsappGateway,
      description: p.whatsappGateway
        ? "Automatic WhatsApp message to the customer when an order is placed, confirmed, dispatched and delivered."
        : "No WhatsApp gateway is configured on this platform, so nothing is sent automatically even when this is on. Use the WhatsApp buttons on each order to message customers yourself.",
    },
  ];
}

export type TemplateKey = "welcome" | "orderConfirmation" | "passwordReset" | "contact" | "newsletter";

/** Only the order confirmation email is actually sent by stores today. */
export const TEMPLATE_SUPPORT: Record<TemplateKey, { label: string; supported: boolean; note: string }> = {
  orderConfirmation: {
    label: "Order Confirmation Email",
    supported: true,
    note: "Used for every order confirmation email. You can use {{storeName}} and {{orderNumber}} in the subject.",
  },
  welcome: { label: "Welcome Email", supported: false, note: "Not available - stores don't send customer welcome emails yet. This setting has no effect." },
  passwordReset: { label: "Password Reset Email", supported: false, note: "Not available - password reset emails use the sign-in provider's own template. This setting has no effect." },
  contact: { label: "Contact Form Response", supported: false, note: "Not available - no automatic reply is sent; read and answer messages in Admin → Messages. This setting has no effect." },
  newsletter: { label: "Newsletter Subscription", supported: false, note: "Not available - no newsletter emails are sent yet. This setting has no effect." },
};
