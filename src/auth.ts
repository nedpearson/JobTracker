import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { verifyPassword } from "@/lib/auth/password";

const providers = [
  Credentials({
    name: "Email & Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      const email = (credentials?.email ?? "").toString().trim().toLowerCase();
      const password = (credentials?.password ?? "").toString();
      if (!email || !password) return null;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash) return null;

      const ok = verifyPassword(password, user.passwordHash);
      if (!ok) return null;

      return user;
    }
  })
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: env.AUTH_SECRET,
  session: { strategy: "database" },
  pages: {
    signIn: "/signin"
  },
  providers,
  callbacks: {
    session({ session, user }) {
      // make userId available in server routes
      if (session.user) (session.user as unknown as { id: string }).id = user.id;
      return session;
    }
  }
});

