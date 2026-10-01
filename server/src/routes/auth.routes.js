import { Router } from "express";
import { register, uploadId, uploadDocuments, requestOtp, verifyOtp, login, refresh, logout } from "../controllers/auth.controller.js";
import protectUser from "../middlewares/auth.middleware.js";
import upload, { uploadDocs } from "../middlewares/upload.middleware.js";
import { authRateLimiter, otpRateLimiter } from "../middlewares/rateLimiter.js";
import validate from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

const text = (min, max = 200) => z.string().trim().min(min).max(max);

const registerSchema = z.object({
  // Primary contact + login
  name: text(2, 100),
  email: z.string().trim().email().max(150),
  phone: text(7, 30),
  jobTitle: text(2, 100),
  contactLocation: text(2, 150),
  password: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100),
  // Company information
  companyName: text(2, 150),
  businessType: text(2, 80),
  companyCountry: text(2, 80),
  registrationNumber: text(2, 60),
  vatId: z.string().trim().max(60).optional().or(z.literal("")),
  businessAddress: text(5, 300),
  // Legal / compliance - these must be explicitly true
  confirmAuthorized: z.literal(true, { errorMap: () => ({ message: "You must confirm you are authorized to register this business" }) }),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "You must accept the Terms & Conditions" }) }),
  acceptPrivacy: z.literal(true, { errorMap: () => ({ message: "You must accept the Privacy Policy" }) }),
  commsConsent: z.boolean().optional(),
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
router.post("/upload-documents", protectUser, uploadDocs, uploadDocuments);
router.post("/logout", logout);

export default router;
