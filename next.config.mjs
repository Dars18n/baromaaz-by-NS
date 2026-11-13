// Host of the remote image store (read from the existing env var; nothing is changed or exposed).
const remoteHost = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname; } catch { return null; }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false,
  compress: true,
  experimental: {
    // Put the page CSS inside the HTML so the browser doesn't wait for a separate stylesheet (render-blocking fix).
    inlineCss: true,
  },
  images: {
    // Remote product photos are converted to WebP on the fly (see src/components/Img.jsx).
    formats: ["image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: remoteHost ? [{ protocol: "https", hostname: remoteHost, pathname: "/storage/v1/object/public/**" }] : [],
  },
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};
export default nextConfig;
