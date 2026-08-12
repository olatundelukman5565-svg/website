import { listMessages } from "@/lib/data/messages";
import { MessageActions } from "@/components/admin/message-actions";
import { format } from "date-fns";

export default async function AdminMessagesPage() {
  const messages = await listMessages();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">Contact messages</h1>
      <p className="mt-1 text-stone-500">Submissions from the website contact form.</p>

      <div className="mt-6 space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-xl border bg-white p-5 ${m.read ? "border-stone-200" : "border-amber-300"}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-stone-900">
                  {m.subject}
                  {!m.read && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      New
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-sm text-stone-500">
                  {m.name} · {m.email}
                  {m.service && <> · {m.service}</>}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-400">{format(new Date(m.createdAt), "MMM d, yyyy p")}</span>
                <MessageActions id={m.id} read={m.read} />
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-stone-700">{m.message}</p>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-400">
            No messages yet.
          </div>
        )}
      </div>
    </div>
  );
}
