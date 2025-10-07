
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SigninPortal() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    router.push(`/signup?email=${encodeURIComponent(email)}`);
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-sm bg-card border rounded-xl p-6 shadow-sm">
        {/* Brand block (centered) */}
        <div className="flex flex-col items-center gap-2 mb-3">
          <div className="h-10 w-10 rounded-full bg-black text-white grid place-items-center font-bold">W</div>
          <div className="text-xl font-semibold tracking-wide">WAVO</div>
        </div>

        <h1 className="text-lg font-semibold text-center">Wavo Signup</h1>
        <p className="text-sm text-muted-foreground text-center mb-4">
          Sign in to continue to signup.
        </p>

        <form onSubmit={onSubmit} className="grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="h-10 w-full rounded-md border px-3 text-sm
                         text-gray-900 dark:text-white
                         placeholder:text-gray-700 dark:placeholder:text-gray-400"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••"
              className="h-10 w-full rounded-md border px-3 text-sm
                         text-gray-900 dark:text-white
                         placeholder:text-gray-700 dark:placeholder:text-gray-400"
            />
          </label>

          <button
            type="submit"
            className="w-full h-10 rounded-md border bg-foreground text-background text-sm font-medium"
          >
            Continue
          </button>

          <div className="mt-1 text-xs text-muted-foreground text-center">
            Demo only — no real account is created.
          </div>
        </form>
      </div>
    </main>
  );
}
