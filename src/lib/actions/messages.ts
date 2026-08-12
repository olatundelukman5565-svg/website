"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { deleteMessage, markMessageRead } from "@/lib/data/messages";

export async function markMessageReadAction(id: string, read: boolean) {
  await requireAdmin();
  await markMessageRead(id, read);
  revalidatePath("/admin/messages");
}

export async function deleteMessageAction(id: string) {
  await requireAdmin();
  await deleteMessage(id);
  revalidatePath("/admin/messages");
}
