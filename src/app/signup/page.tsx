
import { Suspense } from "react";
import SignupForm from "./SignupForm";

// Prevent static prerender problems with useSearchParams
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <SignupForm />
    </Suspense>
  );
}
