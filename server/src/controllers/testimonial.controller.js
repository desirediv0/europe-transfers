import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const paginateArgs = (page = 1, limit = 20) => {
  return { skip: (page - 1) * limit, take: limit };
};

export const getTestimonials = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const where = req.admin ? {} : { isPublished: true };

  const [testimonials, total] = await Promise.all([
    prisma.testimonial.findMany({ where, orderBy: { createdAt: "desc" }, ...paginateArgs(page, limit) }),
    prisma.testimonial.count({ where }),
  ]);

  return apiResponse(res, 200, "Testimonials retrieved", {
    items: testimonials,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getTestimonialById = asyncHandler(async (req, res) => {
  const testimonial = await prisma.testimonial.findUnique({ where: { id: req.params.id } });
  if (!testimonial) {
    throw new ApiError(404, "Testimonial not found");
  }
  return apiResponse(res, 200, "Testimonial retrieved", testimonial);
});

export const createTestimonial = asyncHandler(async (req, res) => {
  const { name, rating, message, isPublished } = req.body;
  if (!name || !rating || !message) {
    throw new ApiError(400, "Name, rating, and message are required");
  }

  const testimonial = await prisma.testimonial.create({ data: { name, rating, message, isPublished } });
  return apiResponse(res, 201, "Testimonial created", testimonial);
});

export const updateTestimonial = asyncHandler(async (req, res) => {
  const { name, rating, message, isPublished } = req.body;

  const existing = await prisma.testimonial.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Testimonial not found");
  }

  const testimonial = await prisma.testimonial.update({
    where: { id: req.params.id },
    data: { name, rating, message, isPublished },
  });
  return apiResponse(res, 200, "Testimonial updated", testimonial);
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
  const existing = await prisma.testimonial.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Testimonial not found");
  }
  await prisma.testimonial.delete({ where: { id: req.params.id } });
  return apiResponse(res, 200, "Testimonial deleted");
});
