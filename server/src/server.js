import "./config/env.config.js";
import app from "./app.js";
import prisma from "./config/db.js";
import env from "./config/env.config.js";

// One-off schema patches that ship in code instead of a separate migration
// step - each is a no-op once already applied (IF NOT EXISTS), so this is
// safe to run on every boot.
const runSchemaPatches = async () => {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "CarType" ADD COLUMN IF NOT EXISTS "luggageCapacity" INTEGER NOT NULL DEFAULT 2`
  );
  // luggageCapacity (a single number) was replaced with free text, so
  // admins can describe mixed bag sizes, e.g. "6 hand bags + 6 mid size
  // luggages" instead of just "6". Carry over any existing numeric value
  // as "<n> bags" before the old column is no longer used.
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "CarType" ADD COLUMN IF NOT EXISTS "luggageInfo" TEXT DEFAULT '2 bags'`
  );
  await prisma.$executeRawUnsafe(
    `UPDATE "CarType" SET "luggageInfo" = "luggageCapacity" || ' bags' WHERE "luggageInfo" = '2 bags' AND "luggageCapacity" IS NOT NULL AND "luggageCapacity" != 2`
  );
};

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");

    await runSchemaPatches();
    console.log("Schema patches applied");

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
