import "dotenv/config";
import { defineConfig } from "prisma/config";

function buildDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL?.trim();
  // If it's already a valid Postgres URL, keep it.
  if (raw && /^(postgresql|postgres):\/\//i.test(raw)) return raw;

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
    // If DATABASE_URL exists but isn't a postgres URL (or is empty), keep it as a last resort
    // so Prisma can throw a clearer error.
    if (raw) return raw;
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

