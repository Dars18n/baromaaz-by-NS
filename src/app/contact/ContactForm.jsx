"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

export default function ContactForm() {
  const [f, setF] = useState({ name: "", phone: "", topic: "Order enquiry", message: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const viaWhatsApp = () => {
    const form = document.getElementById("contact-form");
    if (!form.reportValidity()) return;
    const body = `${f.message}\n\n— ${f.name}${f.phone ? `\n${f.phone}` : ""}`;
    window.open(`${SITE.whatsappLink}?text=${encodeURIComponent(`${f.topic}\n\n${body}`)}`, "_blank", "noopener");
  };

  return (
    <form id="contact-form" onSubmit={(e) => { e.preventDefault(); viaWhatsApp(); }} className="mt-6 grid gap-5 sm:grid-cols-2">
      <div><label htmlFor="c-name" className="label">Name</label><input id="c-name" required autoComplete="name" value={f.name} onChange={set("name")} className="input" /></div>
      <div><label htmlFor="c-phone" className="label">Phone (optional)</label><input id="c-phone" type="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} className="input" /></div>
      <div>
        <label htmlFor="c-topic" className="label">Topic</label>
        <select id="c-topic" value={f.topic} onChange={set("topic")} className="input">
          {["Order enquiry", "Sizing & fit", "Returns & exchanges", "Styling help", "Collaborations & press", "Something else"].map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2"><label htmlFor="c-msg" className="label">Message</label><textarea id="c-msg" required rows={5} value={f.message} onChange={set("message")} className="input py-3" /></div>
      <div className="flex flex-wrap gap-3 sm:col-span-2">
        <button type="submit" className="btn-dark">Send on WhatsApp</button>
      </div>
      <p className="text-xs text-ink-muted sm:col-span-2">Opens WhatsApp with your message ready to send.</p>
    </form>
  );
}
