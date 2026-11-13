// Pure helpers (no Next.js imports) for the admin login: password check + signed session cookie.
// Used by src/lib/admin-auth.js. Kept separate so it can be tested on its own.
import crypto from "node:crypto";

export const SESSION_SECONDS = 60 * 60 * 12; // 12 hours

const b64 = (buf) => Buffer.from(buf).toString("base64url");

// Password hashes look like  scrypt$<salt hex>$<hash hex>  (made by `npm run admin:hash`).
export function hashPassword(password, saltHex = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(String(password), Buffer.from(saltHex, "hex"), 64).toString("hex");
  return `scrypt$${saltHex}$${hash}`;
}

const safeEqual = (a, b) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

// True only if the email AND password match. Always does the same amount of work, so timing reveals nothing.
export function checkCredentials(email, password, { adminEmail, passwordHash }) {
  const [scheme, salt, hash] = String(passwordHash || "").split("$");
  const validHash = scheme === "scrypt" && salt && hash;
  const test = validHash ? hashPassword(password, salt) : hashPassword(password);
  const passwordOk = validHash && safeEqual(test, passwordHash);
  const emailOk = safeEqual(String(email || "").trim().toLowerCase(), String(adminEmail || "").trim().toLowerCase());
  return Boolean(passwordOk && emailOk);
}

export function signSession(email, secret, now = Date.now()) {
  const payload = b64(JSON.stringify({ e: email, exp: Math.floor(now / 1000) + SESSION_SECONDS }));
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function readSession(token, secret, now = Date.now()) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  if (!safeEqual(sig || "", expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.exp || data.exp * 1000 < now) return null;
    return { email: data.e };
  } catch {
    return null;
  }
}
