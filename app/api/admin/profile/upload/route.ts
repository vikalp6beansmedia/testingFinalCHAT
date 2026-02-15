import { NextResponse } from "next/server";
import { getAuthedSession, isAdminRole } from "@/lib/access";
import prisma from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";

function safeExt(mime: string, filename: string) {
  const byMime: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const ext = byMime[mime] || (filename.split(".").pop() || "").toLowerCase();
  if (["jpg", "jpeg", "png", "webp"].includes(ext)) return ext === "jpeg" ? "jpg" : ext;
  return "png";
}

export async function POST(req: Request) {
  const { role } = await getAuthedSession();
  if (!isAdminRole(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const form = await req.formData();
  const kind = String(form.get("kind") || "").toLowerCase();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });
  if (kind !== "avatar" && kind !== "banner") return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only images allowed" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  // 5MB safety cap
  if (bytes.length > 5 * 1024 * 1024) return NextResponse.json({ error: "Max 5MB" }, { status: 400 });

  const ext = safeExt(file.type, file.name || "upload.png");
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });

  const stamp = Date.now();
  const rand = Math.random().toString(16).slice(2, 8);
  const filename = `${kind}-${stamp}-${rand}.${ext}`;
  const filepath = path.join(dir, filename);
  await fs.writeFile(filepath, bytes);

  const url = `/uploads/${filename}`;
  const updated = await prisma.creatorProfile.upsert({
    where: { id: "singleton" },
    update: kind === "avatar" ? { avatarUrl: url } : { bannerUrl: url },
    create: {
      id: "singleton",
      displayName: "Preet Kohli Uncensored",
      tagline: "Exclusive drops • behind-the-scenes • member-only chat",
      avatarUrl: kind === "avatar" ? url : null,
      bannerUrl: kind === "banner" ? url : null,
    },
    select: { displayName: true, tagline: true, avatarUrl: true, bannerUrl: true },
  });

  return NextResponse.json({ ok: true, url, profile: updated });
}
