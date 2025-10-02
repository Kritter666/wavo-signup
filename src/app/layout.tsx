import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wavo Signup",
  description: "Assistant-led signup playground",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
