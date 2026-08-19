import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { countUnreadMessages } from "@/lib/data/messages";
import { countUnreadChatAction } from "@/lib/actions/admin-chat";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [unreadCount, unreadChatCount] = await Promise.all([countUnreadMessages(), countUnreadChatAction()]);

  return (
    <div className="flex min-h-screen flex-col bg-stone-100 md:flex-row">
      <AdminSidebar unreadCount={unreadCount} unreadChatCount={unreadChatCount} />
      <main className="flex-1 overflow-x-hidden p-4 md:p-8">{children}</main>
    </div>
  );
}
