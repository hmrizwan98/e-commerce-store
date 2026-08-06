"use server";

import { createBookDemoRequest } from "@/lib/firebase/repositories/book-demo-requests";

export interface BookDemoFormInput {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  storeType?: string;
  message?: string;
}

const MAX_MESSAGE_LENGTH = 2000;

export async function submitBookDemoRequest(
  input: BookDemoFormInput
): Promise<{ ok: boolean; message: string }> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const company = input.company?.trim();
  const phone = input.phone?.trim();
  const storeType = input.storeType?.trim();
  const message = input.message?.trim().slice(0, MAX_MESSAGE_LENGTH);

  if (!name || !email.includes("@") || !email.includes(".")) {
    return { ok: false, message: "Please fill in your name and a valid email address." };
  }

  await createBookDemoRequest({
    name,
    email,
    company: company || undefined,
    phone: phone || undefined,
    storeType: storeType || undefined,
    message: message || undefined,
  });

  return { ok: true, message: "Thanks! We've received your request and will be in touch shortly." };
}
