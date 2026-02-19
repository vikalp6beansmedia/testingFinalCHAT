import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT || 587),
        auth: { user: process.env.EMAIL_SERVER_USER, pass: process.env.EMAIL_SERVER_PASSWORD },
      },
      from: process.env.EMAIL_FROM,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = (creds?.email ?? "").toLowerCase().trim();
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;

        const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
        const adminPassword = String(process.env.ADMIN_PASSWORD ?? "");

        // Admin login
        if (adminEmail && adminPassword && email === adminEmail) {
          if (password !== adminPassword) return null;
          const admin = await prisma.user.upsert({
            where: { email },
            create: { email, name: "Admin", role: "ADMIN", tier: "PRO", lastLoginAt: new Date() },
            update: { role: "ADMIN", lastLoginAt: new Date() },
            select: { id: true, email: true, name: true, isActive: true },
          });
          if (!admin.isActive) return null; // banned
          return { id: admin.id, email: admin.email!, name: admin.name ?? "Admin" };
        }

        // Regular user login
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, password: true, isActive: true },
        });
        if (!user?.password) return null;
        if (!user.isActive) return null; // banned/deactivated

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        // Track last login
        await prisma.user.update({ where: { email }, data: { lastLoginAt: new Date() } });

        return { id: user.id, email: user.email!, name: user.name ?? "User" };
      },
    }),
  ],

  pages: { signIn: "/signin" },

  callbacks: {
    async jwt({ token, user, account }) {
      const email = String(user?.email ?? token?.email ?? "").toLowerCase().trim();
      if (email) {
        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: { tier: true, id: true, role: true, isActive: true },
        });
        if (dbUser && !dbUser.isActive) {
          return { ...token, tier: "NONE", role: "USER", uid: null, deactivated: true };
        }
        (token as any).tier = dbUser?.tier ?? "NONE";
        (token as any).uid = dbUser?.id ?? null;
        (token as any).role = dbUser?.role ?? "USER";
        // Track last login on fresh sign-in (user object present = new sign-in)
        if (user && dbUser?.id) {
          await prisma.user.update({ where: { id: dbUser.id }, data: { lastLoginAt: new Date() } }).catch(() => {});
        }
      }
      return token;
    },

    async session({ session, token }) {
      const uid = (token as any).uid ?? null;
      (session as any).tier = (token as any).tier ?? "NONE";
      (session as any).uid = uid;
      (session as any).role = (token as any).role ?? "USER";
      if (session.user && uid) (session.user as any).id = uid;
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allow relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
};
