export const revalidate = 30;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCreatorProfile } from "@/lib/profile";
import { getAuthedSession, isAdminRole } from "@/lib/access";

export async function GET() {
  const profile = await getCreatorProfile();
  return NextResponse.json({ profile });
}

export async function POST(req: Request) {
  const { role } = await getAuthedSession();
  if (!isAdminRole(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const displayName = typeof body.displayName === "string" ? body.displayName : "";
  const tagline = typeof body.tagline === "string" ? body.tagline : "";
  const avatarUrl = body.avatarUrl === null || typeof body.avatarUrl === "string" ? body.avatarUrl : null;
  const bannerUrl = body.bannerUrl === null || typeof body.bannerUrl === "string" ? body.bannerUrl : null;
  let username = typeof body.username === "string"
    ? body.username.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 32)
    : undefined;

  const profile = await prisma.creatorProfile.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", displayName, tagline, avatarUrl, bannerUrl, ...(username ? { username } : {}) },
    update: { displayName, tagline, avatarUrl, bannerUrl, ...(username ? { username } : {}) },
    select: { username: true, displayName: true, tagline: true, avatarUrl: true, bannerUrl: true },
  });

  return NextResponse.json({ ok: true, profile });
}
