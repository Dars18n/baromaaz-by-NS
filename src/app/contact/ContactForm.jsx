"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

export default function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", phone: "", topic: "Order enquiry", message: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const body = () => `${f.message}\n\n— ${f.name}\n${f.email}${f.phone ? `\n${f.phone}` : ""}`;

  const viaEmail = (e) => {
    e.preventDefault();
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(`${f.topic} — ${f.name}`)}&body=${encodeURIComponent(body())}`;
  };
  const viaWhatsApp = () => {
    const form = document.getElementById("contact-form");
    if (!form.reportValidity()) return;
    window.open(`${SITE.whatsappLink}?text=${encodeURIComponent(`${f.topic}\n\n${body()}`)}`, "_blank", "noopener");
  };

  return (
    <form id="contact-form" onSubmit={viaEmail} className="mt-6 grid gap-5 sm:grid-cols-2">
      <div><label htmlFor="c-name" className="label">Name</label><input id="c-name" required autoComplete="name" value={f.name} onChange={set("name")} className="input" /></div>
      <div><label htmlFor="c-email" className="label">Email</label><input id="c-email" type="email" required autoComplete="email" value={f.email} onChange={set("email")} className="input" /></div>
      <div><label htmlFor="c-phone" className="label">Phone (optional)</label><input id="c-phone" type="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} className="input" /></div>
      <div>
        <label htmlFor="c-topic" className="label">Topic</label>
        <select id="c-topic" value={f.topic} onChange={set("topic")} className="input">
          {["Order enquiry", "Sizing & fit", "Returns & exchanges", "Styling help", "Collaborations & press", "Something else"].map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2"><label htmlFor="c-msg" className="label">Message</label><textarea id="c-msg" required rows={5} value={f.message} onChange={set("message")} className="input py-3" /></div>
      <div className="flex flex-wrap gap-3 sm:col-span-2">
        <button type="submit" className="btn-dark">Send by email</button>
        <button type="button" onClick={viaWhatsApp} className="btn-outline">Send on WhatsApp</button>
      </div>
      <p className="text-xs text-ink-muted sm:col-span-2">Opens your email app or WhatsApp with your message ready to send.</p>
    </form>
  );
}
