"use client";

import { useState } from "react";
import clsx from "clsx";
import { ChatWidget } from "@/components/site/chat-widget";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import type { CommunicationSettings } from "@/types";

export function ContactWidget({
  communication,
  contactEmail,
}: {
  communication: CommunicationSettings;
  contactEmail: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  if (!communication.popupEnabled) return null;

  const whatsappUrl = communication.whatsappNumber
    ? buildWhatsappUrl(
        communication.whatsappNumber,
        "Hi Neo Vision Team, I'd like to talk about a project."
      )
    : null;

  return (
    <>
      <ChatWidget
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        chatEnabled={communication.chatEnabled}
        onUnreadChange={setUnreadCount}
      />

      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:right-6">
        {menuOpen && (
          <div className="w-64 overflow-hidden rounded-2xl border border-stone-200 bg-white p-2 shadow-2xl">
            <p className="px-3 py-2 text-sm font-semibold text-stone-900">Contact Neo Vision</p>
            <div className="flex flex-col gap-0.5">
              {communication.chatEnabled && (
                <button
                  type="button"
                  onClick={() => {
                    setChatOpen(true);
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  <span aria-hidden>💬</span> Chat with us
                </button>
              )}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  <span aria-hidden>🟢</span> WhatsApp
                </a>
              )}
              <a
                href={`mailto:${contactEmail}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                <span aria-hidden>✉️</span> Email
              </a>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setMenuOpen((v) => !v);
            if (chatOpen) setChatOpen(false);
          }}
          aria-label="Contact us"
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-stone-900 text-xl text-white shadow-xl transition hover:bg-amber-600"
        >
          {menuOpen ? "✕" : "💬"}
          {!menuOpen && unreadCount > 0 && (
            <span
              className={clsx(
                "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white"
              )}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>
    </>
  );
}
