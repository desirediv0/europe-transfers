import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadToR2, deleteFromR2 } from "../config/r2.js";
import { sendEmail } from "../config/mailer.js";

const paginateArgs = (page = 1, limit = 20) => ({ skip: (page - 1) * limit, take: limit });

const MIN_IMAGES = 2;
const MAX_IMAGES = 4;

// ─── Step 1: Personal + Vehicle Info ───────────────────

export const saveStep1 = asyncHandler(async (req, res) => {
  const { id, name, email, phone, country, city, vehicleType, vehicleDetails } = req.body;
  if (!name || !email || !phone || !country || !city || !vehicleType) {
    throw new ApiError(400, "Name, email, phone, country, city, and vehicle type are required");
  }

  let application;
  if (id) {
    const existing = await prisma.fleetPartnerApplication.findUnique({ where: { id } });
    if (!existing || existing.status !== "DRAFT") {
      throw new ApiError(404, "Application draft not found");
    }
    application = await prisma.fleetPartnerApplication.update({
      where: { id },
      data: { name, email, phone, country, city, vehicleType, vehicleDetails, step: Math.max(existing.step, 2) },
    });
  } else {
    application = await prisma.fleetPartnerApplication.create({
      data: { name, email, phone, country, city, vehicleType, vehicleDetails, step: 2, status: "DRAFT" },
    });
  }

  return apiResponse(res, 200, "Step 1 saved", application);
});

// ─── Resume a draft ─────────────────────────────────────

export const resumeDraft = asyncHandler(async (req, res) => {
  const { email, phone } = req.body;
  if (!email || !phone) {
    throw new ApiError(400, "Email and phone are required");
  }

  const application = await prisma.fleetPartnerApplication.findFirst({
    where: { email, phone, status: "DRAFT" },
    orderBy: { updatedAt: "desc" },
  });

  if (!application) {
    throw new ApiError(404, "No saved application found for this email and phone");
  }

  return apiResponse(res, 200, "Draft found", application);
});

// ─── Step 2: Image Uploads ──────────────────────────────

export const uploadImages = asyncHandler(async (req, res) => {
  const existing = await prisma.fleetPartnerApplication.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.status !== "DRAFT") {
    throw new ApiError(404, "Application draft not found");
  }
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "At least one image is required");
  }

  const currentImages = Array.isArray(existing.images) ? existing.images : [];
  if (currentImages.length + req.files.length > MAX_IMAGES) {
    throw new ApiError(400, `You can upload a maximum of ${MAX_IMAGES} images`);
  }

  const uploaded = [];
  for (const file of req.files) {
    const key = `fleet-partners/${existing.id}-${Date.now()}-${file.originalname}`;
    const url = await uploadToR2(file, key);
    uploaded.push({ url, key });
  }

  const images = [...currentImages, ...uploaded];
  const application = await prisma.fleetPartnerApplication.update({
    where: { id: existing.id },
    data: { images },
  });

  return apiResponse(res, 200, "Images uploaded", application);
});

export const deleteImage = asyncHandler(async (req, res) => {
  const { key } = req.body;
  if (!key) {
    throw new ApiError(400, "Image key is required");
  }

  const existing = await prisma.fleetPartnerApplication.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.status !== "DRAFT") {
    throw new ApiError(404, "Application draft not found");
  }

  const images = Array.isArray(existing.images) ? existing.images : [];
  const target = images.find((img) => img.key === key);
  if (!target) {
    throw new ApiError(404, "Image not found");
  }

  try {
    await deleteFromR2(target.key);
  } catch (err) {
    console.error("Failed to delete fleet partner image from R2:", err);
  }

  const remaining = images.filter((img) => img.key !== key);
  const application = await prisma.fleetPartnerApplication.update({
    where: { id: existing.id },
    data: { images: remaining },
  });

  return apiResponse(res, 200, "Image removed", application);
});

// ─── Submit ──────────────────────────────────────────────

export const submitApplication = asyncHandler(async (req, res) => {
  const existing = await prisma.fleetPartnerApplication.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.status !== "DRAFT") {
    throw new ApiError(404, "Application draft not found");
  }
  if (!existing.name || !existing.email || !existing.phone || !existing.country || !existing.city || !existing.vehicleType) {
    throw new ApiError(400, "Please complete step 1 before submitting");
  }

  const images = Array.isArray(existing.images) ? existing.images : [];
  if (images.length < MIN_IMAGES) {
    throw new ApiError(400, `Please upload at least ${MIN_IMAGES} vehicle images`);
  }

  const application = await prisma.fleetPartnerApplication.update({
    where: { id: existing.id },
    data: { status: "SUBMITTED", step: 3 },
  });

  const detailsTable = `
    <tr><td style="padding:4px 0;color:#6b7280;">Name</td><td style="padding:4px 0;font-weight:bold;">${application.name}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280;">Email</td><td style="padding:4px 0;">${application.email}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280;">Phone</td><td style="padding:4px 0;">${application.phone}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280;">Country</td><td style="padding:4px 0;">${application.country}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280;">City</td><td style="padding:4px 0;">${application.city}</td></tr>
    <tr><td style="padding:4px 0;color:#6b7280;">Vehicle Type</td><td style="padding:4px 0;">${application.vehicleType}</td></tr>
    ${application.vehicleDetails ? `<tr><td style="padding:4px 0;color:#6b7280;vertical-align:top;">Vehicle Details</td><td style="padding:4px 0;">${application.vehicleDetails}</td></tr>` : ""}
  `;

  try {
    const admins = await prisma.admin.findMany({ select: { email: true } });
    const imagesHtml = images
      .map((img) => `<a href="${img.url}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin:4px;">
        <img src="${img.url}" style="width:100px;height:75px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb;" />
      </a>`)
      .join("");

    const adminHtml = `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1B2A4A;">
      <h2 style="margin:0 0 16px;">New Drive & Fleet Partner Application</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">${detailsTable}</table>
      <p style="margin:20px 0 8px;color:#6b7280;font-size:13px;">Vehicle Photos</p>
      <div>${imagesHtml}</div>
    </div>`;

    await Promise.allSettled(
      admins.map((admin) =>
        sendEmail({ to: admin.email, subject: `New Fleet Partner Application — ${application.name}`, html: adminHtml }).catch((err) =>
          console.error(`Failed to send fleet partner email to ${admin.email}:`, err)
        )
      )
    );

    const applicantHtml = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#1B2A4A;">
      <h2 style="margin:0 0 16px;">Thank You for Applying, ${application.name}!</h2>
      <p style="font-size:14px;line-height:1.6;">
        We've received your application to become a Drive & Fleet Partner with Europe Transfers.
        Our team will carefully review your submission, and you can expect to hear back from us
        within <strong>12–24 hours</strong>.
      </p>
      <p style="font-size:14px;line-height:1.6;">
        Thank you for your interest in partnering with us — we look forward to reviewing your details soon.
      </p>
      <p style="font-size:13px;color:#6b7280;margin-top:24px;">Europe Transfers Partnerships Team</p>
    </div>`;

    await sendEmail({
      to: application.email,
      subject: "Your Europe Transfers Fleet Partner Application Has Been Received",
      html: applicantHtml,
    }).catch((err) => console.error(`Failed to send confirmation email to ${application.email}:`, err));
  } catch (err) {
    console.error("Failed to send fleet partner application emails:", err);
  }

  return apiResponse(res, 200, "Application submitted", application);
});

// ─── Admin ───────────────────────────────────────────────

export const getFleetPartnerApplications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const where = { status: { not: "DRAFT" } };
  if (req.query.status) where.status = req.query.status;

  const [items, total] = await Promise.all([
    prisma.fleetPartnerApplication.findMany({ where, orderBy: { createdAt: "desc" }, ...paginateArgs(page, limit) }),
    prisma.fleetPartnerApplication.count({ where }),
  ]);

  return apiResponse(res, 200, "Applications retrieved", {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const updateFleetPartnerStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const existing = await prisma.fleetPartnerApplication.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Application not found");
  }
  const application = await prisma.fleetPartnerApplication.update({
    where: { id: req.params.id },
    data: { status },
  });
  return apiResponse(res, 200, "Application updated", application);
});

export const deleteFleetPartnerApplication = asyncHandler(async (req, res) => {
  const existing = await prisma.fleetPartnerApplication.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Application not found");
  }

  const images = Array.isArray(existing.images) ? existing.images : [];
  for (const img of images) {
    try {
      await deleteFromR2(img.key);
    } catch (err) {
      console.error(`Failed to delete fleet partner image from R2 for application ${existing.id}:`, err);
    }
  }

  await prisma.fleetPartnerApplication.delete({ where: { id: req.params.id } });
  return apiResponse(res, 200, "Application deleted");
});
