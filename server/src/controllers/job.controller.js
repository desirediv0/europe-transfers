import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadToR2, deleteFromR2 } from "../config/r2.js";
import { sendEmail } from "../config/mailer.js";

const paginateArgs = (page = 1, limit = 20) => ({ skip: (page - 1) * limit, take: limit });

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const uniqueSlug = async (title) => {
  const base = slugify(title);
  let slug = base;
  let i = 1;
  while (await prisma.job.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
};

// ─── Jobs ───────────────────────────────────────────────

export const getJobs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      ...paginateArgs(page, limit),
    }),
    prisma.job.count({ where: { isActive: true } }),
  ]);

  return apiResponse(res, 200, "Jobs retrieved", {
    items: jobs,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getAdminJobs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { _count: { select: { applications: true } } },
      ...paginateArgs(page, limit),
    }),
    prisma.job.count(),
  ]);

  return apiResponse(res, 200, "Jobs retrieved", {
    items: jobs,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getJobBySlug = asyncHandler(async (req, res) => {
  const job = await prisma.job.findUnique({ where: { slug: req.params.slug } });
  if (!job || !job.isActive) {
    throw new ApiError(404, "Job not found");
  }
  return apiResponse(res, 200, "Job retrieved", job);
});

export const createJob = asyncHandler(async (req, res) => {
  const { title, location, type, description, isActive, order } = req.body;
  if (!title || !location || !type || !description) {
    throw new ApiError(400, "Title, location, type, and description are required");
  }

  const slug = await uniqueSlug(title);
  const job = await prisma.job.create({
    data: { title, slug, location, type, description, isActive, order },
  });
  return apiResponse(res, 201, "Job created", job);
});

export const updateJob = asyncHandler(async (req, res) => {
  const { title, location, type, description, isActive, order } = req.body;

  const existing = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Job not found");
  }

  let slug = existing.slug;
  if (title && title !== existing.title) {
    slug = await uniqueSlug(title);
  }

  const job = await prisma.job.update({
    where: { id: req.params.id },
    data: { title, slug, location, type, description, isActive, order },
  });
  return apiResponse(res, 200, "Job updated", job);
});

export const deleteJob = asyncHandler(async (req, res) => {
  const existing = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Job not found");
  }

  const applications = await prisma.jobApplication.findMany({ where: { jobId: req.params.id } });
  for (const app of applications) {
    try {
      await deleteFromR2(app.cvKey);
    } catch (err) {
      console.error(`Failed to delete CV from R2 for application ${app.id}:`, err);
    }
  }

  await prisma.job.delete({ where: { id: req.params.id } });
  return apiResponse(res, 200, "Job deleted");
});

// ─── Applications ───────────────────────────────────────

export const applyToJob = asyncHandler(async (req, res) => {
  const { name, email, phone, coverNote } = req.body;
  if (!name || !email || !phone) {
    throw new ApiError(400, "Name, email, and phone are required");
  }
  if (!req.file) {
    throw new ApiError(400, "CV file is required");
  }

  const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });
  if (!job || !job.isActive) {
    throw new ApiError(404, "Job not found");
  }

  const cvKey = `cvs/${job.id}-${Date.now()}-${req.file.originalname}`;
  const cvUrl = await uploadToR2(req.file, cvKey);

  const application = await prisma.jobApplication.create({
    data: { jobId: job.id, name, email, phone, coverNote, cvUrl, cvKey },
  });

  try {
    const admins = await prisma.admin.findMany({ select: { email: true } });
    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: `New Job Application — ${job.title}`,
        html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:20px;">
          <h2>New Job Application</h2>
          <p><strong>Job:</strong> ${job.title}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          ${coverNote ? `<p><strong>Cover Note:</strong> ${coverNote}</p>` : ""}
          <p><a href="${cvUrl}" target="_blank">View CV</a></p>
        </div>`,
      });
    }
  } catch (err) {
    console.error("Failed to send job application email:", err);
  }

  return apiResponse(res, 201, "Application submitted", application);
});

export const getJobApplications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const where = {};
  if (req.query.jobId) where.jobId = req.query.jobId;
  if (req.query.status) where.status = req.query.status;

  const [items, total] = await Promise.all([
    prisma.jobApplication.findMany({
      where,
      include: { job: { select: { title: true, slug: true } } },
      orderBy: { createdAt: "desc" },
      ...paginateArgs(page, limit),
    }),
    prisma.jobApplication.count({ where }),
  ]);

  return apiResponse(res, 200, "Applications retrieved", {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const existing = await prisma.jobApplication.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Application not found");
  }
  const application = await prisma.jobApplication.update({
    where: { id: req.params.id },
    data: { status },
  });
  return apiResponse(res, 200, "Application updated", application);
});

export const deleteJobApplication = asyncHandler(async (req, res) => {
  const existing = await prisma.jobApplication.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Application not found");
  }

  try {
    await deleteFromR2(existing.cvKey);
  } catch (err) {
    console.error(`Failed to delete CV from R2 for application ${existing.id}:`, err);
  }

  await prisma.jobApplication.delete({ where: { id: req.params.id } });
  return apiResponse(res, 200, "Application deleted");
});
