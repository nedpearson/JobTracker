import "dotenv/config";
import { defineConfig } from "prisma/config";

function buildDatabaseUrl(): string {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRESQL_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.POSTGRESQL_URL_NON_POOLING,
    process.env.DATABASE_PRIVATE_URL,
    process.env.DATABASE_PUBLIC_URL
  ]
    .map((v) => v?.trim())
    .filter((v): v is string => Boolean(v));

  // If it's already a valid Postgres URL, keep it.
  for (const c of candidates) {
    if (/^(postgresql|postgres):\/\//i.test(c)) return c;
  }

  // Railway/managed Postgres often expose discrete PG* env vars.
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
    // If we have a non-empty candidate but it's not a postgres:// URL, keep it as a last resort
    // so Prisma can throw a clearer error.
    if (candidates[0]) return candidates[0];
    return "postgresql://postgres:postgres@localhost:5432/jobtracker?schema=public";
  }

  const u = encodeURIComponent(user);
  const p = encodeURIComponent(password);
  const db = encodeURIComponent(database);
  return `postgresql://${u}:${p}@${host}:${port}/${db}?schema=public`;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    // Treat empty/whitespace DATABASE_URL as missing, and reconstruct from PG* vars when present.
    url: buildDatabaseUrl()
  }
});

