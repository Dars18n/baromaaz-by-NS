// Makes the two secret values the admin login needs.
//   npm run admin:hash -- "YourNewPassword"
// Copy the printed lines into .env.local (and into Vercel → Settings → Environment Variables).
import crypto from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 8) {
  console.error('\nUsage: npm run admin:hash -- "your password"   (at least 8 characters)\n');
  process.exit(1);
}
const salt = crypto.randomBytes(16);
const hash = crypto.scryptSync(password, salt, 64).toString("hex");
console.log("\nADMIN_EMAIL=support@baromaaz.com");
console.log(`ADMIN_PASSWORD_HASH=scrypt$${salt.toString("hex")}$${hash}`);
console.log(`ADMIN_SESSION_SECRET=${crypto.randomBytes(32).toString("hex")}\n`);
