import { Router } from "express";
import { register, uploadId, requestOtp, verifyOtp, login, refresh, logout } from "../controllers/auth.controller.js";
import protectUser from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import { authRateLimiter, otpRateLimiter } from "../middlewares/rateLimiter.js";
import validate from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
});

const otpRequestSchema = z.object({
  email: z.string().email(),
});

const otpVerifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

router.post("/register", authRateLimiter, validate(registerSchema), register);
router.post("/otp/request", otpRateLimiter, validate(otpRequestSchema), requestOtp);
router.post("/otp/verify", otpRateLimiter, validate(otpVerifySchema), verifyOtp);
router.post("/login", otpRateLimiter, validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/upload-id", protectUser, upload.single("file"), uploadId);
router.post("/logout", logout);

export default router;
