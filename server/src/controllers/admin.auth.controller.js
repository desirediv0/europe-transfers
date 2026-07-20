import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken, setAccessCookie, setRefreshCookie, clearAuthCookies } from "../utils/tokens.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = signAccessToken({ id: admin.id, role: admin.role });
  const refreshToken = signRefreshToken({ id: admin.id, role: admin.role });

  setAccessCookie(res, accessToken);
  setRefreshCookie(res, refreshToken);

  return apiResponse(res, 200, "Login successful", {
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    accessToken,
    refreshToken,
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    throw new ApiError(401, "Refresh token not found");
  }

  const decoded = verifyRefreshToken(token);

  const admin = await prisma.admin.findUnique({
    where: { id: decoded.id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!admin) {
    throw new ApiError(401, "Admin not found");
  }

  const accessToken = signAccessToken({ id: admin.id, role: admin.role });
  setAccessCookie(res, accessToken);

  return apiResponse(res, 200, "Token refreshed", { accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookies(res);
  return apiResponse(res, 200, "Logged out successfully");
});

export const getMe = asyncHandler(async (req, res) => {
  return apiResponse(res, 200, "Admin profile retrieved", req.admin);
});
