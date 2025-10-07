"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SigninPortal() {
  return (
    <div className="w-full max-w-md">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-black text-white grid place-items-center font-black tracking-[0.18em]">W</div>
            <h1 className="mt-2 font-black tracking-[0.35em] text-xl leading-none">WAVO</h1>
            <div className="text-2xl font-semibold mt-2">Welcome</div>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to continue to the signup assistant.
            </p>
          </div>

          <form action="/signup" className="mt-5 grid gap-3">
            <div className="grid gap-1">
              <label className="text-sm font-medium">Email</label>
              <Input name="email" type="email" placeholder="you@company.com" required />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium">Password</label>
              <Input name="password" type="password" placeholder="••••••••" required />
            </div>
            <Button type="submit" className="mt-1">Continue</Button>
            <div className="mt-1 text-xs text-muted-foreground">
              Demo only — no real account is created.
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
