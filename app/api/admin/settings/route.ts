import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

function isAdminEmail(email?: string | null) {
  const admin = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
  return !!admin && (email ?? "").toLowerCase().trim() === admin;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const settings = await prisma.tierSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {},
    select: {
      basicPrice: true,
      proPrice: true,
      currency: true,
      razorpayBasicPlanId: true,
      razorpayProPlanId: true
    }
  });

  return NextResponse.json(settings);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!isAdminEmail(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  const basicPrice = Number(body.basicPrice ?? 999);
  const proPrice = Number(body.proPrice ?? 1999);
  const currency = String(body.currency ?? "INR").toUpperCase();

  const razorpayBasicPlanId = String(body.razorpayBasicPlanId ?? "").trim();
  const razorpayProPlanId = String(body.razorpayProPlanId ?? "").trim();

  const updated = await prisma.tierSettings.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      basicPrice,
      proPrice,
      currency,
      razorpayBasicPlanId: razorpayBasicPlanId || null,
      razorpayProPlanId: razorpayProPlanId || null
    },
    update: {
      basicPrice,
      proPrice,
      currency,
      razorpayBasicPlanId: razorpayBasicPlanId || null,
      razorpayProPlanId: razorpayProPlanId || null
    },
    select: {
      basicPrice: true,
      proPrice: true,
      currency: true,
      razorpayBasicPlanId: true,
      razorpayProPlanId: true
    }
  });

  return NextResponse.json(updated);
}
