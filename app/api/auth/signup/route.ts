import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").toLowerCase().trim();
    const password = String(body?.password ?? "");
    const name = String(body?.name ?? "").trim();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (exists) return NextResponse.json({ error: "Email already exists" }, { status: 409 });

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hash,
        role: "USER",
        tier: "NONE",
      },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ ok: true, user });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Signup failed" }, { status: 500 });
  }
}
