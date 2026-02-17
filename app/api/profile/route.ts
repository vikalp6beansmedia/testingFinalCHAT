// app/api/profile/route.ts
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adjust if your authOptions path differs
import { prisma } from "@/lib/prisma";
import { getCreatorProfile } from "@/lib/profile";

function isAdmin(session: any) {
  // simplest: admin by email
  const adminEmail = process.env.ADMIN_EMAIL;
  const userEmail = session?.user?.email;
  return !!adminEmail && !!userEmail && adminEmail === userEmail;
}

export async function GET() {
  const profile = await getCreatorProfile();
  return NextResponse.json({ profile });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const displayName = typeof body.displayName === "string" ? body.displayName : "";
  const tagline = typeof body.tagline === "string" ? body.tagline : "";
  const avatarUrl =
    body.avatarUrl === null || typeof body.avatarUrl === "string" ? body.avatarUrl : null;
  const bannerUrl =
    body.bannerUrl === null || typeof body.bannerUrl === "string" ? body.bannerUrl : null;

  const profile = await prisma.creatorProfile.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      displayName,
      tagline,
      avatarUrl,
      bannerUrl,
    },
    update: {
      displayName,
      tagline,
      avatarUrl,
      bannerUrl,
    },
  });

  return NextResponse.json({ ok: true, profile });
}
