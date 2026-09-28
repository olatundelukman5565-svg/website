"use client";

import { useEffect, useState } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { getMessagingClient, isPushConfigured, serviceWorkerUrl, VAPID_KEY } from "@/lib/firebase-client";
import { registerPushTokenAction } from "@/lib/actions/push";

const DISMISSED_KEY = "nv_push_prompt_dismissed";

type Status = "idle" | "requesting" | "enabled" | "denied" | "error";

export function PushNotificationSetup() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  useEffect(() => {
    if (!isPushConfigured()) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "denied") {
      // Reflecting the browser's already-decided permission state; no server-renderable equivalent.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("denied");
      setVisible(true);
      return;
    }
    if (Notification.permission !== "default") return;
    try {
      if (localStorage.getItem(DISMISSED_KEY) === "1") return;
    } catch {
      // ignore
    }
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
    setErrorDetail(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "denied") {
        setStatus("denied");
        return;
      }
      if (permission !== "granted") {
        setStatus("idle");
        return;
      }
      const registration = await navigator.serviceWorker.register(serviceWorkerUrl(), { scope: "/admin/" });
      await navigator.serviceWorker.ready;
      const messaging = await getMessagingClient();
      if (!messaging) {
        setStatus("error");
        setErrorDetail("Push notifications aren't supported in this browser.");
        return;
      }
      if (!VAPID_KEY) {
        setStatus("error");
        setErrorDetail("Missing VAPID key configuration.");
        return;
      }
      const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration });
      if (token) {
        await registerPushTokenAction(token);
        setStatus("enabled");
      } else {
        setStatus("error");
        setErrorDetail("Could not get a device token from Firebase.");
      }
    } catch (err) {
      setStatus("error");
      setErrorDetail(err instanceof Error ? err.message : String(err));
    }
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

  if (status === "enabled") {
    return (
      <div className="flex items-center justify-between gap-4 bg-emerald-500 px-4 py-2.5 text-sm font-medium text-stone-950 md:px-6">
        <span>Notifications are on — you&apos;ll be alerted when a visitor messages you.</span>
        <button type="button" onClick={() => setVisible(false)} className="text-xs font-semibold hover:underline">
          Dismiss
        </button>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 bg-red-100 px-4 py-2.5 text-sm font-medium text-red-800 md:px-6">
        <span>
          Notifications are blocked for this site in your browser. Open your browser&apos;s site settings for this
          page, set Notifications to &quot;Allow&quot;, then reload.
        </span>
        <button type="button" onClick={dismiss} className="text-xs font-semibold hover:underline">
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 bg-amber-500 px-4 py-2.5 text-sm font-medium text-stone-950 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span>Turn on notifications so you know the moment a visitor messages you.</span>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={enable}
            disabled={status === "requesting"}
            className="rounded-full bg-stone-950 px-4 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
          >
            {status === "requesting" ? "Enabling…" : status === "error" ? "Try again" : "Enable notifications"}
          </button>
          <button type="button" onClick={dismiss} className="text-xs font-medium text-stone-900/70 hover:text-stone-950">
            Not now
          </button>
        </div>
      </div>
      {status === "error" && errorDetail && (
        <p className="text-xs font-normal text-stone-900/80">Couldn&apos;t enable notifications: {errorDetail}</p>
      )}
    </div>
  );
}
