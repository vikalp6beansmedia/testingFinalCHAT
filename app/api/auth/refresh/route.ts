import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Client will call this after payment success to bust caches.
export async function GET() {
  return NextResponse.json(
    { ok: true, ts: Date.now() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
