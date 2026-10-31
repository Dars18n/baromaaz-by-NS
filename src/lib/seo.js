import { SITE } from "./site";

// Builds per-page metadata: title, description, canonical and Open Graph image.
export function pageMeta({ title, description, path, image = SITE.ogImage, imageAlt, type = "website", noindex = false }) {
  const img = { url: image, width: 1200, height: 630, alt: imageAlt || title };
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type, siteName: "Baromaaz", locale: SITE.locale, url: path, title: `${title} | Baromaaz`, description, images: [img] },
    twitter: { card: "summary_large_image", title: `${title} | Baromaaz`, description, images: [image] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
