import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/cormorant-garamond/latin-ext-500.css";
import "@fontsource/cormorant-garamond/latin-600.css";
import "@fontsource/cormorant-garamond/latin-500-italic.css";
import "@fontsource/jost/latin-400.css";
import "@fontsource/jost/latin-ext-400.css";
import "@fontsource/jost/latin-500.css";
import "@fontsource/federo/latin-400.css";
import "@fontsource/pinyon-script/latin-400.css";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import BottomNav from "@/components/BottomNav";
import CheckoutBar from "@/components/CheckoutBar";
import Analytics from "@/components/Analytics";
import WhatsAppButton from "@/components/WhatsAppButton";
import { StoreProvider } from "@/components/StoreProvider";
import { SITE, absoluteUrl, formatAddress } from "@/lib/site";
import { getCategories, getProductIndex } from "@/lib/catalog";
import { GoogleAnalytics } from "@next/third-parties/google";

export const revalidate = 60;

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: "%s | Baromaaz" },
  description: SITE.description,
  applicationName: "Baromaaz",
  keywords: ["Indian ethnic wear online", "handcrafted kurtis", "Indo-western wear", "corsets", "co-ord sets", "festive wear", "ethnic dresses for women", "Baromaaz", "Maharashtra", "monthly drop"],
  openGraph: {
    type: "website",
    siteName: "Baromaaz",
    locale: SITE.locale,
    url: "/",
    title: SITE.title,
    description: SITE.description,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: "Baromaaz handcrafted Indian ethnic wear — kurtis, corsets and co-ord sets" }],
  },
  twitter: { card: "summary_large_image", title: SITE.title, description: SITE.description, images: [SITE.ogImage] },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport = { themeColor: "#f8f3ec", width: "device-width", initialScale: 1, viewportFit: "cover" };

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: "Baromaaz",
  slogan: SITE.tagline,
  url: SITE.url,
  logo: absoluteUrl("/icon.png"),
  image: absoluteUrl(SITE.ogImage),
  email: SITE.email,
  telephone: SITE.phone,
  address: {
    "@type": "PostalAddress",
    streetAddress: `${SITE.address.line1}, ${SITE.address.line2}`,
    addressLocality: SITE.address.city,
    addressRegion: SITE.address.state,
    postalCode: SITE.address.pincode,
    addressCountry: "IN",
  },
  sameAs: SITE.social.map((s) => s.href),
  description: `${SITE.description} Studio: ${formatAddress()}.`,
};

export default async function RootLayout({ children }) {
  const [productIndex, categories] = await Promise.all([getProductIndex(), getCategories()]);
  return (
    <html lang="en-IN">
      <head>
        <noscript><style>{`.reveal{opacity:1!important;transform:none!important}`}</style></noscript>
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-ivory">Skip to content</a>
        <StoreProvider products={productIndex}>
          <Header categories={categories} />
          <main id="main">{children}</main>
          <Footer categories={categories} />
          <CartDrawer />
          <CheckoutBar />
          <BottomNav />
          <WhatsAppButton />
        </StoreProvider>
        <Analytics />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}