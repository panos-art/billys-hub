import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import type { Role } from "@/app/generated/prisma/client";

const isDev = process.env.NODE_ENV === "development";

const providers: any[] = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
];

// Dev-only credentials provider for testing without Google OAuth
if (isDev) {
  providers.push(
    Credentials({
      id: "dev-login",
      name: "Dev Login",
      credentials: {
        email: { label: "Email", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const email = credentials.email as string;

        // Only allow existing seeded users
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, name: true, email: true, image: true },
        });

        return user;
      },
    })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  session: {
    strategy: isDev ? "jwt" : "database",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Skip domain check for dev login
      if (account?.provider === "dev-login") return true;

      const email = user.email;
      if (!email || !email.endsWith("@billys.gr")) {
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token, user }) {
      // For JWT sessions (dev mode)
      const userId = token?.id ?? user?.id;
      if (!userId) return session;

      const dbUser = await prisma.user.findUnique({
        where: { id: userId as string },
        select: {
          id: true,
          role: true,
          departmentId: true,
          isActive: true,
        },
      });

      if (dbUser && !dbUser.isActive) {
        return { ...session, user: { ...session.user, isActive: false } };
      }

      session.user.id = userId as string;
      session.user.role = dbUser?.role ?? "EMPLOYEE";
      session.user.departmentId = dbUser?.departmentId ?? null;

      return session;
    },
  },
});

export async function getSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireRole(roles: Role[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role as Role)) {
    throw new Error("Forbidden");
  }
  return session;
}

export function canManageLeaves(
  userRole: string,
  userDepartmentId: string | null,
  targetDepartmentId: string | null
): boolean {
  if (userRole === "SUPER_ADMIN" || userRole === "HR_ADMIN") return true;
  if (userRole === "MANAGER" && userDepartmentId === targetDepartmentId)
    return true;
  return false;
}
