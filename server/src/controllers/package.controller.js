import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const paginateArgs = (page = 1, limit = 20) => {
  return { skip: (page - 1) * limit, take: limit };
};

export const getPackages = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const [packages, total] = await Promise.all([
    prisma.package.findMany({ include: { country: true, itineraryDays: true }, orderBy: { createdAt: "desc" }, ...paginateArgs(page, limit) }),
    prisma.package.count(),
  ]);

  return apiResponse(res, 200, "Packages retrieved", {
    items: packages,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getPackageById = asyncHandler(async (req, res) => {
  const pkg = await prisma.package.findUnique({
    where: { id: req.params.id },
    include: { country: true, itineraryDays: { orderBy: { dayNumber: "asc" } } },
  });
  if (!pkg) {
    throw new ApiError(404, "Package not found");
  }
  return apiResponse(res, 200, "Package retrieved", pkg);
});

export const createPackage = asyncHandler(async (req, res) => {
  const { title, slug, countryId, durationDays, coverImage, summary, priceFrom, isActive } = req.body;
  if (!title || !slug || !countryId || !durationDays) {
    throw new ApiError(400, "Title, slug, country ID, and duration days are required");
  }

  const country = await prisma.country.findUnique({ where: { id: countryId } });
  if (!country) {
    throw new ApiError(404, "Country not found");
  }

  const existingSlug = await prisma.package.findUnique({ where: { slug } });
  if (existingSlug) {
    throw new ApiError(400, "Slug already exists");
  }

  const pkg = await prisma.package.create({
    data: { title, slug, countryId, durationDays, coverImage, summary, priceFrom, isActive },
    include: { country: true },
  });
  return apiResponse(res, 201, "Package created", pkg);
});

export const updatePackage = asyncHandler(async (req, res) => {
  const { title, slug, countryId, durationDays, coverImage, summary, priceFrom, isActive } = req.body;

  const existing = await prisma.package.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Package not found");
  }

  if (slug && slug !== existing.slug) {
    const slugExists = await prisma.package.findUnique({ where: { slug } });
    if (slugExists) {
      throw new ApiError(400, "Slug already exists");
    }
  }

  const pkg = await prisma.package.update({
    where: { id: req.params.id },
    data: { title, slug, countryId, durationDays, coverImage, summary, priceFrom, isActive },
    include: { country: true },
  });
  return apiResponse(res, 200, "Package updated", pkg);
});

export const deletePackage = asyncHandler(async (req, res) => {
  const pkg = await prisma.package.findUnique({ where: { id: req.params.id } });
  if (!pkg) {
    throw new ApiError(404, "Package not found");
  }
  await prisma.package.delete({ where: { id: req.params.id } });
  return apiResponse(res, 200, "Package deleted");
});

export const getItinerary = asyncHandler(async (req, res) => {
  const days = await prisma.itineraryDay.findMany({
    where: { packageId: req.params.id },
    orderBy: { dayNumber: "asc" },
  });
  return apiResponse(res, 200, "Itinerary retrieved", days);
});

export const createItinerary = asyncHandler(async (req, res) => {
  const { dayNumber, title, description } = req.body;
  const { id } = req.params;

  if (!dayNumber || !title || !description) {
    throw new ApiError(400, "Day number, title, and description are required");
  }

  const pkg = await prisma.package.findUnique({ where: { id } });
  if (!pkg) {
    throw new ApiError(404, "Package not found");
  }

  const day = await prisma.itineraryDay.create({ data: { packageId: id, dayNumber, title, description } });
  return apiResponse(res, 201, "Itinerary day created", day);
});

export const updateItinerary = asyncHandler(async (req, res) => {
  const { dayNumber, title, description } = req.body;

  const existing = await prisma.itineraryDay.findUnique({ where: { id: req.params.dayId } });
  if (!existing) {
    throw new ApiError(404, "Itinerary day not found");
  }

  const day = await prisma.itineraryDay.update({
    where: { id: req.params.dayId },
    data: { dayNumber, title, description },
  });
  return apiResponse(res, 200, "Itinerary day updated", day);
});

export const deleteItinerary = asyncHandler(async (req, res) => {
  const existing = await prisma.itineraryDay.findUnique({ where: { id: req.params.dayId } });
  if (!existing) {
    throw new ApiError(404, "Itinerary day not found");
  }
  await prisma.itineraryDay.delete({ where: { id: req.params.dayId } });
  return apiResponse(res, 200, "Itinerary day deleted");
});
