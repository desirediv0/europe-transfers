import { Router } from "express";
import { login, refresh, logout, getMe } from "../controllers/admin.auth.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";
import { authRateLimiter } from "../middlewares/rateLimiter.js";
import validate from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", authRateLimiter, validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protectAdmin, getMe);

export default router;
