import "server-only";
import { adminMessaging } from "@/lib/firebase-admin";
import { listAdminPushTokens, removeAdminPushToken } from "@/lib/data/push-tokens";

export async function notifyAdminsOfNewMessage(input: { title: string; body: string; link: string }): Promise<void> {
  const tokens = await listAdminPushTokens();
  if (tokens.length === 0) return;

  try {
    const result = await adminMessaging.sendEachForMulticast({
      tokens,
      notification: { title: input.title, body: input.body },
      webpush: {
        fcmOptions: { link: input.link },
        notification: { icon: "/icons/admin-192.png" },
      },
    });

    const stale: string[] = [];
    result.responses.forEach((res, i) => {
      if (!res.success && res.error) {
        const code = res.error.code;
        if (
          code === "messaging/registration-token-not-registered" ||
          code === "messaging/invalid-registration-token" ||
          code === "messaging/invalid-argument"
        ) {
          stale.push(tokens[i]);
        }
      }
    });
    await Promise.all(stale.map((token) => removeAdminPushToken(token)));
  } catch {
    // Push notifications are best-effort; the chat message itself already saved successfully.
  }
}
