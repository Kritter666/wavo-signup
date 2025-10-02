import { NextRequest, NextResponse } from "next/server";

async function getKV() {
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const mod = await import("@vercel/kv");
      return mod.kv;
    }
  } catch (e) {
    // ignore; fall back to console
  }
  return null;
}

type Payload = {
  role: string;
  fullName: string;
  email: string;
  org?: string;
  primaryArtist?: string;
  location?: string;
  website?: string;
  instagram?: string;
  spotify?: string;
  soundcloud?: string;
  useCases: string[];
  notes?: string;
  marketingConsent: boolean;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  referrer?: string | null;
  enriched?: Record<string, unknown>;
  derived?: { subjectSlug?: string; domain?: string };
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Payload;
    if (!body.fullName || !body.email || !body.marketingConsent) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }
    const id = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const record = {
      id,
      createdAt: new Date().toISOString(),
      ...body,
      userAgent: req.headers.get("user-agent") ?? "",
      ip: req.headers.get("x-forwarded-for") ?? "",
    };

    const kv = await getKV();
    if (kv) {
      await kv.hset(id, record as any);
      await kv.lpush("leads", id);
      return NextResponse.json({ ok: true, id, storage: "kv" }, { status: 200 });
    }

    console.log("LEAD_RECORD", JSON.stringify(record));
    return NextResponse.json({ ok: true, id, storage: "log" }, { status: 200 });
  } catch (e: any) {
    console.error("API_SIGNUP_ERROR", e);
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}
