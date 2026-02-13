import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthedSession, isActiveTier } from "@/lib/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { uid, tier } = await getAuthedSession();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isActiveTier(tier)) {
    return NextResponse.json({ error: "Subscription inactive" }, { status: 403 });
  }

  const convo =
    (await prisma.conversation.findUnique({ where: { userId: uid } })) ??
    (await prisma.conversation.create({ data: { userId: uid } }));

  return NextResponse.json({ conversationId: convo.id });
}
