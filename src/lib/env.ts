import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  // Auth.js/NextAuth reads these directly from process.env, but we keep them here
  // so deployments fail fast if you choose to validate them later.
  AUTH_URL: z.string().optional().default(""),
  AUTH_TRUST_HOST: z.string().optional().default(""),
  AUTH_GOOGLE_ID: z.string().optional().default(""),
  AUTH_GOOGLE_SECRET: z.string().optional().default(""),
  OPENAI_API_KEY: z.string().optional().default(""),
  OPENAI_MODEL: z.string().optional().default("gpt-4o-mini"),
  SERPAPI_API_KEY: z.string().optional().default(""),
  ALLOW_DEV_LOGIN: z.string().optional().default("true"),
  // Allows anyone to one-click into a seeded demo account from /signin.
  // Set to "false" if you don't want public demo access.
  ALLOW_DEMO_LOGIN: z.string().optional().default("true")
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_URL: process.env.AUTH_URL,
  AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  SERPAPI_API_KEY: process.env.SERPAPI_API_KEY,
  ALLOW_DEV_LOGIN: process.env.ALLOW_DEV_LOGIN,
  ALLOW_DEMO_LOGIN: process.env.ALLOW_DEMO_LOGIN
});

