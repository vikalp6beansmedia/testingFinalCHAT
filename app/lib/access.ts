import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function getAuthedSession() {
  const session = await getServerSession(authOptions);
  const email = (session?.user?.email || "").toLowerCase().trim();
  const uid = (session as any)?.uid as string | undefined;
  let role = String((session as any)?.role || "").toUpperCase();
  let tier = String((session as any)?.tier || "").toUpperCase();

  const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const isAdminEmail = !!adminEmail && email === adminEmail;

  if (!role) role = isAdminEmail ? "ADMIN" : "USER";
  if (!tier) tier = isAdminEmail ? "PRO" : "NONE";

  return { session, uid, role, tier, email: email || null };
}

export function isActiveTier(tier: string) {
  const t = String(tier || "NONE").toUpperCase();
  return t === "BASIC" || t === "PRO";
}

export function isAdminRole(role: string) {
  const r = String(role || "USER").toUpperCase();
  return r === "ADMIN" || r === "CREATOR";
}

export function isSuperAdmin(role: string) {
  return String(role || "USER").toUpperCase() === "ADMIN";
}
