
"use client";

import { useRouter } from "next/navigation";
import Brand from "@/components/Brand";

export default function SigninPortal() {
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    // pass email down to signup for prefill
    router.push(`/signup?email=${encodeURIComponent(email)}`);
  }

  return (
    <main className="min-h-screen grid place-items-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card text-card-foreground shadow p-8">
        <div className="text-center mb-6">
          <Brand className="h-10 mx-auto mb-3" />
          <h1 className="text-2xl font-semibold">Welcome</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Log in to Wavo to continue to Wavo Cloud Platform.
          </p>
        </div>

        <form onSubmit={onSubmit} className="grid gap-4">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Email</span>
            <input
              name="email"
              type="email"
              placeholder="you@label.com"
              required
              className="h-10 rounded-md border px-3 outline-none bg-background"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Password</span>
            <input
              name="password"
              type="password"
              placeholder="Enter a password"
              className="h-10 rounded-md border px-3 outline-none bg-background"
            />
          </label>

          <div className="mt-1 text-xs text-muted-foreground text-center">
            Demo only — no real account is created.
          </div>

          <button
            type="submit"
            className="h-10 rounded-md bg-foreground text-background font-medium hover:opacity-90"
          >
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}
