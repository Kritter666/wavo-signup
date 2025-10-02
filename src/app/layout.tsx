
export const metadata = { title: "Wavo Signup" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{minHeight:"100vh",display:"grid",placeItems:"center",margin:0}}>{children}</body>
    </html>
  );
}
