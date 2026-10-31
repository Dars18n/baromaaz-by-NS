import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

// Read-only client (catalogue, approved reviews). Safe to use anywhere.
export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, { auth: { persistSession: false } })
  : null;

// Full-access client for the server only (orders, stock, admin).
// Never import this into a "use client" file.
export function supabaseAdmin() {
  if (typeof window !== "undefined") throw new Error("supabaseAdmin() must only run on the server");
  if (!url || !serviceKey) throw new Error("Supabase service key missing — add SUPABASE_SERVICE_ROLE_KEY to .env.local");
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
