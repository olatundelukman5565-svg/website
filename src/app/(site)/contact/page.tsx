import type { Metadata } from "next";
import { listCategories } from "@/lib/data/categories";
import { getSiteContent } from "@/lib/data/site-content";
import { ContactForm } from "@/components/site/contact-form";
import { buildWhatsappUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Neo Vision Team about your architecture or 3D visualization project.",
};

export default async function ContactPage() {
  const [categories, content] = await Promise.all([listCategories(), getSiteContent()]);
  const { contact, communication } = content;
  const topLevel = categories.filter((c) => !c.parentId);
  const whatsappUrl = communication.whatsappNumber
    ? buildWhatsappUrl(communication.whatsappNumber, "Hi Neo Vision Team, I'd like to talk about a project.")
    : null;

  return (
    <div>
      <section className="bg-stone-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">Contact</p>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Let&apos;s talk about your project</h1>
          <p className="mt-4 max-w-2xl text-stone-300">
            Tell us what you&apos;re working on — a drawing set, a full 3D visualization, or a custom
            asset — and we&apos;ll follow up shortly.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ContactForm categories={topLevel} />
          </div>
          <aside className="space-y-8">
            {(whatsappUrl || communication.chatEnabled) && (
              <div className="rounded-2xl border border-stone-200 p-6">
                <h2 className="font-display text-lg font-semibold text-stone-900">Prefer to chat?</h2>
                <p className="mt-1 text-sm text-stone-500">
                  Reach us instantly instead of waiting on an email reply.
                </p>
                <div className="mt-4 flex flex-col gap-2.5">
                  {communication.chatEnabled && (
                    <p className="rounded-full border border-stone-200 px-5 py-2.5 text-center text-sm font-medium text-stone-600">
                      💬 Use the chat button in the corner of your screen
                    </p>
                  )}
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
                    >
                      🟢 Chat on WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}
            <div className="rounded-2xl border border-stone-200 p-6">
              <h2 className="font-display text-lg font-semibold text-stone-900">Contact information</h2>
              <dl className="mt-4 space-y-3 text-sm text-stone-600">
                <div>
                  <dt className="text-stone-400">Email</dt>
                  <dd className="font-medium">{contact.email}</dd>
                </div>
                <div>
                  <dt className="text-stone-400">Phone</dt>
                  <dd className="font-medium">{contact.phone}</dd>
                </div>
                <div>
                  <dt className="text-stone-400">Address</dt>
                  <dd className="font-medium">{contact.address}</dd>
                </div>
                {contact.hours && (
                  <div>
                    <dt className="text-stone-400">Hours</dt>
                    <dd className="font-medium">{contact.hours}</dd>
                  </div>
                )}
              </dl>
            </div>
            {contact.social.length > 0 && (
              <div className="rounded-2xl border border-stone-200 p-6">
                <h2 className="font-display text-lg font-semibold text-stone-900">Follow us</h2>
                <div className="mt-4 flex flex-col gap-2">
                  {contact.social.map((s) => (
                    <a
                      key={s.label}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-amber-600 hover:underline"
                    >
                      {s.label} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}
