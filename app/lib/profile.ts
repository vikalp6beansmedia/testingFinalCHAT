import prisma from "@/lib/prisma";

export type CreatorProfileDTO = {
  displayName: string;
  tagline: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
};

export async function getCreatorProfile(): Promise<CreatorProfileDTO> {
  const p = await prisma.creatorProfile.findUnique({
    where: { id: "singleton" },
    select: { displayName: true, tagline: true, avatarUrl: true, bannerUrl: true },
  });

  if (!p) {
    return { displayName: "", tagline: "", avatarUrl: null, bannerUrl: null };
  }

  return {
    displayName: p.displayName ?? "",
    tagline: p.tagline ?? "",
    avatarUrl: p.avatarUrl ?? null,
    bannerUrl: p.bannerUrl ?? null,
  };
}
