"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, signInWithPassword } from "@/lib/auth";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/admin");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    const idToken = await signInWithPassword(email, password);
    await createSession(idToken);
  } catch {
    return { error: "Invalid email or password, or this account does not have admin access." };
  }

  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}
