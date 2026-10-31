"use client";

import { useState } from "react";

export default function NewsletterForm({ dark = false, id = "newsletter" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      if (!res.ok) throw new Error();
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p role="status" className={`text-[15px] ${dark ? "text-ivory" : "text-ink"}`}>
        You&rsquo;re on the list. Your 10% code <strong className="font-medium">BAROMAAZ10</strong> is on its way to your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <label htmlFor={id} className="sr-only">Email address</label>
      <div className={`flex w-full border ${dark ? "border-ivory/50" : "border-ink/40"}`}>
        <input
          id={id}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className={`min-h-[50px] min-w-0 flex-1 bg-transparent px-4 text-base focus:outline-none ${dark ? "text-ivory placeholder:text-ivory/70" : "text-ink placeholder:text-ink-muted"}`}
        />
        <button type="submit" disabled={status === "loading"} className={`shrink-0 px-5 text-[12px] font-medium uppercase tracking-[0.16em] transition-colors ${dark ? "bg-ivory text-ink hover:bg-terracotta-light" : "bg-ink text-ivory hover:bg-terracotta-dark"}`}>
          {status === "loading" ? "…" : "Sign up"}
        </button>
      </div>
      {status === "error" && <p role="alert" className="mt-2 text-sm text-terracotta-light">Something went wrong — please try again.</p>}
      <p className={`mt-2 text-xs ${dark ? "text-ivory/75" : "text-ink-muted"}`}>By signing up you agree to our <a href="/privacy-policy" className="underline">Privacy Policy</a>. Unsubscribe anytime.</p>
    </form>
  );
}
