import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthedSession, isActiveTier } from "@/lib/access";

export async function GET() {
  const { tier, role } = await getAuthedSession();
  const isAdmin = role === "ADMIN" || role === "CREATOR";
  const isPaid = isActiveTier(tier);

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    posts: posts.map(p => {
      const canAccess = isAdmin || isPaid ||
        p.access === "FREE" ||
        (p.access === "BASIC" && (tier === "BASIC" || tier === "PRO")) ||
        (p.access === "PRO" && tier === "PRO");

      return {
        id: p.id,
        title: p.title,
        excerpt: p.excerpt,
        type: p.type,
        access: p.access,
        price: p.price,
        // Only send real mediaUrl if they can access it — else send placeholder
        mediaUrl: canAccess ? p.mediaUrl : "",
        duration: p.duration,
        createdAt: p.createdAt.toISOString(),
      };
    }),
  });
}
