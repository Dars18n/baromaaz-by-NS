// Shrinks photos in the browser before upload: WebP, 1000px wide, about 200 KB (same as the rest of the shop),
// plus a 1200x630 JPEG share image for WhatsApp / Instagram link previews.

async function decode(file) {
  if ("createImageBitmap" in window) {
    try { return await createImageBitmap(file, { imageOrientation: "from-image" }); } catch {}
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`"${file.name}" isn't a photo we can read. Use JPG, PNG or WebP.`)); };
    img.src = url;
  });
}

const toBlob = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));

export async function prepareImage(file) {
  const src = await decode(file);
  const w0 = src.width || src.naturalWidth;
  const h0 = src.height || src.naturalHeight;
  const scale = Math.min(1, 1000 / w0);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w0 * scale);
  canvas.height = Math.round(h0 * scale);
  canvas.getContext("2d").drawImage(src, 0, 0, canvas.width, canvas.height);

  let type = "image/webp";
  let blob = null;
  for (const q of [0.82, 0.7, 0.58, 0.46, 0.36]) {
    blob = await toBlob(canvas, type, q);
    if (blob && type === "image/webp" && blob.type !== "image/webp") {
      // this browser can't write WebP — use JPEG instead
      type = "image/jpeg";
      blob = await toBlob(canvas, type, q);
    }
    if (blob && blob.size <= 200 * 1024) break;
  }
  if (!blob) throw new Error("Could not process that photo.");
  return { blob, ext: blob.type === "image/webp" ? "webp" : "jpg", preview: URL.createObjectURL(blob), source: src };
}

// 1200x630 JPEG crop of the main photo.
export async function makeShareImage(source) {
  const w = source.width || source.naturalWidth;
  const h = source.height || source.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  const ratio = 1200 / 630;
  let sw = w, sh = w / ratio;
  if (sh > h) { sh = h; sw = h * ratio; }
  const sx = (w - sw) / 2;
  const sy = Math.max(0, Math.min(h - sh, (h - sh) * 0.2)); // keep the upper part (faces / necklines)
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, 1200, 630);
  return toBlob(canvas, "image/jpeg", 0.8);
}
