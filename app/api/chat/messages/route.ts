import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthedSession, isActiveTier, isAdminRole } from "@/lib/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { uid, tier, role } = await getAuthedSession();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const conversationId = url.searchParams.get("conversationId");
  if (!conversationId) return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });

  const isAdmin = isAdminRole(role);

  const convo = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!convo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!isAdmin) {
    if (!isActiveTier(tier)) return NextResponse.json({ error: "Subscription inactive" }, { status: 403 });
    if (convo.userId !== uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const { uid, tier, role } = await getAuthedSession();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const conversationId = body.conversationId as string | undefined;
  const text = String(body.text || "").trim();

  if (!conversationId || !text) {
    return NextResponse.json({ error: "Missing conversationId/text" }, { status: 400 });
  }

  const isAdmin = isAdminRole(role);

  const convo = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!convo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!isAdmin) {
    if (!isActiveTier(tier)) return NextResponse.json({ error: "Subscription inactive" }, { status: 403 });
    if (convo.userId !== uid) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const msg = await prisma.message.create({
    data: {
      conversationId,
      senderRole: isAdmin ? "ADMIN" : "USER",
      senderId: uid,
      text,
    },
  });

  return NextResponse.json({ ok: true, message: msg });
}
