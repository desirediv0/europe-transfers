import "./config/env.config.js";
import app from "./app.js";
import prisma from "./config/db.js";
import env from "./config/env.config.js";

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
