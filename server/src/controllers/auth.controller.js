import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadToR2 } from "../config/r2.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendEmail } from "../config/mailer.js";
import { signAccessToken, signRefreshToken, setAccessCookie, setRefreshCookie, clearAuthCookies } from "../utils/tokens.js";

const OTP_EXPIRES_MIN = parseInt(process.env.OTP_EXPIRES_MIN, 10) || 5;

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  idDocumentUrl: true,
  idDocumentStatus: true,
  isEmailVerified: true,
  rejectionReason: true,
};

// ─── Register ────────────────────────────────────────────
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
    select: userSelect,
  });

  // Auto-send OTP after registration
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRES_MIN * 60 * 1000);

  await prisma.otp.create({
    data: { userId: user.id, code, purpose: "VERIFY_EMAIL", expiresAt },
  });

  await sendEmail({
    to: email,
    subject: "Verify Your Email — Europe Transfers",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:20px;">
        <h2 style="color:#1a1a2e;">Welcome to Europe Transfers!</h2>
        <p>Hi ${name},</p>
        <p>Your verification code is:</p>
        <div style="text-align:center;margin:24px 0;">
          <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1a1a2e;background:#f5f5f5;padding:12px 24px;border-radius:8px;">${code}</span>
        </div>
        <p style="color:#666;">This code expires in ${OTP_EXPIRES_MIN} minutes.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p style="color:#999;font-size:12px;">If you didn't create an account, please ignore this email.</p>
      </div>
    `,
  });

  return apiResponse(res, 201, "Registration successful. Please verify your email.", {
    user,
    otpSent: true,
  });
});

// ─── Request OTP (for login or re-send) ──────────────────
export const requestOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(404, "No account found with this email");
  }

  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRES_MIN * 60 * 1000);

  await prisma.otp.create({
    data: { userId: user.id, code, purpose: "LOGIN", expiresAt },
  });

  await sendEmail({
    to: email,
    subject: "Your Europe Transfers Login Code",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:20px;">
        <h2 style="color:#1a1a2e;">Login Verification</h2>
        <p>Hi ${user.name},</p>
        <p>Your OTP code is:</p>
        <div style="text-align:center;margin:24px 0;">
          <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#1a1a2e;background:#f5f5f5;padding:12px 24px;border-radius:8px;">${code}</span>
        </div>
        <p style="color:#666;">This code expires in ${OTP_EXPIRES_MIN} minutes.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p style="color:#999;font-size:12px;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });

  return apiResponse(res, 200, "OTP sent to your email");
});

// ─── Verify OTP (email verification after register) ──────
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(404, "No account found with this email");
  }

  const otp = await prisma.otp.findFirst({
    where: {
      userId: user.id,
      code,
      consumed: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  await prisma.otp.update({ where: { id: otp.id }, data: { consumed: true } });

  // Mark email as verified
  if (!user.isEmailVerified) {
    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    });
  }

  // Check user verification status
  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: userSelect,
  });

  // Issue tokens for ALL steps so user can access upload-id endpoint
  const accessToken = signAccessToken({ id: user.id });
  const refreshToken = signRefreshToken({ id: user.id });
  setAccessCookie(res, accessToken);
  setRefreshCookie(res, refreshToken);

  let verificationStep;
  let message;

  if (!updatedUser.idDocumentUrl) {
    verificationStep = "UPLOAD_ID";
    message = "Email verified. Please upload your government ID.";
  } else if (updatedUser.idDocumentStatus === "PENDING") {
    verificationStep = "PENDING_REVIEW";
    message = "Email verified. Your ID is under review.";
  } else if (updatedUser.idDocumentStatus === "REJECTED") {
    verificationStep = "ID_REJECTED";
    message = "Email verified. Your ID was rejected.";
  } else {
    verificationStep = "VERIFIED";
    message = "Login successful";
  }

  return apiResponse(res, 200, message, {
    user: updatedUser,
    verificationStep,
    accessToken,
    refreshToken,
  });
});

// ─── Login (check verification status) ───────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(404, "No account found with this email");
  }

  const otp = await prisma.otp.findFirst({
    where: {
      userId: user.id,
      code,
      consumed: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  await prisma.otp.update({ where: { id: otp.id }, data: { consumed: true } });

  // Mark email as verified if not already
  if (!user.isEmailVerified) {
    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true },
    });
  }

  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: userSelect,
  });

  // Issue tokens for ALL steps so user can access upload-id endpoint
  const accessToken = signAccessToken({ id: user.id });
  const refreshToken = signRefreshToken({ id: user.id });
  setAccessCookie(res, accessToken);
  setRefreshCookie(res, refreshToken);

  let verificationStep;
  let message;

  if (!updatedUser.idDocumentUrl) {
    verificationStep = "UPLOAD_ID";
    message = "Please upload your government ID to continue.";
  } else if (updatedUser.idDocumentStatus === "PENDING") {
    verificationStep = "PENDING_REVIEW";
    message = "Your ID verification is under review (12-24 hours).";
  } else if (updatedUser.idDocumentStatus === "REJECTED") {
    verificationStep = "ID_REJECTED";
    message = `Your ID was rejected: ${updatedUser.rejectionReason || "Please re-upload"}`;
  } else {
    verificationStep = "VERIFIED";
    message = "Login successful";
  }

  return apiResponse(res, 200, message, {
    user: updatedUser,
    verificationStep,
    accessToken,
    refreshToken,
  });
});

// ─── Upload Government ID ────────────────────────────────
export const uploadId = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded. Please select your government ID image.");
  }

  const key = `uploads/id-${req.user.id}-${Date.now()}-${req.file.originalname}`;
  const url = await uploadToR2(req.file, key);

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      idDocumentUrl: url,
      idDocumentStatus: "PENDING",
      rejectionReason: null,
    },
    select: userSelect,
  });

  // Notify admin about new ID verification request
  const adminEmails = await prisma.admin.findMany({
    select: { email: true },
  });

  for (const admin of adminEmails) {
    await sendEmail({
      to: admin.email,
      subject: `New ID Verification Request — ${user.name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:20px;">
          <h2 style="color:#1a1a2e;">New ID Verification Request</h2>
          <p>A new user has uploaded their government ID for verification.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${user.name}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${user.email}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;">${user.phone}</td></tr>
          </table>
          <p>Please review this ID in the admin panel.</p>
        </div>
      `,
    });
  }

  return apiResponse(res, 200, "ID document uploaded. Verification will be completed within 12-24 hours.", user);
});

// ─── Refresh Token ───────────────────────────────────────
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    throw new ApiError(401, "Refresh token not found");
  }

  const { verifyRefreshToken } = await import("../utils/tokens.js");
  const decoded = verifyRefreshToken(token);

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: userSelect,
  });

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  const accessToken = signAccessToken({ id: user.id });
  setAccessCookie(res, accessToken);

  return apiResponse(res, 200, "Token refreshed", { user, accessToken });
});

// ─── Logout ──────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  clearAuthCookies(res);
  return apiResponse(res, 200, "Logged out successfully");
});
