import { NextResponse } from "next/server";
import { getCreatorProfile } from "@/lib/profile";

export async function GET() {
  const profile = await getCreatorProfile();
  return NextResponse.json({ profile });
}
