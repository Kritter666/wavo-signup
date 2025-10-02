"use client";

import { useSearchParams } from "next/navigation";

export default function SignupForm() {
  const sp = useSearchParams(); // client-safe
  const prefillEmail = sp.get("email") ?? "";
  const ref = sp.get("ref") ?? "";

  return (
    <div className="w-full max-w-md space-y-4">
      <h2 className="text-xl font-semibold">Signup</h2>

      <form className="space-y-3">
        <label className="block text-sm">
          <span className="block mb-1">Email</span>
          <input
            defaultValue={prefillEmail}
            placeholder="you@label.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
          />
        </label>

        <label className="block text-sm">
          <span className="block mb-1">Referral Code</span>
          <input
            defaultValue={ref}
            placeholder="optional"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
          />
        </label>

        <button
          type="submit"
          className="mt-2 inline-flex h-10 items-center justify-center rounded-lg border border-gray-900 px-4 text-sm font-medium hover:bg-gray-900 hover:text-white"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
