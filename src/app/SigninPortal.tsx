// src/app/SigninPortal.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SigninPortal() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate() {
    if (!email || !email.includes("@")) return "Please enter a valid email.";
    if (pw.length < 6) return "Password must be at least 6 characters.";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setError(null);

    try {
      // Mock “auth”: stash a token so we can feature-gate later if needed
      if (typeof window !== "undefined") {
        localStorage.setItem("wavo_mock_session", JSON.stringify({ email, at: Date.now() }));
      }
      // Go to signup with email prefilled
      router.push(`/signup?email=${encodeURIComponent(email)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">Email</label>
        <input
          className="input"
          type="email"
          placeholder="you@label.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div>
        <label className="label">Password</label>
        <input
          className="input"
          type="password"
          placeholder="Enter a password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoComplete="current-password"
          required
        />
        <div className="mt-1 text-xs text-gray-500">Demo only — no real account is created.</div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? "Continuing…" : "Continue"}
      </button>
    </form>
  );
}
