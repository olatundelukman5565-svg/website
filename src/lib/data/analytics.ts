import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

const SUMMARY_DOC = { collection: "analytics", doc: "summary" };
const DAILY_COLLECTION = "analyticsDaily";

export interface CountryCount {
  code: string;
  count: number;
}

export interface AnalyticsSummary {
  totalVisits: number;
  totalVisitors: number;
  countries: CountryCount[];
}

export interface DailyVisits {
  date: string;
  visits: number;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function sortedCountries(raw: Record<string, number> | undefined): CountryCount[] {
  return Object.entries(raw ?? {})
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);
}

export async function recordVisit(input: { country: string; isNewVisitor: boolean }): Promise<void> {
  const country = input.country || "XX";
  const dateKey = todayKey();

  const summaryRef = adminDb.collection(SUMMARY_DOC.collection).doc(SUMMARY_DOC.doc);
  const dailyRef = adminDb.collection(DAILY_COLLECTION).doc(dateKey);

  const countries = { [country]: FieldValue.increment(1) };

  await Promise.all([
    summaryRef.set(
      {
        totalVisits: FieldValue.increment(1),
        ...(input.isNewVisitor ? { totalVisitors: FieldValue.increment(1) } : {}),
        countries,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    ),
    dailyRef.set(
      {
        date: dateKey,
        visits: FieldValue.increment(1),
        ...(input.isNewVisitor ? { visitors: FieldValue.increment(1) } : {}),
        countries,
      },
      { merge: true }
    ),
  ]);
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const doc = await adminDb.collection(SUMMARY_DOC.collection).doc(SUMMARY_DOC.doc).get();
  if (!doc.exists) return { totalVisits: 0, totalVisitors: 0, countries: [] };
  const data = doc.data()!;
  return {
    totalVisits: data.totalVisits ?? 0,
    totalVisitors: data.totalVisitors ?? 0,
    countries: sortedCountries(data.countries),
  };
}

export async function getDailyVisits(days = 30): Promise<DailyVisits[]> {
  const snap = await adminDb
    .collection(DAILY_COLLECTION)
    .orderBy("date", "desc")
    .limit(days)
    .get();
  return snap.docs
    .map((d) => ({ date: d.data().date as string, visits: (d.data().visits as number) ?? 0 }))
    .reverse();
}
