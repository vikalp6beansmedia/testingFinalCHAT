export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getAuthedSession, isAdminRole } from "@/lib/access";
import prisma from "@/lib/prisma";

async function uploadToCloudinary(file: File, folder: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Missing Cloudinary env vars");
  }

  // Signed upload (secure)
  const timestamp = Math.floor(Date.now() / 1000);
  const crypto = await import("crypto");
  const signature = crypto
    .createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Cloudinary upload failed: ${txt}`);
  }

  const json: any = await res.json();
  return json.secure_url as string;
}

export async function POST(req: Request) {
  const session = await getAuthedSession();
  if (!session?.user || !isAdminRole(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const kind = (formData.get("kind") as string | null) ?? "avatar"; // "avatar" | "banner"

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const url = await uploadToCloudinary(
    file,
    kind === "banner" ? "creatorfarm/banner" : "creatorfarm/avatar"
  );

  // Ensure profile exists
  const existing = await prisma.creatorProfile.findFirst();
  const profile = existing
    ? await prisma.creatorProfile.update({
        where: { id: existing.id },
        data: kind === "banner" ? { bannerUrl: url } : { avatarUrl: url },
      })
    : await prisma.creatorProfile.create({
        data: kind === "banner" ? { bannerUrl: url } : { avatarUrl: url },
      });

  return NextResponse.json({ ok: true, url, profile });
}
