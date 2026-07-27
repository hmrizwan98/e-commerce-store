"use server";

import { adminDb, serverTimestamp } from "@/lib/firebase/admin";

export interface ContactFormInput {
  name: string;
  email: string;
  message: string;
}

export async function submitContactForm(
  input: ContactFormInput
): Promise<{ ok: boolean; message: string }> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const message = input.message.trim();

  if (!name || !email.includes("@") || !message) {
    return { ok: false, message: "Please fill in your name, a valid email, and a message." };
  }

  await adminDb().collection("contactSubmissions").add({
    name,
    email,
    message,
    createdAt: serverTimestamp(),
  });

  return { ok: true, message: "Thanks for reaching out! We'll get back to you soon." };
}
