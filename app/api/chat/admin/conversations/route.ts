import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthedSession, isAdminRole } from "@/lib/access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { uid, role } = await getAuthedSession();
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdminRole(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const convos = await prisma.conversation.findMany({
    include: { user: true },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return NextResponse.json({
    conversations: convos.map((c) => ({
      id: c.id,
      userId: c.userId,
      email: c.user.email,
      name: c.user.name,
      updatedAt: c.updatedAt,
    })),
  });
}
