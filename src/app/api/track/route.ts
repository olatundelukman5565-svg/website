import { NextResponse, type NextRequest } from "next/server";
import { recordVisit } from "@/lib/data/analytics";

const VISITOR_COOKIE = "nv_vid";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function POST(request: NextRequest) {
  const country = request.headers.get("x-vercel-ip-country") || "XX";
  const existingVisitorId = request.cookies.get(VISITOR_COOKIE)?.value;
  const isNewVisitor = !existingVisitorId;

  try {
    await recordVisit({ country, isNewVisitor });
  } catch {
    // Analytics is best-effort; never break the page for a logging failure.
  }

  const response = new NextResponse(null, { status: 204 });
  if (isNewVisitor) {
    response.cookies.set(VISITOR_COOKIE, crypto.randomUUID(), {
      maxAge: VISITOR_COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
  }
  return response;
}
