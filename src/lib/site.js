// ─────────────────────────────────────────────────────────────
//  BAROMAAZ — single source of truth for brand & business details.
//  Edit the values marked TODO before going live.
// ─────────────────────────────────────────────────────────────
export const SITE = {
  name: "Baromaaz",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.baromaaz.com").replace(/\/$/, ""),
  tagline: "Har Mahina, Naya Libaas",
  title: "Baromaaz | Indian Ethnic Wear Online – Kurtis, Corsets, Co-ords",
  description:
    "Shop handcrafted Indian ethnic wear online: kurtis, corsets, co-ord sets, dresses & festive wear. Indo-western fashion with a new limited drop every month.",
  locale: "en_IN",
  ogImage: "/images/og/og-default.jpg",

  // TODO: confirm all contact details
  whatsapp: "+91 86907 08691",
  whatsappLink: "https://wa.me/918690708691",
  phone: "+91 86907 08691",
  hours: "Monday – Saturday, 10:00 am – 7:00 pm IST",
  address: {
    line1: "Jeevan Vihar Colony, 17, Rampura Rd, Ram Nagar",
    line2: "Kalyanpura, Sanganer",
    city: "Jaipur",
    state: "Jaipur",
    pincode: "302029",
    country: "India",
  },

  // TODO: replace with the real handles
  social: [
    { name: "Instagram", href: "https://www.instagram.com/baromaaz" },
    { name: "Facebook", href: "https://www.facebook.com/baromaaz" },
    { name: "Pinterest", href: "https://in.pinterest.com/baromaaz" },
    { name: "YouTube", href: "https://www.youtube.com/@baromaaz" },
  ],

  // Required under the Consumer Protection (E-Commerce) Rules, 2020 — TODO: fill in
  legal: {
    entity: "Baromaaz (Proprietorship)",
    gstin: "27XXXXXXXXXXXZX",
    grievanceOfficer: {
      name: "Ms. Ananya Deshpande",
      designation: "Grievance Officer",
      email: "grievance@baromaaz.com",
      phone: "+91 86907 08691",
      hours: "Monday – Friday, 10:00 am – 6:00 pm IST",
    },
    lastUpdated: "30 October 2026",
  },

  // The current Monthly Drop
  drop: {
    name: "November",
    month: "November 2026",
    tagline: "November wedding looks that steal the spotlight",
    blurb:
      "Seven festive-ready pieces in deep maroon, antique gold and earth — hand-finished in our Jaipur studio, in limited numbers. When they're gone, they're gone.",
  },

  // "12 Months. 12 Drops." — choose the piece shown for any month (1 = January … 12 = December).
  // Use the product's URL name, e.g.  5: "kiara-petal-dress".  Months left out are filled automatically.
  monthlyFeatured: {},

  // Festive extras — set diwali to false after the festival to switch the fireworks off
  festive: {
    diwali: false,
  },

  freeShippingAbove: 1499,
  shippingFee: 99,
  // Cash on Delivery: set cod.enabled to false to switch it off. fee = handling charge added to COD orders.
  cod: { enabled: true, fee: 59 },
};

export const formatAddress = (a = SITE.address) =>
  `${a.line1}, ${a.line2}, ${a.city}${a.state && a.state !== a.city ? `, ${a.state}` : ""} ${a.pincode}, ${a.country}`;

export const absoluteUrl = (path = "/") => `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
