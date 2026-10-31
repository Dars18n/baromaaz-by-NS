import { NextResponse } from "next/server";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Forwards signups to NEWSLETTER_WEBHOOK_URL (Mailchimp/Zapier/Google Apps Script etc.).
export async function POST(req) {
  const { email } = await req.json().catch(() => ({}));
  if (!email || !EMAIL.test(email) || email.length > 200) {
    return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
  }
  const hook = process.env.NEWSLETTER_WEBHOOK_URL;
  if (hook) {
    const r = await fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source: "baromaaz.com", at: new Date().toISOString() }) }).catch(() => null);
    if (!r || !r.ok) return NextResponse.json({ error: "Signup failed" }, { status: 502 });
  } else {
    console.warn("[newsletter] NEWSLETTER_WEBHOOK_URL not set — signup not stored:", email);
  }
  return NextResponse.json({ ok: true });
}
