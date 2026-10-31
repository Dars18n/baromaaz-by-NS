// ─────────────────────────────────────────────────────────────
//  BAROMAAZ — single source of truth for brand & business details.
//  Edit the values marked TODO before going live.
// ─────────────────────────────────────────────────────────────
export const SITE = {
  name: "Baromaaz",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.baromaaz.com").replace(/\/$/, ""),
  tagline: "Har Mahina, Naya Libaas",
  description:
    "Baromaaz is a handcrafted Indian ethnic-fusion label from Maharashtra. A limited new collection drops every month — kurtis, corsets, co-ord sets, dresses and festive wear in premium fabrics.",
  locale: "en_IN",
  ogImage: "/images/og/og-default.jpg",

  // TODO: confirm all contact details
  email: "hello@baromaaz.com",
  whatsapp: "+91 98765 43210",
  whatsappLink: "https://wa.me/919876543210",
  phone: "+91 98765 43210",
  hours: "Monday – Saturday, 10:00 am – 7:00 pm IST",
  address: {
    line1: "Baromaaz Studio, 2nd Floor, Shanti Kunj",
    line2: "Prabhat Road, Erandwane",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411004",
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
      phone: "+91 98765 43210",
      hours: "Monday – Friday, 10:00 am – 6:00 pm IST",
    },
    lastUpdated: "30 October 2026",
  },

  // The current Monthly Drop
  drop: {
    name: "Diya",
    month: "November 2026",
    blurb:
      "Seven festive-ready pieces in deep maroon, antique gold and earth — hand-finished in our Pune studio, in limited numbers. When they're gone, they're gone.",
  },

  freeShippingAbove: 1499,
  shippingFee: 99,
};

export const formatAddress = (a = SITE.address) =>
  `${a.line1}, ${a.line2}, ${a.city}, ${a.state} ${a.pincode}, ${a.country}`;

export const absoluteUrl = (path = "/") => `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
