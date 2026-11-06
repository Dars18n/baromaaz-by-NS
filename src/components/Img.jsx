// Lightweight image with three guarantees:
//  1. WebP — local files are already WebP; remote photos (e.g. product images in cloud storage) go through
//     Next's image optimiser, which returns WebP at a size that fits the screen.
//  2. Aspect ratio kept — width/height attributes + CSS aspect-ratio reserve the right box, so nothing
//     jumps (no layout shift) or stretches. Default is the shop's 4:5 portrait.
//  3. Never an empty alt — if a caller forgets, a readable fallback is built from the file name.
const WIDTHS = [384, 640, 828, 1080];

const isRemote = (src) => /^https?:\/\//i.test(src);
const optimised = (src, w) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;

function altFromSrc(src = "") {
  const name = src.split("?")[0].split("/").pop()?.replace(/\.[a-z0-9]+$/i, "").replace(/-\d+$/, "").replace(/[-_]+/g, " ").trim();
  return name ? `Baromaaz ${name}` : "Baromaaz handcrafted ethnic wear";
}

export default function Img({ src, alt, width = 1000, height = 1250, priority = false, className = "", sizes, style, ...rest }) {
  const remote = isRemote(src);
  const srcSet = remote ? WIDTHS.map((w) => `${optimised(src, w)} ${w}w`).join(", ") : undefined;
  return (
    <img
      src={remote ? optimised(src, 828) : src}
      srcSet={srcSet}
      sizes={remote ? sizes || "(max-width: 768px) 50vw, 400px" : sizes}
      alt={alt || altFromSrc(src)}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      className={className}
      style={{ aspectRatio: `${width} / ${height}`, ...style }}
      {...rest}
    />
  );
}
