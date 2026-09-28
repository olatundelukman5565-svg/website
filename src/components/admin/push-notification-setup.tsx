"use client";

import { useEffect, useState } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { getMessagingClient, isPushConfigured, serviceWorkerUrl, VAPID_KEY } from "@/lib/firebase-client";
import { registerPushTokenAction } from "@/lib/actions/push";

const DISMISSED_KEY = "nv_push_prompt_dismissed";

export function PushNotificationSetup() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"idle" | "requesting" | "enabled" | "error">("idle");

  useEffect(() => {
    if (!isPushConfigured()) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "default") return;
    try {
      if (localStorage.getItem(DISMISSED_KEY) === "1") return;
    } catch {
      // ignore
    }
    // Reading Notification.permission and localStorage requires the browser APIs
    // this effect synchronizes with; there's no server-renderable equivalent.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!isPushConfigured()) return;
    if (typeof window === "undefined" || Notification.permission !== "granted") return;

    let unsubscribe: (() => void) | undefined;
    navigator.serviceWorker
      .register(serviceWorkerUrl(), { scope: "/admin/" })
      .then(() => getMessagingClient())
      .then((messaging) => {
        if (!messaging) return;
        unsubscribe = onMessage(messaging, (payload) => {
          const title = payload.notification?.title || "New message";
          const body = payload.notification?.body || "";
          try {
            new Notification(title, { body, icon: "/icons/admin-192.png" });
          } catch {
            // ignore
          }
        });
      })
      .catch(() => {});

    return () => unsubscribe?.();
  }, []);

  async function enable() {
    setStatus("requesting");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus("error");
        setVisible(false);
        return;
      }
      const registration = await navigator.serviceWorker.register(serviceWorkerUrl(), { scope: "/admin/" });
      await navigator.serviceWorker.ready;
      const messaging = await getMessagingClient();
      if (!messaging || !VAPID_KEY) {
        setStatus("error");
        return;
      }
      const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
      if (token) {
        await registerPushTokenAction(token);
        setStatus("enabled");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
    setVisible(false);
  }

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // ignore
    }
  }

  if (!visible) return null;

  return (
    <div className="flex items-center justify-between gap-4 bg-amber-500 px-4 py-2.5 text-sm font-medium text-stone-950 md:px-6">
      <span>Turn on notifications so you know the moment a visitor messages you.</span>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={enable}
          disabled={status === "requesting"}
          className="rounded-full bg-stone-950 px-4 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
        >
          {status === "requesting" ? "Enabling…" : "Enable notifications"}
        </button>
        <button type="button" onClick={dismiss} className="text-xs font-medium text-stone-900/70 hover:text-stone-950">
          Not now
        </button>
      </div>
    </div>
  );
}
