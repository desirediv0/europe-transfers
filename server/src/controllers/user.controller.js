import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";

const paginateArgs = (page = 1, limit = 20) => {
  return { skip: (page - 1) * limit, take: limit };
};

export const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, idDocumentUrl: true, idDocumentStatus: true, isEmailVerified: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      ...paginateArgs(page, limit),
    }),
    prisma.user.count(),
  ]);

  return apiResponse(res, 200, "Users retrieved", {
    items: users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const verifyUserDocument = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["VERIFIED", "REJECTED"].includes(status)) {
    throw new ApiError(400, "Status must be VERIFIED or REJECTED");
  }

  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: { idDocumentStatus: status },
    select: { id: true, name: true, email: true, phone: true, idDocumentUrl: true, idDocumentStatus: true, isEmailVerified: true },
  });

  return apiResponse(res, 200, "User document status updated", updated);
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, phone: true, idDocumentUrl: true, idDocumentStatus: true, isEmailVerified: true },
  });
  return apiResponse(res, 200, "User profile retrieved", user);
});
