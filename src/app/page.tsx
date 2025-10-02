
import Link from "next/link";
export default function Page() {
  return (
    <main style={{textAlign:"center"}}>
      <h1 style={{fontSize:24, fontWeight:600, marginBottom:12}}>Wavo Signup Playground</h1>
      <Link href="/signup" style={{border:"1px solid #000", padding:"8px 14px", borderRadius:8, display:"inline-block"}}>
        Go to Signup
      </Link>
    </main>
  );
}
