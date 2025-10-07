"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SigninPortal() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  function onContinue(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/signup/assistant?email=${encodeURIComponent(email)}`);
  }

  return (
    <form onSubmit={onContinue} className="w-full max-w-lg">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-center font-black tracking-[0.35em] text-2xl leading-none">WAVO</h1>
        <h2 className="mt-3 text-center text-2xl font-semibold">Welcome</h2>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Log in to Wavo to continue to Wavo Cloud Platform.
        </p>

        <label className="mt-5 block text-sm font-medium">Email</label>
        <input
          className="mt-1 w-full rounded-xl border bg-background px-3 py-2"
          placeholder="you@label.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="mt-4 block text-sm font-medium">Password</label>
        <input
          className="mt-1 w-full rounded-xl border bg-background px-3 py-2"
          placeholder="Enter a password"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />

        <div className="mt-3 text-center text-xs text-muted-foreground">
          Demo only — no real account is created.
        </div>

        <button type="submit" className="mt-4 w-full rounded-xl bg-foreground px-4 py-2 text-background">
          Continue
        </button>
      </div>
    </form>
  );
}
