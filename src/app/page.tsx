import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Wavo Signup Playground</h1>
      <a href="/signup"><Button>Go to Signup</Button></a>
    </main>
  );
}
