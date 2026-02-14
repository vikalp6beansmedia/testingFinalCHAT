import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthedSession, isAdminRole } from "@/lib/access";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { role } = await getAuthedSession();
  if (!isAdminRole(role)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({
    post: {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      type: post.type,
      access: post.access,
      price: post.price,
      mediaUrl: post.mediaUrl,
      duration: post.duration,
      createdAt: post.createdAt.toISOString(),
    },
  });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { role } = await getAuthedSession();
  if (!isAdminRole(role)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json();

  const title = String(body?.title ?? "").trim();
  const excerpt = String(body?.excerpt ?? "").trim();
  const type = String(body?.type ?? "VIDEO").toUpperCase();
  const access = String(body?.access ?? "FREE").toUpperCase();
  const price = Number(body?.price ?? 0) || 0;
  const mediaUrl = String(body?.mediaUrl ?? "").trim();
  const duration = body?.duration ? String(body.duration).trim() : null;

  if (!title || !excerpt || !mediaUrl) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await prisma.post.update({
    where: { id: params.id },
    data: {
      title,
      excerpt,
      type: type as any,
      access: access as any,
      price,
      mediaUrl,
      duration,
    },
  });

  return NextResponse.json({ ok: true });
}
