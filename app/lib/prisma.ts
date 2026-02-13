// app/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

/**
 * Vercel serverless + Neon pooler:
 * - Reuse Prisma client across invocations (global singleton)
 * - Ensure pgbouncer params are present to avoid connection "Closed" / churn
 */

function withPgbouncer(url: string) {
  if (!url) return url;

  // If params already exist, don't duplicate
  const hasPgbouncer = url.includes("pgbouncer=true");
  const hasConnLimit = url.includes("connection_limit=");

  // Only append params if missing
  const joiner = url.includes("?") ? "&" : "?";
  let out = url;

  if (!hasPgbouncer) out += `${joiner}pgbouncer=true`;
  // After adding first param, joiner becomes &
  const joiner2 = out.includes("?") ? "&" : "?";
  if (!hasConnLimit) out += `${joiner2}connection_limit=1`;

  return out;
}

const databaseUrl = withPgbouncer(process.env.DATABASE_URL || "");

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
    datasourceUrl: databaseUrl || undefined,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
