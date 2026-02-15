import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthedSession, isActiveTier } from "@/lib/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns the latest ADMIN message timestamp for the authenticated user's conversation.
// Client uses this + localStorage lastSeenAt to show a red-dot unread badge.
export async function GET() {
  const { uid, tier } = await getAuthedSession();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Keep same gating as chat: only paid users have chat.
  if (!isActiveTier(tier)) {
    return NextResponse.json({ latestAdminAt: null });
  }

  const convo = await prisma.conversation.findUnique({ where: { userId: uid } });
  if (!convo) return NextResponse.json({ latestAdminAt: null });

  const latest = await prisma.message.findFirst({
    where: { conversationId: convo.id, senderRole: "ADMIN" },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  return NextResponse.json({ latestAdminAt: latest?.createdAt?.toISOString?.() ?? null });
}
