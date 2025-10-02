
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-lg space-y-4">
        <h1 className="text-2xl font-semibold">Wavo Signup Playground</h1>
        <p className="text-sm text-gray-600">
          Try a simple assistant-friendly signup flow that can read URL params.
        </p>
        <Link
          href="/signup"
          className="inline-flex h-10 items-center rounded-lg border border-gray-900 px-4 text-sm font-medium hover:bg-gray-900 hover:text-white"
        >
          Go to Signup
        </Link>
      </div>
    </main>
  );
}
