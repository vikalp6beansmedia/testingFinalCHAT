export type PostType = "VIDEO" | "IMAGE";
export type AccessType = "FREE" | "BASIC" | "PRO" | "PAID";

export type Post = {
  id: string;
  title: string;
  excerpt: string;
  type: PostType;
  access: AccessType;
  price: number;
  mediaUrl: string;
  duration?: string | null;
  createdAt: string; // ISO string
};

export function isTierActive(tier: string) {
  const t = String(tier || "NONE").toUpperCase();
  return t === "BASIC" || t === "PRO";
}

export function canAccessPost(postAccess: AccessType, tier: string) {
  const t = String(tier || "NONE").toUpperCase();
  if (postAccess === "FREE") return true;
  if (postAccess === "BASIC") return t === "BASIC" || t === "PRO";
  if (postAccess === "PRO") return t === "PRO";
  // PAID: future per-post payments; for now treat as locked unless PRO
  if (postAccess === "PAID") return t === "PRO";
  return false;
}
