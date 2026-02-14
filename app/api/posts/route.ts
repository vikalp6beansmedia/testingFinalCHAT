import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
