import type { Metadata } from "next";
import { getBuyerChatSettings } from "@/lib/actions/chat";
import { LiveChatPage } from "@/components/site/live-chat-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Live Chat",
  description: "Chat directly with the Neo Vision Team about your architecture or 3D project.",
};

export default async function LiveChatRoute() {
  const settings = await getBuyerChatSettings();

  return (
    <div>
      <section className="bg-stone-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">Live Chat</p>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Chat with Neo Vision Team</h1>
          <p className="mt-4 max-w-2xl text-stone-300">
            {settings.chatEnabled
              ? "Tell us about your project and share drawings, images, or files directly — no account needed."
              : "Live chat is currently unavailable. Please reach out via email or WhatsApp on the Contact page."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <LiveChatPage chatEnabled={settings.chatEnabled} />
      </section>
    </div>
  );
}
