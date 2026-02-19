import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthedSession, isAdminRole } from "@/lib/access";

export async function GET() {
  const { role } = await getAuthedSession();
  if (!isAdminRole(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const settings = await prisma.tierSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {},
    select: { basicPrice: true, proPrice: true, currency: true, razorpayBasicPlanId: true, razorpayProPlanId: true }
  });
  return NextResponse.json(settings);
}

export async function POST(req: Request) {
  const { role } = await getAuthedSession();
  if (!isAdminRole(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const basicPrice = Number(body.basicPrice ?? 999);
  const proPrice = Number(body.proPrice ?? 1999);
  const currency = String(body.currency ?? "INR").toUpperCase();
  const razorpayBasicPlanId = String(body.razorpayBasicPlanId ?? "").trim();
  const razorpayProPlanId = String(body.razorpayProPlanId ?? "").trim();

  const updated = await prisma.tierSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", basicPrice, proPrice, currency, razorpayBasicPlanId: razorpayBasicPlanId || null, razorpayProPlanId: razorpayProPlanId || null },
    update: { basicPrice, proPrice, currency, razorpayBasicPlanId: razorpayBasicPlanId || null, razorpayProPlanId: razorpayProPlanId || null },
  });
  return NextResponse.json({ ok: true, settings: updated });
}
