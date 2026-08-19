"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { Category } from "@/types";

export function Navbar({ categories }: { categories: Category[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const pathname = usePathname();
  const topLevel = categories.filter((c) => !c.parentId);

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={clsx(
        "text-sm font-medium transition-colors hover:text-amber-600",
        pathname === href ? "text-amber-600" : "text-stone-700"
      )}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="font-display text-xl font-semibold tracking-tight text-stone-900">
            Neo Vision Team
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-amber-600">
            Architecture · 3D Studio
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLink("/", "Home")}
          {navLink("/about", "About")}

          <div
            className="relative"
            onMouseEnter={() => setPortfolioOpen(true)}
            onMouseLeave={() => setPortfolioOpen(false)}
          >
            <Link
              href="/portfolio"
              className={clsx(
                "text-sm font-medium transition-colors hover:text-amber-600",
                pathname.startsWith("/portfolio") ? "text-amber-600" : "text-stone-700"
              )}
            >
              Portfolio
            </Link>
            {portfolioOpen && topLevel.length > 0 && (
              <div className="absolute left-1/2 top-full w-72 -translate-x-1/2 pt-3">
                <div className="rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
                  {topLevel.map((c) => (
                    <Link
                      key={c.id}
                      href={`/portfolio/${c.slug}`}
                      className="block rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-amber-600"
                    >
                      {c.shortName || c.name}
                    </Link>
                  ))}
                  <Link
                    href="/portfolio"
                    className="mt-1 block rounded-lg border-t border-stone-100 px-3 py-2 text-sm font-medium text-amber-600 hover:bg-stone-50"
                  >
                    View all categories →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {navLink("/live-chat", "Live Chat")}
          {navLink("/contact", "Contact")}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/contact"
            className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-amber-600"
          >
            Start a project
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 md:hidden"
          aria-label="Toggle menu"
        >
          <span className="sr-only">Menu</span>
          <div className="space-y-1">
            <span className="block h-0.5 w-5 bg-stone-900" />
            <span className="block h-0.5 w-5 bg-stone-900" />
            <span className="block h-0.5 w-5 bg-stone-900" />
          </div>
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-stone-200 bg-white px-4 pb-6 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            <Link href="/" className="rounded-md px-2 py-2.5 text-sm font-medium text-stone-700" onClick={() => setMobileOpen(false)}>
              Home
            </Link>
            <Link href="/about" className="rounded-md px-2 py-2.5 text-sm font-medium text-stone-700" onClick={() => setMobileOpen(false)}>
              About
            </Link>
            <Link href="/portfolio" className="rounded-md px-2 py-2.5 text-sm font-medium text-stone-700" onClick={() => setMobileOpen(false)}>
              Portfolio
            </Link>
            <div className="ml-3 flex flex-col gap-1 border-l border-stone-200 pl-3">
              {topLevel.map((c) => (
                <Link
                  key={c.id}
                  href={`/portfolio/${c.slug}`}
                  className="rounded-md px-2 py-2 text-sm text-stone-500"
                  onClick={() => setMobileOpen(false)}
                >
                  {c.shortName || c.name}
                </Link>
              ))}
            </div>
            <Link href="/live-chat" className="rounded-md px-2 py-2.5 text-sm font-medium text-stone-700" onClick={() => setMobileOpen(false)}>
              Live Chat
            </Link>
            <Link href="/contact" className="rounded-md px-2 py-2.5 text-sm font-medium text-stone-700" onClick={() => setMobileOpen(false)}>
              Contact
            </Link>
            <Link
              href="/contact"
              className="mt-3 rounded-full bg-stone-900 px-5 py-2.5 text-center text-sm font-medium text-white"
              onClick={() => setMobileOpen(false)}
            >
              Start a project
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
