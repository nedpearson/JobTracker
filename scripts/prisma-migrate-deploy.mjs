import { spawn } from "node:child_process";
import path from "node:path";

// Railway (and some log aggregators) treat stderr as "error" logs.
// Prisma sometimes writes non-error status lines to stderr, so we pipe stderr -> stdout.

const bin = process.platform === "win32" ? "prisma.cmd" : "prisma";
const prismaBin = path.join(process.cwd(), "node_modules", ".bin", bin);

const child = spawn(prismaBin, ["migrate", "deploy"], {
  env: process.env,
  stdio: ["inherit", "inherit", "pipe"],
});

child.stderr.on("data", (chunk) => {
  process.stdout.write(chunk);
});

child.on("error", (err) => {
  console.error(err);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (typeof code === "number") process.exit(code);
  console.error(`Prisma migrate deploy exited via signal ${signal ?? "unknown"}`);
  process.exit(1);
});

