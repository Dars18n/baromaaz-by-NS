import { NextResponse } from "next/server";
import { adminConfigured, startSession, verifyLogin } from "@/lib/admin-auth";
import { clear, clientIp, hit } from "@/lib/ratelimit";

export async function POST(req) {
  if (!adminConfigured())
    return NextResponse.json({ error: "Admin login isn't set up yet. Add ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET to your environment variables." }, { status: 503 });
  const key = `login:${clientIp(req)}`;
  // 6 attempts per 15 minutes per visitor
  const limited = hit(key, { max: 6, windowMs: 15 * 60 * 1000 });
  if (!limited.ok) return NextResponse.json({ error: `Too many attempts. Try again in ${Math.ceil(limited.retryAfter / 60)} minutes.` }, { status: 429 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  if (!verifyLogin(body.email, body.password)) return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });

  clear(key);
  await startSession();
  return NextResponse.json({ ok: true });
}
