"use client";

import { usePathname } from "next/navigation";

// Hides the shop's header, footer, cart etc. on the /admin screens.
export default function HideOnAdmin({ children }) {
  const path = usePathname();
  if (path === "/admin" || path?.startsWith("/admin/")) return null;
  return children;
}
