export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthedSession, isAdminRole } from "@/lib/access";

export async function GET() {
  try {
    const profile = await prisma.creatorProfile.findFirst();
    return NextResponse.json(profile ?? {});
  } catch (err) {
    console.error("Profile GET error:", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAuthedSession();

    if (!session?.user || !isAdminRole(session.user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const displayName = body.displayName ?? "";
    const tagline = body.tagline ?? "";

    // Check if profile exists
    const existing = await prisma.creatorProfile.findFirst();

    let profile;

    if (existing) {
      profile = await prisma.creatorProfile.update({
        where: { id: existing.id },
        data: {
          displayName,
          tagline,
        },
      });
    } else {
      profile = await prisma.creatorProfile.create({
        data: {
          displayName,
          tagline,
        },
      });
    }

    return NextResponse.json({ ok: true, profile });
  } catch (err) {
    console.error("Profile POST error:", err);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
