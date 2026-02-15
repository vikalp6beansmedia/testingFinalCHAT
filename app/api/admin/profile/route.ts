export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthedSession } from "@/lib/access";

export async function GET() {
  const profile = await prisma.creatorProfile.findFirst();
  return NextResponse.json(profile ?? {});
}

export async function POST(req: Request) {
  const auth = await getAuthedSession();

  if (!auth || auth.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { displayName, tagline } = body;

  const existing = await prisma.creatorProfile.findFirst();

  const profile = existing
    ? await prisma.creatorProfile.update({
        where: { id: existing.id },
        data: { displayName, tagline },
      })
    : await prisma.creatorProfile.create({
        data: { displayName, tagline },
      });

  return NextResponse.json({ ok: true, profile });
}
