"use client";

import { useState } from "react";

export default function LoginForm() {
  const [f, setF] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not sign in.");
      window.location.href = "/admin";
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="w-full max-w-sm border border-ink/15 bg-white/70 p-7">
      <p className="font-logo text-2xl tracking-brand">BAROMAAZ</p>
      <h1 className="mt-1 font-serif text-3xl">Admin sign in</h1>
      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="ad-email" className="label">Email</label>
          <input id="ad-email" type="email" required autoComplete="username" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} className="input" />
        </div>
        <div>
          <label htmlFor="ad-pass" className="label">Password</label>
          <input id="ad-pass" type="password" required autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} className="input" />
        </div>
      </div>
      {error && <p role="alert" className="mt-5 text-sm text-[#b3261e]">{error}</p>}
      <button type="submit" disabled={busy} className="btn-dark mt-6 w-full">{busy ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
