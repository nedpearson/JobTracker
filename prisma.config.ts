import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    // Use process.env directly so commands like "prisma generate" don't fail if env is missing in CI.
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/jobtracker?schema=public"
  }
});

