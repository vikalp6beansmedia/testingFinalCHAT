import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Always respond with success (don't reveal if email exists)
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, password: true },
    });

    // Only send reset if user has a password account
    if (user?.password) {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

      await prisma.passwordResetToken.create({
        data: { email, token, expires },
      });

      const origin =
        (process.env.NEXTAUTH_URL || "").replace(/\/+$/, "") ||
        "http://localhost:3000";
      const resetUrl = `${origin}/reset-password?token=${token}`;

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT || 587),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || "noreply@creatorfarm.app",
        to: email,
        subject: "Reset your password",
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
            <h2>Reset your password</h2>
            <p>Hi ${user.name || "there"},</p>
            <p>You requested a password reset. Click the button below to set a new password. This link expires in 1 hour.</p>
            <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#0b0f1d;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">
              Reset Password
            </a>
            <p style="margin-top:24px;color:#666;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Forgot password error:", e);
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 500 });
  }
}
