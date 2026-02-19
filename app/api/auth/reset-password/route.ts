import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = String(body?.token ?? "").trim();
    const password = String(body?.password ?? "");

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const record = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!record) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }
    if (record.expires < new Date()) {
      await prisma.passwordResetToken.delete({ where: { token } });
      return NextResponse.json({ error: "Reset link has expired. Please request a new one." }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: record.email },
      data: { password: hash },
    });

    // Delete the token (single-use)
    await prisma.passwordResetToken.delete({ where: { token } });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Reset password error:", e);
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 500 });
  }
}
