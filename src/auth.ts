import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

const providers = [];

if (env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/contacts.readonly",
          access_type: "offline",
          prompt: "consent"
        }
      }
    })
  );
}

// Dev-only “demo login” so the app runs without Google setup.
if (process.env.NODE_ENV !== "production" && env.ALLOW_DEV_LOGIN === "true") {
  providers.push(
    Credentials({
      name: "Demo Login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        name: { label: "Name (optional)", type: "text" }
      },
      async authorize(credentials) {
        const email = (credentials?.email ?? "").toString().trim().toLowerCase();
        if (!email) return null;
        const name = (credentials?.name ?? "").toString().trim() || undefined;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return existing;

        const created = await prisma.user.create({
          data: {
            email,
            name
          }
        });
        return created;
      }
    })
  );
}

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

