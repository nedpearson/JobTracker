import { z } from "zod";

function buildDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (raw && raw.trim() !== "") {
    // If it's already a valid Postgres URL, keep it.
    if (/^(postgresql|postgres):\/\//i.test(raw)) return raw;
    // If it's something else (e.g. a platform-specific value), keep it as a last resort.
    // Prisma will throw a clearer error later if it's unusable.
    return raw;
  }

  // Railway Postgres (and many managed Postgres providers) expose discrete PG* env vars.
  // If DATABASE_URL is missing or malformed (e.g. missing scheme), reconstruct it.
  const host =
    process.env.PGHOST ??
    process.env.POSTGRES_HOST ??
    process.env.POSTGRESQL_HOST ??
    process.env.POSTGRES_PRIVATE_HOST;
  const port = process.env.PGPORT ?? process.env.POSTGRES_PORT ?? process.env.POSTGRESQL_PORT ?? "5432";
  const user = process.env.PGUSER ?? process.env.POSTGRES_USER ?? process.env.POSTGRESQL_USER;
  const password = process.env.PGPASSWORD ?? process.env.POSTGRES_PASSWORD ?? process.env.POSTGRESQL_PASSWORD;
  const database = process.env.PGDATABASE ?? process.env.POSTGRES_DB ?? process.env.POSTGRESQL_DB;

  if (!host || !user || !password || !database) {
    // Local dev default (keeps builds from crashing when env vars aren't set).
    return "postgresql://postgres:postgres@localhost:5432/jobtracker?schema=public";
  }

  const u = encodeURIComponent(user);
  const p = encodeURIComponent(password);
  const db = encodeURIComponent(database);
  return `postgresql://${u}:${p}@${host}:${port}/${db}?schema=public`;
}

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
  DATABASE_URL: buildDatabaseUrl(),
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

