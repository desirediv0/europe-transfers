import rateLimit from "express-rate-limit";

const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100000,
  message: { success: false, message: "Too many requests, please try again later.", data: null },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many requests, please try again later.", data: null },
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: { success: false, message: "Too many OTP requests, please try again later.", data: null },
  standardHeaders: true,
  legacyHeaders: false,
});

export const bookingRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many booking requests, please try again later.", data: null },
  standardHeaders: true,
  legacyHeaders: false,
});

export default globalRateLimiter;
