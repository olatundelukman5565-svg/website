import { getAnalyticsSummary, getDailyVisits } from "@/lib/data/analytics";

export const dynamic = "force-dynamic";

function countryName(code: string): string {
  if (!code || code === "XX") return "Unknown";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export default async function AdminAnalyticsPage() {
  const [summary, daily] = await Promise.all([getAnalyticsSummary(), getDailyVisits(30)]);
  const topCountry = summary.countries[0];
  const maxDailyVisits = Math.max(1, ...daily.map((d) => d.visits));

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold text-stone-900">Visitor analytics</h1>
      <p className="mt-1 text-stone-500">
        How many people are visiting the site and which countries they&apos;re visiting from.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Total visits</p>
          <p className="mt-2 font-display text-3xl font-semibold text-stone-900">{summary.totalVisits}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Unique visitors</p>
          <p className="mt-2 font-display text-3xl font-semibold text-stone-900">{summary.totalVisitors}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Top country</p>
          <p className="mt-2 font-display text-3xl font-semibold text-stone-900">
            {topCountry ? countryName(topCountry.code) : "—"}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="font-semibold text-stone-900">Visits by country</h2>
        {summary.countries.length === 0 ? (
          <p className="mt-3 text-sm text-stone-400">No visits recorded yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {summary.countries.map((c) => {
              const pct = summary.totalVisits > 0 ? Math.round((c.count / summary.totalVisits) * 100) : 0;
              return (
                <div key={c.code}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-stone-700">{countryName(c.code)}</span>
                    <span className="text-stone-400">
                      {c.count} · {pct}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="font-semibold text-stone-900">Last 30 days</h2>
        {daily.length === 0 ? (
          <p className="mt-3 text-sm text-stone-400">No visits recorded yet.</p>
        ) : (
          <div className="mt-4 flex h-32 items-end gap-1">
            {daily.map((d) => (
              <div key={d.date} className="group relative flex h-full flex-1 items-end">
                <div
                  className="w-full rounded-t bg-amber-500/80 transition group-hover:bg-amber-500"
                  style={{ height: `${Math.max(4, (d.visits / maxDailyVisits) * 100)}%` }}
                />
                <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-stone-900 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                  {d.date}: {d.visits}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
