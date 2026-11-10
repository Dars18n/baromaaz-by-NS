// Sends a custom event to GA4. Safe to call anywhere: does nothing on the server,
// or when GA4 isn't configured (NEXT_PUBLIC_GA_ID empty).
export function track(event, params = {}) {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.gtag === "function") window.gtag("event", event, params);
  } catch {}
}
