const { execSync } = require("child_process");

async function main() {
  const dbUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.DIRECT_URL;

  if (!dbUrl || dbUrl.includes("localhost:5432")) {
    console.log("[auto-migrate] Skipping schema push: DATABASE_URL is localhost or unset.");
    return;
  }

  // Ensure DATABASE_URL is explicitly set in env if it came from an alternate env name
  if (!process.env.DATABASE_URL && dbUrl) {
    process.env.DATABASE_URL = dbUrl;
  }

  console.log("[auto-migrate] Detected remote database. Pushing Prisma schema to cloud database...");
  try {
    execSync("npx prisma db push --accept-data-loss --skip-generate", {
      stdio: "inherit",
      env: process.env,
    });
    console.log("[auto-migrate] Database schema synchronized successfully!");

    try {
      console.log("[auto-migrate] Ensuring initial seed data exists...");
      execSync("npx tsx prisma/seed.ts", {
        stdio: "inherit",
        env: process.env,
      });
      console.log("[auto-migrate] Seed completed.");
    } catch (seedErr) {
      console.log("[auto-migrate] Seed step notice:", seedErr.message || seedErr);
    }
  } catch (err) {
    console.error("[auto-migrate] Warning: Unable to sync database schema during build:", err.message || err);
  }
}

main();
