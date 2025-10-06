import { Suspense } from "react";
import SignupPageClient from "./SignupPageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
        <SignupPageClient />
      </Suspense>
    </main>
  );
}
