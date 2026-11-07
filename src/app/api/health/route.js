import { NextResponse } from "next/server";
import { SITE } from "@/lib/site";

// Setup check: shows WHICH settings the live site can see (yes/no only — never the values).
export const dynamic = "force-dynamic";

export function GET() {
  const has = (k) => Boolean(process.env[k] && process.env[k].trim());
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
  return NextResponse.json(
    {
      version: "payments+cod",
      cashOnDelivery: Boolean(SITE.cod?.enabled),
      NEXT_PUBLIC_RAZORPAY_KEY_ID: has("NEXT_PUBLIC_RAZORPAY_KEY_ID") ? (keyId.startsWith("rzp_live_") ? "yes (live)" : keyId.startsWith("rzp_test_") ? "yes (test)" : "yes, but doesn't start with rzp_") : "MISSING",
      RAZORPAY_KEY_SECRET: has("RAZORPAY_KEY_SECRET") ? "yes" : "MISSING",
      RAZORPAY_WEBHOOK_SECRET: has("RAZORPAY_WEBHOOK_SECRET") ? "yes" : "MISSING",
      NEXT_PUBLIC_SUPABASE_URL: has("NEXT_PUBLIC_SUPABASE_URL") ? "yes" : "MISSING",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: has("NEXT_PUBLIC_SUPABASE_ANON_KEY") ? "yes" : "MISSING",
      SUPABASE_SERVICE_ROLE_KEY: has("SUPABASE_SERVICE_ROLE_KEY") ? "yes" : "MISSING",
      RESEND_API_KEY: has("RESEND_API_KEY") ? "yes" : "not set (order emails off)",
      CHECKOUT_DEMO: has("CHECKOUT_DEMO") ? "SET — remove it" : "not set (good)",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
