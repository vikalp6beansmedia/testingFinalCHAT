import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

function isAdminEmail(email?: string | null) {
  const admin = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
  const e = (email ?? "").toLowerCase().trim();
  return !!admin && !!e && admin === e;
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!isAdminEmail(session?.user?.email)) return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({
    posts: posts.map((p) => ({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt,
      type: p.type,
      access: p.access,
      price: p.price,
      mediaUrl: p.mediaUrl,
      duration: p.duration,
      createdAt: p.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "forbidden" }, { status: 403 });

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

  const post = await prisma.post.create({
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

  return NextResponse.json({
    ok: true,
    post: {
      id: post.id,
      createdAt: post.createdAt.toISOString(),
    },
  });
}
