import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function getAuthedSession() {
  const session = await getServerSession(authOptions);
  const uid = (session as any)?.uid as string | undefined;
  const role = String((session as any)?.role || "USER");
  const tier = String((session as any)?.tier || "NONE");
  const email = session?.user?.email || null;
  return { session, uid, role, tier, email };
}

export function isActiveTier(tier: string) {
  const t = String(tier || "NONE").toUpperCase();
  return t === "BASIC" || t === "PRO";
}

export function isAdminRole(role: string) {
  return String(role || "USER").toUpperCase() === "ADMIN";
}
