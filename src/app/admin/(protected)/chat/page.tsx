import { listAdminConversations } from "@/lib/actions/admin-chat";
import { ChatInbox } from "@/components/admin/chat-inbox";

export default async function AdminChatPage() {
  const conversations = await listAdminConversations(false);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-900">Live chat</h1>
      <p className="mt-1 text-stone-500">Private conversations started from the website chat widget.</p>
      <div className="mt-6">
        <ChatInbox initialConversations={conversations} />
      </div>
    </div>
  );
}
