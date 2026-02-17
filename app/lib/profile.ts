import prisma from "@/lib/prisma";

export type CreatorProfileDTO = {
  displayName: string;
  tagline: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
};

export async function getCreatorProfile(): Promise<CreatorProfileDTO> {
  // Try read first
  const existing = await prisma.creatorProfile.findUnique({
    where: { id: "singleton" },
    select: { displayName: true, tagline: true, avatarUrl: true, bannerUrl: true },
  });

  // If not found, create a neutral empty profile (NO "Preet" in code)
  const p =
    existing ??
    (await prisma.creatorProfile.create({
      data: {
        id: "singleton",
        displayName: "",
        tagline: "",
        avatarUrl: null,
        bannerUrl: null,
      },
      select: { displayName: true, tagline: true, avatarUrl: true, bannerUrl: true },
    }));

  return {
    displayName: p.displayName ?? "",
    tagline: p.tagline ?? "",
    avatarUrl: p.avatarUrl ?? null,
    bannerUrl: p.bannerUrl ?? null,
  };
}
