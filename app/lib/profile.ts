import prisma from "@/lib/prisma";

export type CreatorProfileDTO = {
  username: string;
  displayName: string;
  tagline: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
};

export async function getCreatorProfile(): Promise<CreatorProfileDTO> {
  const p = await prisma.creatorProfile.findUnique({
    where: { id: "singleton" },
    select: { username: true, displayName: true, tagline: true, avatarUrl: true, bannerUrl: true },
  });

  if (!p) return { username: "creator", displayName: "", tagline: "", avatarUrl: null, bannerUrl: null };

  return {
    username: p.username ?? "creator",
    displayName: p.displayName ?? "",
    tagline: p.tagline ?? "",
    avatarUrl: p.avatarUrl ?? null,
    bannerUrl: p.bannerUrl ?? null,
  };
}
