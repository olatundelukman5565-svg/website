"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth";
import clsx from "clsx";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/settings", label: "Site content" },
];

export function AdminSidebar({ unreadCount }: { unreadCount: number }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-stone-800 bg-stone-950 md:h-screen md:w-60 md:border-b-0 md:border-r">
      <div className="px-5 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">Neo Vision</p>
        <p className="text-sm text-stone-400">Admin dashboard</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {LINKS.map((link) => {
          const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-amber-500/10 text-amber-400"
                  : "text-stone-400 hover:bg-stone-900 hover:text-stone-100"
              )}
            >
              {link.label}
              {link.href === "/admin/messages" && unreadCount > 0 && (
                <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-xs font-semibold text-stone-950">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-stone-800 p-3">
        <Link
          href="/"
          target="_blank"
          className="block rounded-md px-3 py-2 text-sm text-stone-400 hover:bg-stone-900 hover:text-stone-100"
        >
          View website ↗
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm text-stone-400 hover:bg-stone-900 hover:text-stone-100"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
