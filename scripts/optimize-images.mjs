// Converts your real photos into web-ready images.
//
// 1. Put original photos (JPG/PNG/HEIC-exported JPG) in  photos-src/  using the SAME folder
//    structure and file names as public/images, e.g.
//      photos-src/products/zari-brocade-corset-1.jpg
//      photos-src/categories/kurtis.jpg
//      photos-src/hero/hero.jpg   (landscape — the subject should sit on the right)
// 2. Run:  npm run images
//
// Every image becomes a WebP ~1000px wide (hero desktop 1600px) and is compressed until it is
// under 200 KB. Product photos also get a 1200×630 JPEG share image in public/images/og/ for
// WhatsApp/Instagram link previews.
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, "$1"), "..");
const src = path.join(root, "photos-src");
const dest = path.join(root, "public", "images");
const MAX_BYTES = 200 * 1024;

if (!fs.existsSync(src)) {
  console.log("No photos-src/ folder found. Create it and add your photos (see comments at top of this file).");
  process.exit(0);
}

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]));
const files = walk(src).filter((f) => /\.(jpe?g|png|webp|tiff?)$/i.test(f));

async function toWebp(input, width, height) {
  for (let q = 82; q >= 40; q -= 6) {
    const buf = await sharp(input).rotate().resize({ width, height, fit: height ? "cover" : "inside", withoutEnlargement: true }).webp({ quality: q, effort: 5 }).toBuffer();
    if (buf.length <= MAX_BYTES) return { buf, q };
  }
  const buf = await sharp(input).rotate().resize({ width: Math.round(width * 0.8) }).webp({ quality: 45 }).toBuffer();
  return { buf, q: 45 };
}

for (const file of files) {
  const rel = path.relative(src, file).replace(/\\/g, "/");
  const out = path.join(dest, rel.replace(/\.[^.]+$/, ".webp"));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const isHeroDesktop = rel.startsWith("hero/");
  const isPortrait = rel.startsWith("products/") || rel.startsWith("categories/") || rel.startsWith("looks/") || rel.startsWith("about/");
  const width = isHeroDesktop ? 1600 : 1000;
  const height = isPortrait ? 1250 : undefined; // products & cards are 4:5
  const { buf, q } = await toWebp(file, width, height);
  fs.writeFileSync(out, buf);
  console.log(`✓ ${rel} → ${path.relative(root, out)}  ${(buf.length / 1024).toFixed(0)} KB (q${q})`);

  const m = rel.match(/^products\/(.+)-1\.[^.]+$/);
  if (m) {
    const og = path.join(dest, "og", `${m[1]}.jpg`);
    await sharp(file).rotate().resize(1200, 630, { fit: "cover", position: "attention" }).jpeg({ quality: 80, mozjpeg: true }).toFile(og);
    console.log(`  ↳ share image ${path.relative(root, og)}`);
  }
}
console.log(`Done — ${files.length} image(s) optimised.`);
