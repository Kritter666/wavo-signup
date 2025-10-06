"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupForm() {
  const sp = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState(sp.get("email") ?? "");
  const [ref, setRef] = useState(sp.get("ref") ?? "");
  const [loading, setLoading] = useState(false);
  const utm = {
    source: sp.get("utm_source") ?? "",
    medium: sp.get("utm_medium") ?? "",
    campaign: sp.get("utm_campaign") ?? "",
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          ref,
          utm,
          consentMarketing: true,
          ts: Date.now(),
        }),
      });

      // Even if KV isn't configured, API returns ok:true.
      if (res.ok) {
        router.push(`/thanks?email=${encodeURIComponent(email)}`);
      } else {
        // Fallback route if something odd happens
        router.push(`/thanks`);
      }
    } catch (err) {
      router.push(`/thanks`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md card p-8 space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground grid place-items-center font-bold">W</div>
        <div className="font-semibold">Wavo</div>
        <div className="ml-auto text-xs text-muted-foreground">Signup</div>
      </div>

      <h2 className="text-xl font-semibold">Get started</h2>
      <p className="text-sm text-muted-foreground">Tell us how to reach you. You can paste a referral code if you have one.</p>

      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="label">Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@label.com"
            className="input"
            type="email"
            required
          />
        </label>

        <label className="label">Referral Code
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="optional"
            className="input"
          />
        </label>

        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? "Sending…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
