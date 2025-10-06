
// src/app/SigninPortal.tsx
import Brand from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function SigninPortal() {
  return (
    <div className="min-h-[70vh] grid place-items-center">
      <Card className="w-full max-w-lg rounded-2xl border border-border shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Brand className="h-7 text-foreground" />
          </div>

          <div className="text-center mt-4">
            <h1 className="text-2xl font-semibold tracking-tight">Welcome</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Log in to Wavo to continue to Wavo Cloud Platform.
            </p>
          </div>

          <form
            className="mt-6 grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const email = (form.elements.namedItem("email") as HTMLInputElement)?.value;
              window.location.href = `/signup?email=${encodeURIComponent(email || "")}`;
            }}
          >
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Email</label>
              <Input name="email" type="email" placeholder="you@label.com" required />
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Password</label>
              <Input name="password" type="password" placeholder="Enter a password" />
              <div className="mt-1 text-xs text-muted-foreground">
                Demo only — no real account is created.
              </div>
            </div>

            <Button type="submit" className="mt-2 w-full">Continue</Button>

            <div className="text-xs text-center text-muted-foreground mt-2">
              or <Link href="/signup" className="underline underline-offset-4">go straight to signup</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
