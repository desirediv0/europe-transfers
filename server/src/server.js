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
