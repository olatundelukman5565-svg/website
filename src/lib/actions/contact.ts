"use server";

import { createMessage } from "@/lib/data/messages";

export interface ContactFormState {
  error?: string;
  success?: boolean;
}

export async function submitContactAction(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();
  const service = String(formData.get("service") || "").trim() || null;

  if (!name || !email || !subject || !message) {
    return { error: "Please fill in all required fields." };
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  await createMessage({ name, email, subject, message, service });

  return { success: true };
}
