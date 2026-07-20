import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const paginateArgs = (page = 1, limit = 20) => {
  return { skip: (page - 1) * limit, take: limit };
};

export const getCountries = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const [countries, total] = await Promise.all([
    prisma.country.findMany({ orderBy: { createdAt: "desc" }, ...paginateArgs(page, limit) }),
    prisma.country.count(),
  ]);

  return apiResponse(res, 200, "Countries retrieved", {
    items: countries,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getCountryById = asyncHandler(async (req, res) => {
  const country = await prisma.country.findUnique({ where: { id: req.params.id } });
  if (!country) {
    throw new ApiError(404, "Country not found");
  }
  return apiResponse(res, 200, "Country retrieved", country);
});

export const createCountry = asyncHandler(async (req, res) => {
  const { name, slug } = req.body;
  if (!name || !slug) {
    throw new ApiError(400, "Name and slug are required");
  }

  const existingSlug = await prisma.country.findUnique({ where: { slug } });
  if (existingSlug) {
    throw new ApiError(400, "Slug already exists");
  }

  const country = await prisma.country.create({ data: { name, slug } });
  return apiResponse(res, 201, "Country created", country);
});

export const updateCountry = asyncHandler(async (req, res) => {
  const { name, slug } = req.body;

  const existing = await prisma.country.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Country not found");
  }

  if (slug && slug !== existing.slug) {
    const slugExists = await prisma.country.findUnique({ where: { slug } });
    if (slugExists) {
      throw new ApiError(400, "Slug already exists");
    }
  }

  const country = await prisma.country.update({ where: { id: req.params.id }, data: { name, slug } });
  return apiResponse(res, 200, "Country updated", country);
});

export const deleteCountry = asyncHandler(async (req, res) => {
  const existing = await prisma.country.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Country not found");
  }
  await prisma.country.delete({ where: { id: req.params.id } });
  return apiResponse(res, 200, "Country deleted");
});
