import Link from "next/link";
import type { Category } from "@/types";

/** Renders a primary pillar's ("2D" or "3D Model") landing page: intro + its subcategory cards. */
export function DivisionLanding({
  division,
  subcategories,
  accent,
}: {
  division: Category;
  subcategories: Category[];
  /** Tailwind color token used for the hero eyebrow + accent touches, so 2D and 3D Model read as distinct. */
  accent: "amber" | "emerald";
}) {
  const accentText = accent === "amber" ? "text-amber-500" : "text-emerald-500";
  const accentHover = accent === "amber" ? "hover:text-amber-600" : "hover:text-emerald-600";
  const accentBorder = accent === "amber" ? "hover:border-amber-400" : "hover:border-emerald-400";

  return (
    <div>
      <section className="bg-stone-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm text-stone-400">
            <Link href="/portfolio" className="hover:text-amber-400">
              Portfolio
            </Link>
            <span>/</span>
            <span className="text-stone-200">{division.name}</span>
          </div>
          <p className={`mt-4 text-xs font-semibold uppercase tracking-[0.3em] ${accentText}`}>
            Primary division
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">{division.name}</h1>
          <p className="mt-4 max-w-2xl text-stone-300">{division.intro}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {subcategories.map((sc) => (
            <div
              key={sc.id}
              className={`flex flex-col justify-between rounded-2xl border border-stone-200 p-8 transition hover:shadow-lg ${accentBorder}`}
            >
              <div>
                <h2 className="font-display text-xl font-semibold text-stone-900">{sc.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-stone-500">{sc.description}</p>
                {sc.capabilities.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {sc.capabilities.slice(0, 4).map((cap) => (
                      <span
                        key={cap}
                        className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-600"
                      >
                        {cap}
                      </span>
                    ))}
                    {sc.capabilities.length > 4 && (
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-500">
                        +{sc.capabilities.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
              <Link
                href={`/${division.slug}/${sc.slug}`}
                className={`mt-6 inline-block text-sm font-semibold text-stone-900 ${accentHover}`}
              >
                Explore {sc.shortName || sc.name} →
              </Link>
            </div>
          ))}
          {subcategories.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-stone-300 p-16 text-center">
              <p className="font-display text-xl text-stone-400">Subcategories coming soon.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
