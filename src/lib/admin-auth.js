import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_SECONDS, checkCredentials, readSession, signSession } from "./admin-session";

export const ADMIN_COOKIE = "bz_admin";

// Built-in login for support@baromaaz.com (a scrambled hash, not the password itself).
// To change the password later, run `npm run admin:hash -- "NewPassword"` and put the printed
// ADMIN_PASSWORD_HASH in .env.local / Vercel — it overrides this one.
const DEFAULT_HASH = "scrypt$549531c8658106932fc98e27f7f561e7$2c7952b657c464a9c42c97ef4a8947e2c53bd5ea7a1067d2f8d06f2aaabdff0af0e18a617485cbd3df4ebb90ef1ddaa6d666714d33db5451a9e1e5b6a22c3033";

// The cookie-signing secret is never stored in the code: unless ADMIN_SESSION_SECRET is set,
// it is derived from SUPABASE_SERVICE_ROLE_KEY (already secret on your server).
function sessionSecret(hash) {
  if (process.env.ADMIN_SESSION_SECRET) return process.env.ADMIN_SESSION_SECRET;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || (process.env.NODE_ENV === "production" ? "" : "local-dev-only");
  return key ? crypto.createHash("sha256").update(`bz-admin|${key}|${hash}`).digest("hex") : "";
}

const config = () => {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH || DEFAULT_HASH;
  return {
    adminEmail: (process.env.ADMIN_EMAIL || "support@baromaaz.com").trim().toLowerCase(),
    passwordHash,
    secret: sessionSecret(passwordHash),
  };
};

export const adminConfigured = () => {
  const c = config();
  return Boolean(c.passwordHash && c.secret.length >= 32);
};

export function verifyLogin(email, password) {
  const c = config();
  if (!adminConfigured()) return false;
  return checkCredentials(email, password, c);
}

export async function startSession() {
  const c = config();
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, signSession(c.adminEmail, c.secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).set(ADMIN_COOKIE, "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
}

// Returns { email } if the visitor is the signed-in admin, otherwise null.
export async function getAdmin() {
  const c = config();
  if (!adminConfigured()) return null;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const s = readSession(token, c.secret);
  return s && s.email === c.adminEmail ? s : null;
}

// For API routes: returns a ready-made error response, or null if the request is allowed.
// Mutating requests must also come from this same website (blocks cross-site requests).
export async function guardAdmin(req, { mutating = false } = {}) {
  if (!(await getAdmin())) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (mutating) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");
    if (origin) {
      let originHost = "";
      try { originHost = new URL(origin).host; } catch {}
      if (originHost !== host) return NextResponse.json({ error: "Blocked request." }, { status: 403 });
    }
  }
  return null;
}