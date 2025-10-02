// src/app/signup/SignupForm.tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function SignupForm() {
  const sp = useSearchParams();                 // safe here (client)
  const prefillEmail = sp.get("email") ?? "";
  const ref = sp.get("ref") ?? "";

  return (
    <main style={{ textAlign: "center", padding: 24 }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>
        Signup
      </h2>
      <form
        style={{ display: "inline-grid", gap: 8, minWidth: 320, textAlign: "left" }}
      >
        <label>
          Email
          <input
            defaultValue={prefillEmail}
            placeholder="you@label.com"
            style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 8 }}
          />
        </label>

        <label>
          Referral Code
          <input
            defaultValue={ref}
            placeholder="optional"
            style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 8 }}
          />
        </label>

        <button
          type="submit"
          style={{ marginTop: 8, padding: "8px 14px", borderRadius: 8, border: "1px solid #000" }}
        >
          Continue
        </button>
      </form>
    </main>
  );
}
