"use server";

import { requireAdmin } from "@/lib/auth";
import { saveAdminPushToken, removeAdminPushToken } from "@/lib/data/push-tokens";

export async function registerPushTokenAction(token: string): Promise<void> {
  await requireAdmin();
  await saveAdminPushToken(token);
}

export async function unregisterPushTokenAction(token: string): Promise<void> {
  await requireAdmin();
  await removeAdminPushToken(token);
}
