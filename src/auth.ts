import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { verifyPassword } from "@/lib/auth/password";
import { getRememberMe, setRememberMe } from "@/lib/auth/remember";

const baseAdapter = PrismaAdapter(prisma);
const adapter = {
  ...baseAdapter,
  async createSession(session) {
    const rememberMe = getRememberMe();
    if (rememberMe === false) {
      // "Not remembered": shorter session lifetime.
      // (Cookie expiry follows the DB session expiry for database sessions.)
      const twelveHours = 12 * 60 * 60 * 1000;
      return baseAdapter.createSession({
        ...session,
        expires: new Date(Date.now() + twelveHours)
      });
    }
    return baseAdapter.createSession(session);
  }
};

const providers = [
  Credentials({
    name: "Email & Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      remember: { label: "Remember me", type: "text" }
    },
    async authorize(credentials) {
      const remember = (credentials?.remember ?? "").toString() === "on";
      setRememberMe(remember);

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
  adapter,
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

