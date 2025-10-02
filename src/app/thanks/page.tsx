export const dynamic = "force-dynamic";

export default function ThanksPage({ searchParams }: { searchParams?: { email?: string } }) {
  const email = searchParams?.email ?? "";
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md card p-8 space-y-4 text-center">
        <div className="h-10 w-10 rounded-full bg-black text-white grid place-items-center mx-auto font-bold">W</div>
        <h1 className="text-2xl font-semibold">You're on the list</h1>
        <p className="text-sm text-gray-600">
          {email ? <>We’ll reach out at <span className="font-medium">{email}</span>.</> : "We’ll be in touch shortly."}
        </p>
        <a href="/" className="btn w-full">Back to home</a>
      </div>
    </main>
  );
}
