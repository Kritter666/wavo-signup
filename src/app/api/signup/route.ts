import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";

function slug(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.fullName || !body?.email || !body?.marketingConsent) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }
    const id = `lead_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const record = {
      id, createdAt: new Date().toISOString(), ...body,
      derived: { subjectSlug: slug(body.primaryArtist || body.fullName), domain: (body.email || "").split("@")[1]?.toLowerCase() || "" },
    };

    const hasKV = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
    if (hasKV) {
      // @ts-ignore minimal typing for MVP
      await kv.hset(id, record);
      await kv.lpush("leads", id);
      return NextResponse.json({ ok: true, id, storage: "kv" }, { status: 200 });
    }

    console.log("LEAD_RECORD", JSON.stringify(record));
    return NextResponse.json({ ok: true, id, storage: "log" }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Unknown error" }, { status: 500 });
  }
}
