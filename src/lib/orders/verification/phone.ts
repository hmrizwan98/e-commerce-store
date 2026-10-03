/** Pure phone helpers for COD verification - no server/client-only imports, so the
 * engine, the admin card and the test script can all share them. */

export interface NormalizedPhone {
  /** E.164 with leading "+", e.g. "+923001234567" - empty when invalid. */
  international: string;
  /** Digits only, e.g. "923001234567" - the form wa.me/tel links expect. */
  digits: string;
  isValid: boolean;
  isPakistaniMobile: boolean;
}

const INVALID: NormalizedPhone = { international: "", digits: "", isValid: false, isPakistaniMobile: false };

/**
 * Normalizes Pakistani numbers in any common local/international form
 * (0300-1234567, 3001234567, 923001234567, +92 300 1234567, 0092300...) to +92XXXXXXXXXX.
 * A non-Pakistani number is only accepted when entered in explicit international
 * form ("+" or "00" prefix) - a bare local number from another country can't be
 * safely guessed, so it's reported invalid rather than given a wrong country code.
 */
export function normalizePhone(raw: string | undefined | null): NormalizedPhone {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return INVALID;
  const explicitInternational = trimmed.startsWith("+") || trimmed.startsWith("00");
  let digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);

  let national: string | null = null;
  if (digits.startsWith("92") && digits.length === 12) national = digits.slice(2);
  else if (!explicitInternational && digits.startsWith("0") && digits.length === 11) national = digits.slice(1);
  else if (!explicitInternational && digits.length === 10 && digits.startsWith("3")) national = digits;

  if (national) {
    // Pakistani mobiles are 3XX-XXXXXXX; landlines are also 10 national digits.
    if (!/^[1-9]\d{9}$/.test(national)) return INVALID;
    const full = `92${national}`;
    return { international: `+${full}`, digits: full, isValid: true, isPakistaniMobile: national.startsWith("3") };
  }

  if (explicitInternational && !digits.startsWith("92") && digits.length >= 8 && digits.length <= 15) {
    return { international: `+${digits}`, digits, isValid: true, isPakistaniMobile: false };
  }
  return INVALID;
}

/** The realistic spellings of one number in shippingAddress.phone (checkout stores the
 * free-text value as typed), for a single indexed `in` query instead of scanning orders.
 * Firestore bills an `in` query by matched documents, not by the number of values, so
 * these extra spellings add no reads - they only widen what can match. */
export function phoneQueryVariants(raw: string): string[] {
  const variants = new Set<string>();
  const trimmed = raw.trim();
  if (trimmed) variants.add(trimmed);
  const n = normalizePhone(raw);
  if (n.isValid && n.digits.startsWith("92") && n.digits.length === 12) {
    const national = n.digits.slice(2); // 3001234567
    const local = `0${national}`; // 03001234567
    [
      local, // 03001234567
      `${local.slice(0, 4)}-${local.slice(4)}`, // 0300-1234567
      `${local.slice(0, 4)} ${local.slice(4)}`, // 0300 1234567
      n.international, // +923001234567
      `+92 ${national.slice(0, 3)} ${national.slice(3)}`, // +92 300 1234567
      n.digits, // 923001234567
      national, // 3001234567
    ].forEach((v) => variants.add(v));
  } else if (n.isValid) {
    variants.add(n.international);
    variants.add(n.digits);
  }
  return Array.from(variants);
}

export interface VerificationWhatsAppInput {
  phone: string;
  customerName: string;
  storeName: string;
  orderNumber: string;
  amountLabel: string;
  address: string;
}

export function buildVerificationWhatsAppMessage(input: VerificationWhatsAppInput): string {
  return [
    `Assalam-o-Alaikum ${input.customerName},`,
    "",
    `Aap ne ${input.storeName} par Order #${input.orderNumber} place kiya hai.`,
    "",
    `Total: ${input.amountLabel}`,
    `Delivery Address: ${input.address}`,
    "",
    "Please confirm ke aap ye order receive karna chahte hain.",
    "",
    "Thank you.",
  ].join("\n");
}

/** Official free WhatsApp Click-to-Chat link (https://wa.me/<digits>?text=...). Opens a
 * chat only - replies are NOT received by Webriiz; the admin records the outcome
 * manually via Confirm/Reject. Returns null when the phone can't be normalized. */
export function buildVerificationWhatsAppLink(input: VerificationWhatsAppInput): string | null {
  const phone = normalizePhone(input.phone);
  if (!phone.isValid) return null;
  return `https://wa.me/${phone.digits}?text=${encodeURIComponent(buildVerificationWhatsAppMessage(input))}`;
}
