import SigninPortal from "./SigninPortal";

export default function Home() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md card p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-black text-white grid place-items-center font-bold">W</div>
          <div className="font-semibold">Wavo</div>
          <div className="ml-auto text-xs text-gray-500">Playground</div>
        </div>

        <div>
          <h1 className="text-2xl font-semibold">Wavo Signup</h1>
          <p className="text-sm text-gray-600 mt-1">
          </p>
        </div>

        {/* Email + Password portal */}
        <SigninPortal />
      </div>
    </main>
  );
}
