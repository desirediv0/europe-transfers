import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendEmail } from "../config/mailer.js";

const paginateArgs = (page = 1, limit = 20) => {
  return { skip: (page - 1) * limit, take: limit };
};

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  idDocumentUrl: true,
  idDocumentStatus: true,
  isEmailVerified: true,
  rejectionReason: true,
  createdAt: true,
};

export const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const status = req.query.status;

  const where = status ? { idDocumentStatus: status } : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: userSelect,
      orderBy: { createdAt: "desc" },
      ...paginateArgs(page, limit),
    }),
    prisma.user.count({ where }),
  ]);

  return apiResponse(res, 200, "Users retrieved", {
    items: users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const verifyUserDocument = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;

  if (!["VERIFIED", "REJECTED"].includes(status)) {
    throw new ApiError(400, "Status must be VERIFIED or REJECTED");
  }

  if (status === "REJECTED" && (!reason || reason.trim().length === 0)) {
    throw new ApiError(400, "Rejection reason is required");
  }

  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      idDocumentStatus: status,
      rejectionReason: status === "REJECTED" ? reason : null,
    },
    select: userSelect,
  });

  // Send email notification to user
  if (status === "VERIFIED") {
    await sendEmail({
      to: user.email,
      subject: "ID Verified Successfully — Europe Transfers",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:20px;">
          <h2 style="color:#16a34a;">ID Verified!</h2>
          <p>Hi ${user.name},</p>
          <p>Your government ID has been <strong>verified successfully</strong>.</p>
          <p>You can now log in and access all features of Europe Transfers.</p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${process.env.CLIENT_URL}/auth/login" style="display:inline-block;background:#1a1a2e;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">Login Now</a>
          </div>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
          <p style="color:#999;font-size:12px;">Thank you for choosing Europe Transfers.</p>
        </div>
      `,
    });
  } else if (status === "REJECTED") {
    await sendEmail({
      to: user.email,
      subject: "ID Verification Rejected — Europe Transfers",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:20px;">
          <h2 style="color:#dc2626;">ID Verification Rejected</h2>
          <p>Hi ${user.name},</p>
          <p>Unfortunately, your government ID verification was <strong>not approved</strong>.</p>
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:16px 0;">
            <p style="margin:0;font-weight:bold;color:#dc2626;">Reason:</p>
            <p style="margin:8px 0 0 0;color:#7f1d1d;">${reason}</p>
          </div>
          <p>Please re-upload a clear image of your valid government ID (passport, national ID, or driving license).</p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${process.env.CLIENT_URL}/account/upload-id" style="display:inline-block;background:#1a1a2e;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;">Re-upload ID</a>
          </div>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
          <p style="color:#999;font-size:12px;">If you have questions, please contact our support team.</p>
        </div>
      `,
    });
  }

  return apiResponse(res, 200, `User document ${status.toLowerCase()}`, updated);
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: userSelect,
  });
  return apiResponse(res, 200, "User profile retrieved", user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Delete user and all related data (OTPs cascade delete)
  await prisma.user.delete({ where: { id: req.params.id } });

  return apiResponse(res, 200, "User deleted successfully");
});
