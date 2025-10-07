
import SigninPortal from "./SigninPortal";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page() {
  return (
    <main className="min-h-screen grid place-items-center p-6">
      <SigninPortal />
    </main>
  );
}
