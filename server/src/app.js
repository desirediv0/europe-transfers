import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import env from "./config/env.config.js";
import globalRateLimiter from "./middlewares/rateLimiter.js";
import errorMiddleware from "./middlewares/error.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import adminAuthRoutes from "./routes/admin.auth.routes.js";
import adminUserRoutes from "./routes/admin.user.routes.js";
import countryRoutes from "./routes/country.routes.js";
import cityRoutes from "./routes/city.routes.js";
import locationRoutes from "./routes/location.routes.js";
import carTypeRoutes from "./routes/carType.routes.js";
import routeRoutes from "./routes/route.routes.js";
import routePriceRoutes from "./routes/routePrice.routes.js";
import packageRoutes from "./routes/package.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import testimonialRoutes from "./routes/testimonial.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import userRoutes from "./routes/user.routes.js";
import searchRoutes from "./routes/search.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: [env.CLIENT_URL, env.ADMIN_URL],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(globalRateLimiter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use("/uploads", express.static(join(__dirname, "..", "public", "uploads")));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin/auth", adminAuthRoutes);
app.use("/api/v1/admin/users", adminUserRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/countries", countryRoutes);
app.use("/api/v1/cities", cityRoutes);
app.use("/api/v1/locations", locationRoutes);
app.use("/api/v1/car-types", carTypeRoutes);
app.use("/api/v1/routes", routeRoutes);
app.use("/api/v1/route-prices", routePriceRoutes);
app.use("/api/v1/packages", packageRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/testimonials", testimonialRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/search", searchRoutes);

// Webhook needs raw body for signature verification — mount BEFORE json parser
app.post("/api/v1/payments/webhook", express.raw({ type: "application/json" }), (req, res, next) => {
  // Attach parsed body for the webhook handler
  try {
    req.body = JSON.parse(req.body);
  } catch {}
  next();
});
app.use("/api/v1/payments", paymentRoutes);

app.get("/api/v1/health", (req, res) => {
  res.json({ success: true, message: "Server is running", data: null });
});

app.use(errorMiddleware);

export default app;
