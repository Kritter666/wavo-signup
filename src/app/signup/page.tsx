import { Suspense } from "react";
import SignupForm from "./SignupForm";

// Avoid static prerender issues with useSearchParams
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <Suspense fallback={<div>Loading…</div>}>
        <SignupForm />
      </Suspense>
    </main>
  );
}
