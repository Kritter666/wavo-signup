"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignupForm() {
  const sp = useSearchParams();
  const prefillEmail = sp.get("email") ?? "";
  const ref = sp.get("ref") ?? "";

  return (
    <div className="w-full max-w-md card p-8 space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-black text-white grid place-items-center font-bold">W</div>
        <div className="font-semibold">Wavo</div>
        <div className="ml-auto text-xs text-gray-500">Signup</div>
      </div>

      <h2 className="text-xl font-semibold">Get started</h2>
      <p className="text-sm text-gray-600">Tell us how to reach you. You can paste a referral code if you have one.</p>

      <form className="space-y-4">
        <label className="label">Email
          <input
            defaultValue={prefillEmail}
            placeholder="you@label.com"
            className="input"
            type="email"
          />
        </label>

        <label className="label">Referral Code
          <input
            defaultValue={ref}
            placeholder="optional"
            className="input"
          />
        </label>

        <button type="submit" className="btn btn-primary w-full">Continue</button>
      </form>

      <div className="text-center">
        <Link href="/" className="text-sm text-gray-600 hover:underline">← Back to home</Link>
      </div>
    </div>
  );
}
