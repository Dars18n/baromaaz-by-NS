import "server-only";

// Small in-memory limiter (per server instance) — slows down password guessing and cancel-form abuse.
const buckets = new Map();

export function clientIp(req) {
  return (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

// Counts an attempt. Returns { ok:false, retryAfter } once `max` attempts happen inside `windowMs`.
export function hit(key, { max, windowMs }) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now - b.start > windowMs) {
    buckets.set(key, { start: now, count: 1 });
    return { ok: true };
  }
  b.count += 1;
  if (b.count > max) return { ok: false, retryAfter: Math.ceil((b.start + windowMs - now) / 1000) };
  return { ok: true };
}

export const clear = (key) => buckets.delete(key);
