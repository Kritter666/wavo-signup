"use client";

import Brand from "@/components/Brand";

export default function SigninPortal() {
  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-center mb-6">
        <div className="h-10 w-10 rounded-full bg-black text-white grid place-items-center font-bold">W</div>
      </div>

      <div className="text-center mb-2">
        <h1 className="text-2xl font-semibold">Welcome</h1>
        <div className="mt-1 flex items-center justify-center gap-2">
          <Brand className="h-6" />
        </div>
      </div>

      <form
        className="mt-6 grid gap-3 rounded-xl border p-4"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget as HTMLFormElement;
          const email = (form.elements.namedItem("email") as HTMLInputElement)?.value || "";
          // go straight to /signup and pass email through so we don't ask again
          window.location.href = `/signup?email=${encodeURIComponent(email)}`;
        }}
      >
        <div className="grid gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            // 👇 darker input text + darker placeholder
            className="h-11 w-full rounded-md border px-3 text-[15px] text-gray-900 placeholder:text-gray-600 dark:text-white dark:placeholder:text-gray-400"
            placeholder="you@company.com"
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            // 👇 darker input text + darker placeholder
            className="h-11 w-full rounded-md border px-3 text-[15px] text-gray-900 placeholder:text-gray-600 dark:text-white dark:placeholder:text-gray-400"
            placeholder="Enter password"
          />
        </div>

        <button
          type="submit"
          className="mt-1 h-10 rounded-md border px-4 font-medium hover:bg-gray-50 active:opacity-90"
        >
          Continue
        </button>

        <div className="mt-1 text-xs text-gray-500">
          Demo only — no real account is created.
        </div>
      </form>
    </div>
  );
}
