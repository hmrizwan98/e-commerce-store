/** Storefront contact form rules - pure, shared by the form action and the tests. */
export const CONTACT_LIMITS = { name: 100, email: 254, message: 5000 } as const;
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

export type ContactInputCheck =
  | { ok: true; value: { name: string; email: string; message: string } }
  | { ok: false; error: string };

export function validateContactInput(input: { name?: unknown; email?: unknown; message?: unknown }): ContactInputCheck {
  const name = String(input.name ?? "").replace(/[\r\n]+/g, " ").trim();
  const email = String(input.email ?? "").trim().toLowerCase();
  const message = String(input.message ?? "").trim();
  if (!name || !EMAIL.test(email) || !message) return { ok: false, error: "Please fill in your name, a valid email, and a message." };
  if (name.length > CONTACT_LIMITS.name) return { ok: false, error: `Name must be ${CONTACT_LIMITS.name} characters or fewer.` };
  if (email.length > CONTACT_LIMITS.email) return { ok: false, error: "That email address is too long." };
  if (message.length > CONTACT_LIMITS.message) return { ok: false, error: `Message must be ${CONTACT_LIMITS.message} characters or fewer.` };
  return { ok: true, value: { name, email, message } };
}

/** Safe "Reply by email" link - every part URL-encoded, the address re-validated. */
export function contactReplyHref(email: string, storeName: string): string | null {
  if (!EMAIL.test(email) || email.length > CONTACT_LIMITS.email) return null;
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`Re: your message to ${storeName}`)}`;
}
