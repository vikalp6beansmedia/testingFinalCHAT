export type PostType = "VIDEO" | "IMAGE";
export type AccessType = "FREE" | "BASIC" | "PRO" | "PAID";

export type PostDTO = {
  id: string;
  title: string;
  excerpt: string;
  type: PostType;
  access: AccessType;
  price: number;
  mediaUrl: string;
  duration?: string | null;
  createdAt: string; // ISO
};

export function isTierActive(tier: string) {
  const t = String(tier || "NONE").toUpperCase();
  return t === "BASIC" || t === "PRO";
}

export function canAccessPost(access: AccessType, tier: string) {
  const t = String(tier || "NONE").toUpperCase();
  if (access === "FREE") return true;
  if (access === "BASIC") return t === "BASIC" || t === "PRO";
  if (access === "PRO") return t === "PRO";
  // PAID is future per-post payments. For now, keep it locked unless PRO.
  if (access === "PAID") return t === "PRO";
  return false;
}
