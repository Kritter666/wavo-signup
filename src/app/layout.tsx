
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wavo Signup",
  description: "Join Wavo — assistant-friendly, privacy-respecting signup.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}>
        {/* Brand glow background */}
        <div className="pointer-events-none fixed inset-0 -z-10
                        bg-[radial-gradient(60%_40%_at_50%_0%,_#1e40af22,_transparent_60%),
                            radial-gradient(35%_25%_at_85%_10%,_#22d3ee11,_transparent_60%)]" />
        {children}
      </body>
    </html>
  );
}
