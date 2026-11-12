// Generates the illustrated placeholder images used until real product photos are shot.
// Run once: `node scripts/generate-placeholders.mjs`. Output: public/images/**.webp
// Replace them with real photos later using `npm run images` (see README).
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const out = (p) => path.join(root, "public", "images", p);
const products = JSON.parse(fs.readFileSync(path.join(root, "src/data/products.json"), "utf8"));
const categories = JSON.parse(fs.readFileSync(path.join(root, "src/data/categories.json"), "utf8"));

const SKIN = ["#c8977a", "#b98264", "#d7a98a", "#a9734f"];
const HAIR = "#241914";

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function motif(id, base, accent, scale = 1, kind = 0) {
  const s = 46 * scale;
  const shapes = [
    `<circle cx="${s / 2}" cy="${s / 2}" r="${4 * scale}" fill="${accent}"/><circle cx="0" cy="0" r="${2.4 * scale}" fill="${accent}"/><circle cx="${s}" cy="${s}" r="${2.4 * scale}" fill="${accent}"/>`,
    `<path d="M${s / 2} ${s * 0.2} L${s * 0.68} ${s / 2} L${s / 2} ${s * 0.8} L${s * 0.32} ${s / 2}Z" fill="none" stroke="${accent}" stroke-width="${1.6 * scale}"/><circle cx="${s / 2}" cy="${s / 2}" r="${2 * scale}" fill="${accent}"/>`,
    `<g fill="${accent}"><circle cx="${s / 2}" cy="${s * 0.32}" r="${3.4 * scale}"/><circle cx="${s * 0.68}" cy="${s / 2}" r="${3.4 * scale}"/><circle cx="${s / 2}" cy="${s * 0.68}" r="${3.4 * scale}"/><circle cx="${s * 0.32}" cy="${s / 2}" r="${3.4 * scale}"/></g><circle cx="${s / 2}" cy="${s / 2}" r="${2.2 * scale}" fill="${base}"/>`,
  ];
  return `<pattern id="${id}" width="${s}" height="${s}" patternUnits="userSpaceOnUse"><rect width="${s}" height="${s}" fill="${base}"/><g opacity="0.55">${shapes[kind % 3]}</g></pattern>`;
}

// Garment silhouettes around a figure centred on x=500, floor ~1210.
function figure({ cat, base, accent, skin, kind, bottom = "#efe6d6" }) {
  const g = `url(#fab)`;
  const hem = (d) => `<path d="${d}" fill="none" stroke="${accent}" stroke-width="10" opacity="0.85"/>`;
  const legs = `<path d="M455 900 L445 1185 L475 1185 L492 900Z M545 900 L555 1185 L525 1185 L508 900Z" fill="${skin}"/>`;
  const feet = `<ellipse cx="455" cy="1192" rx="26" ry="9" fill="${shade(skin, -0.35)}"/><ellipse cx="545" cy="1192" rx="26" ry="9" fill="${shade(skin, -0.35)}"/>`;
  const head = `
    <ellipse cx="500" cy="300" rx="104" ry="70" fill="${HAIR}" opacity="0.0"/>
    <path d="M430 255 Q430 165 500 160 Q570 165 572 255 L578 340 Q560 320 556 300 L444 300 Q440 320 422 340Z" fill="${HAIR}"/>
    <ellipse cx="500" cy="262" rx="58" ry="72" fill="${skin}"/>
    <path d="M440 240 Q470 175 560 228 Q545 180 500 178 Q450 180 440 240Z" fill="${HAIR}"/>
    <circle cx="500" cy="168" r="34" fill="${HAIR}"/>
    <rect x="478" y="320" width="44" height="56" rx="16" fill="${skin}"/>`;
  const arms = (y2 = 760, sleeve = 0) => `
    <path d="M350 400 Q318 560 330 ${y2}" stroke="${skin}" stroke-width="34" stroke-linecap="round" fill="none"/>
    <path d="M650 400 Q682 560 670 ${y2}" stroke="${skin}" stroke-width="34" stroke-linecap="round" fill="none"/>
    ${sleeve ? `<path d="M352 395 Q322 470 326 ${400 + sleeve}" stroke="${g}" stroke-width="54" stroke-linecap="round" fill="none"/><path d="M648 395 Q678 470 674 ${400 + sleeve}" stroke="${g}" stroke-width="54" stroke-linecap="round" fill="none"/>` : ""}`;
  switch (cat) {
    case "tops":
      return `${legs}
        <path d="M392 640 L360 1185 L486 1185 L500 760 L514 1185 L640 1185 L608 640Z" fill="${bottom}"/>
        <path d="M500 640 L500 1150" stroke="${shade(bottom, -0.12)}" stroke-width="3"/>
        ${feet}${arms(780)}${head}
        <path d="M372 390 Q500 360 628 390 L612 520 Q604 600 616 660 L384 660 Q396 600 388 520Z" fill="${g}"/>
        <circle cx="356" cy="410" r="46" fill="${g}"/><circle cx="644" cy="410" r="46" fill="${g}"/>
        <path d="M440 376 L560 376 L548 410 L452 410Z" fill="${skin}"/>
        ${hem("M386 656 L614 656")}`;
    case "kurtis":
      return `${legs}
        <path d="M430 960 L438 1185 L478 1185 L496 960Z M570 960 L562 1185 L522 1185 L504 960Z" fill="${bottom}"/>
        ${feet}${arms(780, 210)}${head}
        <path d="M372 390 Q500 362 628 390 L618 560 Q616 620 640 990 L360 990 Q384 620 382 560Z" fill="${g}"/>
        <path d="M372 760 L360 990 M628 760 L640 990" stroke="${shade(base, -0.25)}" stroke-width="4"/>
        <path d="M470 376 Q500 430 530 376" fill="${skin}"/>
        <path d="M500 400 L500 520" stroke="${accent}" stroke-width="5"/>
        ${hem("M362 984 L638 984")}`;
    case "corsets":
      return `${feet}
        <path d="M392 650 Q330 950 300 1190 L700 1190 Q670 950 608 650Z" fill="${bottom}"/>
        <path d="M430 700 Q400 950 380 1180 M570 700 Q600 950 620 1180 M500 700 L500 1180" stroke="${shade(bottom, -0.1)}" stroke-width="4" fill="none"/>
        ${arms(800)}${head}
        <path d="M376 380 L624 380 L600 440 L400 440Z" fill="${skin}"/>
        <path d="M384 448 Q440 410 500 456 Q560 410 616 448 L598 560 Q588 610 612 670 L388 670 Q412 610 402 560Z" fill="${g}"/>
        <path d="M440 470 L452 664 M560 470 L548 664 M500 462 L500 666" stroke="${accent}" stroke-width="4" opacity="0.9"/>
        ${hem("M388 666 L612 666")}`;
    case "dresses":
      return `${legs}${feet}${arms(790)}${head}
        <path d="M410 380 L440 380 L452 430 L548 430 L560 380 L590 380 L606 560 Q606 600 600 620 L400 620 Q394 600 394 560Z" fill="${g}"/>
        <path d="M400 616 L358 780 L642 780 L600 616Z" fill="${g}"/>
        <path d="M362 776 L318 940 L682 940 L638 776Z" fill="${g}"/>
        <path d="M322 936 L276 1110 L724 1110 L678 936Z" fill="${g}"/>
        ${hem("M360 778 L640 778")}${hem("M320 938 L680 938")}${hem("M280 1106 L720 1106")}`;
    case "co-ord-sets":
      return `${feet}
        <path d="M396 660 L372 1185 L488 1185 L500 800 L512 1185 L628 1185 L604 660Z" fill="${g}"/>
        ${hem("M374 1178 L486 1178")}${hem("M514 1178 L626 1178")}
        ${arms(760, 170)}${head}
        <path d="M360 392 Q500 366 640 392 L642 690 L358 690Z" fill="${g}"/>
        <path d="M470 378 L500 470 L530 378" fill="${skin}"/>
        <path d="M500 470 L500 690" stroke="${shade(base, -0.3)}" stroke-width="3"/>
        ${hem("M360 684 L640 684")}`;
    case "festive":
    default:
      return `${feet}
        <path d="M420 600 Q300 900 200 1195 L800 1195 Q700 900 580 600Z" fill="${g}"/>
        <path d="M440 640 Q360 900 300 1190 M560 640 Q640 900 700 1190 M500 640 L500 1190" stroke="${shade(base, -0.25)}" stroke-width="4" fill="none"/>
        ${hem("M206 1180 L794 1180")}${hem("M222 1140 L778 1140")}
        ${arms(780, 90)}${head}
        <path d="M372 390 Q500 366 628 390 L614 540 L386 540Z" fill="${g}"/>
        <path d="M470 380 Q500 440 530 380" fill="${skin}"/>
        <rect x="402" y="540" width="196" height="64" fill="${skin}"/>
        <path d="M610 380 Q560 700 300 1000 L250 960 Q520 690 580 380Z" fill="${accent}" opacity="0.38"/>
        ${hem("M386 536 L614 536")}`;
  }
}

function productSVG(p, i, variant) {
  const W = 1000, H = 1250;
  const kind = i % 3;
  const skin = SKIN[i % SKIN.length];
  const bgs = [
    ["#efe6d8", "#e1d1bc"],
    ["#e9ddd0", "#d8c2ab"],
  ];
  const [b1, b2] = bgs[variant % 2];
  const defs = `<defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${b1}"/><stop offset="1" stop-color="${b2}"/></linearGradient>
    ${motif("fab", p.base, p.accent, variant === 2 ? 3.2 : 1, kind)}
    <radialGradient id="vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.12"/></radialGradient>
    <linearGradient id="fold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.18"/><stop offset="0.35" stop-color="#fff" stop-opacity="0.06"/><stop offset="0.6" stop-color="#000" stop-opacity="0.12"/><stop offset="1" stop-color="#fff" stop-opacity="0.08"/></linearGradient>
  </defs>`;
  if (variant === 2) {
    // Fabric detail close-up
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}
      <rect width="${W}" height="${H}" fill="url(#fab)"/>
      <rect width="${W}" height="${H}" fill="url(#fold)"/>
      <rect y="${H - 260}" width="${W}" height="90" fill="${p.accent}" opacity="0.9"/>
      <rect y="${H - 250}" width="${W}" height="70" fill="none" stroke="${p.base}" stroke-width="4" stroke-dasharray="14 10"/>
      <rect width="${W}" height="${H}" fill="url(#vig)"/></svg>`;
  }
  const flip = variant === 1 ? `transform="translate(${W} 0) scale(-1 1)"` : "";
  const arch = variant === 1
    ? `<rect x="170" y="120" width="660" height="1100" rx="20" fill="#fff" opacity="0.28"/>`
    : `<path d="M180 1250 L180 420 Q180 110 500 110 Q820 110 820 420 L820 1250Z" fill="#fff" opacity="0.32"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}
    <rect width="${W}" height="${H}" fill="url(#bg)"/>${arch}
    <ellipse cx="500" cy="1200" rx="300" ry="26" fill="#000" opacity="0.08"/>
    <g ${flip}>${figure({ cat: p.category, base: p.base, accent: p.accent, skin, kind })}</g>
    <rect width="${W}" height="${H}" fill="url(#vig)"/></svg>`;
}

function sceneSVG({ W, H, figures, bgTop, bgBottom, sun = true, text }) {
  const groups = figures.map((f, k) => {
    const { p, x, s } = f;
    return `<defs>${motif("fab" + k, p.base, p.accent, 1, k)}</defs>
      <g transform="translate(${x - 500 * s} ${H - 1210 * s - 20}) scale(${s})">
        ${figure({ cat: p.category, base: p.base, accent: p.accent, skin: SKIN[k % 4], kind: k }).replaceAll("url(#fab)", `url(#fab${k})`)}
      </g>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bgTop}"/><stop offset="1" stop-color="${bgBottom}"/></linearGradient>
    <radialGradient id="vig2" cx="0.5" cy="0.5" r="0.8"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.28"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    ${sun ? `<circle cx="${W * 0.5}" cy="${H * 0.42}" r="${Math.min(W, H) * 0.3}" fill="#f4d9b4" opacity="0.35"/>` : ""}
    <rect y="${H * 0.82}" width="${W}" height="${H * 0.18}" fill="#000" opacity="0.08"/>
    ${groups}
    ${text || ""}
    <rect width="${W}" height="${H}" fill="url(#vig2)"/></svg>`;
}

async function save(svg, file, quality = 80) {
  fs.mkdirSync(path.dirname(out(file)), { recursive: true });
  await sharp(Buffer.from(svg)).webp({ quality, effort: 5 }).toFile(out(file));
}

const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]));

// Products: 3 images each (front, alternate, fabric detail)
for (const [i, p] of products.entries()) {
  for (let v = 0; v < 3; v++) await save(productSVG(p, i, v), `products/${p.slug}-${v + 1}.webp`);
}

// Categories
for (const [i, c] of categories.entries()) {
  const p = { ...c, category: c.slug };
  await save(productSVG(p, i + 2, 0), `categories/${c.slug}.webp`);
}

// Hero (desktop landscape + mobile portrait)
const heroFigs = [
  { p: bySlug["paithani-edge-co-ord-set"], x: 330, s: 0.78 },
  { p: bySlug["rani-mirror-work-lehenga-set"], x: 800, s: 0.86 },
  { p: bySlug["mitti-tiered-maxi-dress"], x: 1270, s: 0.78 },
];
// Hero now uses a real photo (public/images/hero/hero.webp); placeholder hero kept for reference only.
if (false) await save(sceneSVG({ W: 1600, H: 1000, figures: heroFigs, bgTop: "#a4583c", bgBottom: "#5a2c1e" }), "hero/hero-desktop.webp", 78);


// Shop the Look editorial images
const looks = [
  ["zari-brocade-corset", "#cfb59a", "#8e6a4c"],
  ["paithani-edge-co-ord-set", "#d9c8b2", "#a07f60"],
  ["mitti-tiered-maxi-dress", "#e6cfb3", "#b27a56"],
  ["rani-mirror-work-lehenga-set", "#b98c6a", "#6a3a28"],
];
for (const [k, [slug, t, b]] of looks.entries()) {
  await save(sceneSVG({ W: 1000, H: 1250, figures: [{ p: bySlug[slug], x: 500, s: 0.96 }], bgTop: t, bgBottom: b }), `looks/look-${k + 1}.webp`);
}

// Monthly drop banner + about images
await save(sceneSVG({ W: 1000, H: 1250, figures: [{ p: bySlug["meher-chikankari-kurti"], x: 500, s: 0.96 }], bgTop: "#e8dccb", bgBottom: "#c6a98a" }), "about/studio.webp");
const swatches = products.slice(0, 12).map((p, k) => `<defs>${motif("sw" + k, p.base, p.accent, 1.6, k)}</defs>
  <rect x="${60 + (k % 4) * 225}" y="${80 + Math.floor(k / 4) * 370}" width="200" height="340" rx="6" fill="url(#sw${k})" transform="rotate(${(k % 3) - 1} ${160 + (k % 4) * 225} ${250 + Math.floor(k / 4) * 370})"/>`).join("");
await save(`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1250" viewBox="0 0 1000 1250"><rect width="1000" height="1250" fill="#efe6d8"/>${swatches}</svg>`, "about/fabrics.webp");

// Open Graph default (1200x630)
const ogText = `
  <text x="600" y="300" text-anchor="middle" font-family="Cormorant Garamond SemiBold" font-size="120" letter-spacing="18" fill="#f8f3ec">BAROMAAZ</text>
  <text x="600" y="380" text-anchor="middle" font-family="Cormorant Garamond Medium" font-style="italic" font-size="46" fill="#f1dcc6">Har Mahina, Naya Libaas</text>
  <text x="600" y="450" text-anchor="middle" font-family="Jost" font-size="22" letter-spacing="6" fill="#f1dcc6">HANDCRAFTED IN JAIPUR · NEW DROP EVERY MONTH</text>`;
const ogDefault = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a4583c"/><stop offset="1" stop-color="#4a2418"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/><rect x="30" y="30" width="1140" height="570" fill="none" stroke="#f1dcc6" stroke-opacity="0.5"/>${ogText}</svg>`;
// OG images are JPEG on purpose: WhatsApp/Instagram link previews don't reliably render WebP.
async function saveJpg(svgOrBuf, file) {
  fs.mkdirSync(path.dirname(out(file)), { recursive: true });
  await sharp(svgOrBuf).jpeg({ quality: 82, mozjpeg: true }).toFile(out(file));
}
await saveJpg(Buffer.from(ogDefault), "og/og-default.jpg");
const esc = (t) => t.replace(/&/g, "&amp;");
for (const [i, p] of products.entries()) {
  const prod = await sharp(Buffer.from(productSVG(p, i, 0))).resize(504, 630).png().toBuffer();
  const panel = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#f8f3ec"/>
    <text x="580" y="200" font-family="Jost" font-size="22" letter-spacing="6" fill="#a4583c">BAROMAAZ</text>
    <text x="580" y="290" font-family="Cormorant Garamond SemiBold" font-size="58" fill="#1f1a17">${esc(p.name)}</text>
    <text x="580" y="370" font-family="Jost Medium" font-size="40" fill="#1f1a17">₹${p.price.toLocaleString("en-IN")}</text>
    <text x="580" y="440" font-family="Cormorant Garamond Medium" font-style="italic" font-size="34" fill="#6b4a33">Har Mahina, Naya Libaas</text></svg>`;
  const buf = await sharp(Buffer.from(panel)).composite([{ input: prod, left: 0, top: 0 }]).png().toBuffer();
  await saveJpg(buf, `og/${p.slug}.jpg`);
}

// Favicon / icon (PNG – browsers & WhatsApp need PNG/ICO here)
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" rx="96" fill="#a4583c"/>
  <text x="256" y="350" text-anchor="middle" font-family="Cormorant Garamond SemiBold" font-size="330" fill="#f8f3ec">B</text></svg>`;
await sharp(Buffer.from(icon)).resize(512).png().toFile(path.join(root, "src/app/icon.png"));
await sharp(Buffer.from(icon)).resize(180).png().toFile(path.join(root, "src/app/apple-icon.png"));

console.log("Placeholders generated.");
