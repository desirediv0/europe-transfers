import { config } from "dotenv";
import { resolve } from "path";
import { defineConfig } from "prisma/config";

const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.local";
config({ path: resolve(__dirname, envFile) });

export default defineConfig({
  earlyAccess: true,
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
