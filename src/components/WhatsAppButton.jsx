"use client";

import { usePathname } from "next/navigation";
import { SITE } from "@/lib/site";
import { track } from "@/lib/analytics";

// Floating "Chat on WhatsApp" button on browsing pages. Sits bottom-left so it never
// collides with the checkout bar (bottom-right) or the phone tab bar.
const SHOW_ON = /^\/(shop|product|new-in|drop)(\/|$)/;

export default function WhatsAppButton() {
  const pathname = usePathname() || "/";
  if (!SHOW_ON.test(pathname)) return null;

  const text = encodeURIComponent(`Hi Baromaaz! I have a question about ${SITE.url}${pathname}`);
  return (
    <a
      href={`${SITE.whatsappLink}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Baromaaz on WhatsApp"
      onClick={() => track("whatsapp_click", { page: pathname })}
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom)+var(--cobar,0px))] left-4 z-[36] flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 md:bottom-6 md:left-6 md:h-14 md:w-14"
    >
      <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2a9.9 9.9 0 0 0-8.43 15.1L2 22l5.02-1.58A9.9 9.9 0 1 0 12.04 2Zm0 18.1a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-2.98.94.97-2.9-.2-.31a8.2 8.2 0 1 1 6.69 3.59Zm4.5-6.15c-.25-.12-1.46-.72-1.69-.8-.22-.08-.39-.12-.55.12-.16.25-.63.8-.78.97-.14.16-.29.18-.53.06a6.7 6.7 0 0 1-3.3-2.88c-.25-.43.25-.4.71-1.32.08-.16.04-.3-.02-.43-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.55c.12.16 1.73 2.64 4.2 3.7.59.26 1.05.41 1.4.52.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.66-1.17.2-.58.2-1.07.14-1.17-.06-.1-.22-.16-.47-.28Z" />
      </svg>
    </a>
  );
}
