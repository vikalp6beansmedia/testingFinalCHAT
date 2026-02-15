export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getCreatorProfile } from "@/lib/profile";

export async function GET() {
  const profile = await getCreatorProfile();
  return NextResponse.json({ profile });
}
