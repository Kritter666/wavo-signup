
"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SigninPortal() {
  const router = useRouter();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "").trim();
    router.push(`/signup${email ? `?email=${encodeURIComponent(email)}` : ""}`);
  }

  return (
    <main className="min-h-screen grid place-items-center px-6 py-10">
      <Card className="w-full max-w-xl bg-card/90 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl">
        <CardContent className="p-8">
          {/* Brand header */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full grid place-items-center font-bold
                            bg-primary text-primary-foreground">W</div>
            <div className="text-base font-semibold">Wavo</div>
            <div className="ml-auto text-xs text-muted-foreground">Signup</div>
          </div>

          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Wavo Signup</h1>

          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <label className="grid gap-1">
              <span className="text-sm text-muted-foreground">Email</span>
              <Input
                name="email"
                type="email"
                placeholder="you@label.com"
                className="bg-background/60"
                required
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm text-muted-foreground">Password</span>
              <Input
                name="password"
                type="password"
                placeholder="Enter a password"
                className="bg-background/60"
              />
            </label>

            <div className="text-xs text-muted-foreground">
              Demo only — no real account is created.
            </div>

            <Button type="submit" className="mt-2 h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
