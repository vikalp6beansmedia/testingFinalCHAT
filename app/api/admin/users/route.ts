import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthedSession, isAdminRole } from "@/lib/access";

export async function GET() {
  const { role } = await getAuthedSession();
  if (!isAdminRole(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, email: true, name: true, role: true, tier: true,
      isActive: true, lastLoginAt: true, createdAt: true,
      _count: { select: { subscriptions: true } },
    },
  });

  return NextResponse.json({ users });
}
