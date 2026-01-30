import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { verifyPassword } from "@/lib/auth/password";
import type { Adapter } from "next-auth/adapters";
import { ensureDemoSeed, getOrCreateDemoUser } from "@/lib/auth/demo";

const baseAdapter = PrismaAdapter(prisma);
const adapter: Adapter = {
  ...baseAdapter,
  async createSession(session) {
    // IMPORTANT:
    // Do NOT rely on AsyncLocalStorage between Credentials `authorize` and adapter methods.
    // Instead, we persist the remember-me choice on the user record at login.
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { rememberMe: true }
    });

    if (user?.rememberMe === false) {
      const twelveHours = 12 * 60 * 60 * 1000;
      return baseAdapter.createSession!({ ...session, expires: new Date(Date.now() + twelveHours) });
    }

    return baseAdapter.createSession!(session);
  }
};

const providers = [
  Credentials({
    name: "Email & Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      remember: { label: "Remember me", type: "text" },
      demo: { label: "Demo", type: "text" }
    },
    async authorize(credentials) {
      const remember = (credentials?.remember ?? "").toString() === "on";
      const demo = (credentials?.demo ?? "").toString() === "on";

      if (demo) {
        if (env.ALLOW_DEMO_LOGIN !== "true") return null;
        const user = await getOrCreateDemoUser(prisma);
        // Seed only if empty so you can modify demo data later.
        await ensureDemoSeed(prisma, user.id);
        // Persist preference so createSession reads it reliably.
        if (user.rememberMe !== true) {
          await prisma.user.update({ where: { id: user.id }, data: { rememberMe: true } });
        }
        return user;
      }

      const email = (credentials?.email ?? "").toString().trim().toLowerCase();
      const password = (credentials?.password ?? "").toString();
      if (!email || !password) return null;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash) return null;

      const ok = verifyPassword(password, user.passwordHash);
      if (!ok) return null;

      // Persist remember-me preference for this login so the adapter can read it.
      if (user.rememberMe !== remember) {
        await prisma.user.update({
          where: { id: user.id },
          data: { rememberMe: remember }
        });
      }

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
