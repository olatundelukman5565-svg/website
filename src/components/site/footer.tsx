import Link from "next/link";
import type { Category, ContactInfo } from "@/types";

export function Footer({ categories, contact }: { categories: Category[]; contact: ContactInfo }) {
  const topLevel = categories.filter((c) => !c.parentId);

  return (
    <footer className="border-t border-stone-800 bg-stone-950 text-stone-400">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <p className="font-display text-lg font-semibold text-white">Neo Vision Team</p>
            <p className="mt-3 text-sm leading-relaxed">
              A digital architecture and 3D visualization studio — technical drawings, architectural
              visualization, and full-spectrum 3D modeling.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-stone-200">Studio</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-amber-400">About</Link></li>
              <li><Link href="/portfolio" className="hover:text-amber-400">Portfolio</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400">Contact</Link></li>
              <li><Link href="/admin/login" className="hover:text-amber-400">Admin</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-stone-200">Services</p>
            <ul className="mt-4 space-y-2 text-sm">
              {topLevel.map((c) => (
                <li key={c.id}>
                  <Link href={`/portfolio/${c.slug}`} className="hover:text-amber-400">
                    {c.shortName || c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-stone-200">Contact</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>{contact.email}</li>
              <li>{contact.phone}</li>
              <li>{contact.address}</li>
            </ul>
            {contact.social.length > 0 && (
              <div className="mt-4 flex gap-4">
                {contact.social.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:text-amber-400"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-stone-800 pt-8 text-xs text-stone-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Neo Vision Team. All rights reserved.</p>
          <p>Architecture · 3D Visualization · Digital Design</p>
        </div>
      </div>
    </footer>
  );
}
