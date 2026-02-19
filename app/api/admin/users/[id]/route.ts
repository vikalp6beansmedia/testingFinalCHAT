import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthedSession, isAdminRole } from "@/lib/access";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { role, uid } = await getAuthedSession();
  if (!isAdminRole(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const data: any = {};

  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (["ADMIN", "CREATOR", "USER"].includes(body.role)) data.role = body.role;
  if (["NONE", "BASIC", "PRO"].includes(body.tier)) data.tier = body.tier;

  // Prevent self-demotion
  if (params.id === uid && data.role && data.role !== "ADMIN") {
    return NextResponse.json({ error: "Cannot demote yourself" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, role: true, tier: true, isActive: true },
  });

  return NextResponse.json({ ok: true, user: updated });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { role, uid } = await getAuthedSession();
  if (!isAdminRole(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (params.id === uid) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
