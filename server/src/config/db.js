import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import env from "./env.config.js";

let prisma;

const createPrismaClient = () => {
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

if (env.NODE_ENV === "production") {
  prisma = createPrismaClient();
} else {
  if (!globalThis.__prisma) {
    globalThis.__prisma = createPrismaClient();
  }
  prisma = globalThis.__prisma;
}

export default prisma;
