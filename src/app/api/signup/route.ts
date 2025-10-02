
import { NextResponse } from "next/server";
let kv: any = null;

// Lazy import @vercel/kv only if env is configured (avoids build issues)
async function getKV() {
  if (kv) return kv;
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const mod = await import("@vercel/kv");
    kv = mod;
    return kv;
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, ref, utm, consentMarketing, ts } = body ?? {};
    if (!email || typeof email !== "string") {
      return NextResponse.json({ ok: false, error: "email required" }, { status: 400 });
    }

    const record = {
      email,
      ref: ref ?? "",
      utm: utm ?? {},
      consentMarketing: !!consentMarketing,
      userAgent: req.headers.get("user-agent") ?? "",
      createdAt: ts ? new Date(ts).toISOString() : new Date().toISOString(),
    };

    // Try KV (optional)
    const KV = await getKV();
    if (KV?.kv) {
      const key = `signup:${Date.now()}:${Math.random().toString(36).slice(2,8)}`;
      await KV.kv.hset(key, record as any);
    } else {
      // Fallback: just log (visible in Vercel logs)
      console.log("SIGNUP_RECORD", record);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("API_SIGNUP_ERROR", e);
    return NextResponse.json({ ok: false }, { status: 200 }); // still let client redirect
  }
}
