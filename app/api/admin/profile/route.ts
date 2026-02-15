import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthedSession, isAdminRole } from "@/lib/access";
import { getCreatorProfile } from "@/lib/profile";

export async function GET() {
  const { role } = await getAuthedSession();
  if (!isAdminRole(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const profile = await getCreatorProfile();
  return NextResponse.json({ profile });
}

export async function POST(req: Request) {
  const { role } = await getAuthedSession();
  if (!isAdminRole(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as any;
  const displayName = typeof body?.displayName === "string" ? body.displayName.slice(0, 80) : undefined;
  const tagline = typeof body?.tagline === "string" ? body.tagline.slice(0, 160) : undefined;
  const avatarUrl = typeof body?.avatarUrl === "string" ? body.avatarUrl.slice(0, 500) : undefined;
  const bannerUrl = typeof body?.bannerUrl === "string" ? body.bannerUrl.slice(0, 500) : undefined;

  const updated = await prisma.creatorProfile.upsert({
    where: { id: "singleton" },
    update: {
      ...(displayName !== undefined ? { displayName } : {}),
      ...(tagline !== undefined ? { tagline } : {}),
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      ...(bannerUrl !== undefined ? { bannerUrl } : {}),
    },
    create: {
      id: "singleton",
      displayName: displayName ?? "Preet Kohli Uncensored",
      tagline: tagline ?? "Exclusive drops • behind-the-scenes • member-only chat",
      avatarUrl: avatarUrl ?? null,
      bannerUrl: bannerUrl ?? null,
    },
    select: { displayName: true, tagline: true, avatarUrl: true, bannerUrl: true },
  });

  return NextResponse.json({ profile: updated });
}
