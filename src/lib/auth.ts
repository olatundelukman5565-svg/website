import "server-only";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { SESSION_COOKIE } from "@/lib/session-cookie-name";

export { SESSION_COOKIE };
const SESSION_EXPIRES_IN = 60 * 60 * 24 * 14 * 1000; // 14 days

function identityToolkitHost() {
  const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  if (emulatorHost) {
    return `http://${emulatorHost}/identitytoolkit.googleapis.com/v1`;
  }
  return "https://identitytoolkit.googleapis.com/v1";
}

export async function signInWithPassword(email: string, password: string) {
  const apiKey = process.env.FIREBASE_API_KEY || "demo-api-key";
  const res = await fetch(`${identityToolkitHost()}/accounts:signInWithPassword?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok) {
    const message = data?.error?.message || "Invalid credentials";
    throw new Error(message);
  }
  return data.idToken as string;
}

export async function createSession(idToken: string) {
  const decoded = await adminAuth.verifyIdToken(idToken);
  if (!decoded.admin) {
    throw new Error("This account does not have admin access.");
  }
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_IN,
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, sessionCookie, {
    maxAge: SESSION_EXPIRES_IN / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getAdminSession() {
  const store = await cookies();
  const sessionCookie = store.get(SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    if (!decoded.admin) return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
