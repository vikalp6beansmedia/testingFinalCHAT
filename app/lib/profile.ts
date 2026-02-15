import prisma from "@/lib/prisma";

export type CreatorProfileDTO = {
  displayName: string;
  tagline: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
};

export async function getCreatorProfile(): Promise<CreatorProfileDTO> {
  const p = await prisma.creatorProfile.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      displayName: "Preet Kohli Uncensored",
      tagline: "Exclusive drops • behind-the-scenes • member-only chat",
    },
    select: { displayName: true, tagline: true, avatarUrl: true, bannerUrl: true },
  });

  return {
    displayName: p.displayName,
    tagline: p.tagline,
    avatarUrl: p.avatarUrl ?? null,
    bannerUrl: p.bannerUrl ?? null,
  };
}
