import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadToR2 } from "../config/r2.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    throw new ApiError(400, "Email already registered");
  }

  const existingPhone = await prisma.user.findUnique({ where: { phone } });
  if (existingPhone) {
    throw new ApiError(400, "Phone already registered");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash },
    select: { id: true, name: true, email: true, phone: true, idDocumentStatus: true, isEmailVerified: true },
  });

  return apiResponse(res, 201, "Registration successful", user);
});

export const uploadId = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  const key = `id-documents/${req.user.id}-${Date.now()}-${req.file.originalname}`;
  const url = await uploadToR2(req.file, key);

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { idDocumentUrl: url, idDocumentStatus: "PENDING" },
    select: { id: true, name: true, email: true, phone: true, idDocumentUrl: true, idDocumentStatus: true },
  });

  return apiResponse(res, 200, "ID document uploaded", user);
});

export const requestOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(404, "No account found with this email");
  }

  const { generateOtp } = await import("../utils/generateOtp.js");
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRES_MIN, 10) || 5) * 60 * 1000);

  await prisma.otp.create({
    data: { userId: user.id, code, purpose: "LOGIN", expiresAt },
  });

  const { sendEmail } = await import("../config/mailer.js");
  await sendEmail({
    to: email,
    subject: "Your Europe Transfers Login Code",
    html: `<p>Your OTP code is <strong>${code}</strong>. It expires in ${process.env.OTP_EXPIRES_MIN || 5} minutes.</p>`,
  });

  return apiResponse(res, 200, "OTP sent to your email");
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(404, "No account found with this email");
  }

  const otp = await prisma.otp.findFirst({
    where: { userId: user.id, code, purpose: "LOGIN", consumed: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  await prisma.otp.update({ where: { id: otp.id }, data: { consumed: true } });

  const { signAccessToken, signRefreshToken, setAccessCookie, setRefreshCookie } = await import("../utils/tokens.js");
  const accessToken = signAccessToken({ id: user.id });
  const refreshToken = signRefreshToken({ id: user.id });

  setAccessCookie(res, accessToken);
  setRefreshCookie(res, refreshToken);

  return apiResponse(res, 200, "Login successful", {
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    accessToken,
    refreshToken,
  });
});

export const logout = asyncHandler(async (req, res) => {
  const { clearAuthCookies } = await import("../utils/tokens.js");
  clearAuthCookies(res);
  return apiResponse(res, 200, "Logged out successfully");
});
