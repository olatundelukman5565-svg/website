"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import type { Category } from "@/types";

function DivisionDropdown({
  label,
  slug,
  subcategories,
  pathname,
}: {
  label: string;
  slug: string;
  subcategories: Category[];
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const href = `/${slug}`;

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Link
        href={href}
        className={clsx(
          "text-sm font-medium transition-colors hover:text-amber-600",
          pathname.startsWith(href) ? "text-amber-600" : "text-stone-700"
        )}
      >
        {label}
      </Link>
      {open && subcategories.length > 0 && (
        <div className="absolute left-1/2 top-full w-72 -translate-x-1/2 pt-3">
          <div className="rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
            {subcategories.map((sc) => (
              <Link
                key={sc.id}
                href={`${href}/${sc.slug}`}
                className="block rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 hover:text-amber-600"
              >
                {sc.shortName || sc.name}
              </Link>
            ))}
            <Link
              href={href}
              className="mt-1 block rounded-lg border-t border-stone-100 px-3 py-2 text-sm font-medium text-amber-600 hover:bg-stone-50"
            >
              View all {label} work →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileAccordionSection({
  label,
  slug,
  subcategories,
  onNavigate,
}: {
  label: string;
  slug: string;
  subcategories: Category[];
  onNavigate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const href = `/${slug}`;

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link
          href={href}
          className="flex-1 rounded-md px-2 py-2.5 text-sm font-medium text-stone-700"
          onClick={onNavigate}
        >
          {label}
        </Link>
        {subcategories.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={`Toggle ${label} subcategories`}
            className="flex h-8 w-8 items-center justify-center text-stone-400"
          >
            {expanded ? "−" : "+"}
          </button>
        )}
      </div>
      {expanded && (
        <div className="ml-3 flex flex-col gap-1 border-l border-stone-200 pl-3">
          {subcategories.map((sc) => (
            <Link
              key={sc.id}
              href={`${href}/${sc.slug}`}
              className="rounded-md px-2 py-2 text-sm text-stone-500"
              onClick={onNavigate}
            >
              {sc.shortName || sc.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Navbar({ categories }: { categories: Category[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const twoD = categories.find((c) => c.slug === "2d" && !c.parentId && c.enabled);
  const threeDModel = categories.find((c) => c.slug === "3d-model" && !c.parentId && c.enabled);
  const twoDSubs = twoD ? categories.filter((c) => c.parentId === twoD.id && c.enabled) : [];
  const threeDSubs = threeDModel ? categories.filter((c) => c.parentId === threeDModel.id && c.enabled) : [];

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
          {twoD && (
            <DivisionDropdown label="2D" slug="2d" subcategories={twoDSubs} pathname={pathname} />
          )}
          {threeDModel && (
            <DivisionDropdown
              label="3D Model"
              slug="3d-model"
              subcategories={threeDSubs}
              pathname={pathname}
            />
          )}
          {navLink("/portfolio", "Portfolio")}
          {navLink("/about", "About")}
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
            {twoD && (
              <MobileAccordionSection
                label="2D"
                slug="2d"
                subcategories={twoDSubs}
                onNavigate={() => setMobileOpen(false)}
              />
            )}
            {threeDModel && (
              <MobileAccordionSection
                label="3D Model"
                slug="3d-model"
                subcategories={threeDSubs}
                onNavigate={() => setMobileOpen(false)}
              />
            )}
            <Link href="/portfolio" className="rounded-md px-2 py-2.5 text-sm font-medium text-stone-700" onClick={() => setMobileOpen(false)}>
              Portfolio
            </Link>
            <Link href="/about" className="rounded-md px-2 py-2.5 text-sm font-medium text-stone-700" onClick={() => setMobileOpen(false)}>
              About
            </Link>
            <Link href="/contact" className="rounded-md px-2 py-2.5 text-sm font-medium text-stone-700" onClick={() => setMobileOpen(false)}>
              Contact
            </Link>
            <Link href="/live-chat" className="rounded-md px-2 py-2.5 text-sm font-medium text-stone-700" onClick={() => setMobileOpen(false)}>
              Live Chat
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
