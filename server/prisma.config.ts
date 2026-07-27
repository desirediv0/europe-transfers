import { config } from "dotenv";
import { resolve } from "path";
import { defineConfig } from "prisma/config";
import fs from "fs";

const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.local";
const targetEnvPath = resolve(__dirname, envFile);

if (fs.existsSync(targetEnvPath)) {
  config({ path: targetEnvPath });
} else {
  config({ path: resolve(__dirname, ".env") });
}

export default defineConfig({
  earlyAccess: true,
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "node ./prisma/seed.js",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
