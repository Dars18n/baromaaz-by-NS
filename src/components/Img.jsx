// Lightweight image: pre-optimised WebP (~1000px, <200 KB) + native lazy-loading.
export default function Img({ src, alt, width = 1000, height = 1250, priority = false, className = "", sizes, ...rest }) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      sizes={sizes}
      className={className}
      {...rest}
    />
  );
}
