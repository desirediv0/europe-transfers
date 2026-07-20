import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const paginateArgs = (page = 1, limit = 20) => {
  return { skip: (page - 1) * limit, take: limit };
};

export const getCities = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const [cities, total] = await Promise.all([
    prisma.city.findMany({ include: { country: true }, orderBy: { createdAt: "desc" }, ...paginateArgs(page, limit) }),
    prisma.city.count(),
  ]);

  return apiResponse(res, 200, "Cities retrieved", {
    items: cities,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getCityById = asyncHandler(async (req, res) => {
  const city = await prisma.city.findUnique({ where: { id: req.params.id }, include: { country: true } });
  if (!city) {
    throw new ApiError(404, "City not found");
  }
  return apiResponse(res, 200, "City retrieved", city);
});

export const createCity = asyncHandler(async (req, res) => {
  const { countryId, name, slug, image } = req.body;
  if (!countryId || !name || !slug) {
    throw new ApiError(400, "Country ID, name, and slug are required");
  }

  const country = await prisma.country.findUnique({ where: { id: countryId } });
  if (!country) {
    throw new ApiError(404, "Country not found");
  }

  const existingSlug = await prisma.city.findUnique({ where: { slug } });
  if (existingSlug) {
    throw new ApiError(400, "Slug already exists");
  }

  const city = await prisma.city.create({ data: { countryId, name, slug, image }, include: { country: true } });
  return apiResponse(res, 201, "City created", city);
});

export const updateCity = asyncHandler(async (req, res) => {
  const { countryId, name, slug, image } = req.body;

  const existingCity = await prisma.city.findUnique({ where: { id: req.params.id } });
  if (!existingCity) {
    throw new ApiError(404, "City not found");
  }

  if (slug && slug !== existingCity.slug) {
    const slugExists = await prisma.city.findUnique({ where: { slug } });
    if (slugExists) {
      throw new ApiError(400, "Slug already exists");
    }
  }

  const city = await prisma.city.update({
    where: { id: req.params.id },
    data: { countryId, name, slug, image },
    include: { country: true },
  });
  return apiResponse(res, 200, "City updated", city);
});

export const deleteCity = asyncHandler(async (req, res) => {
  const city = await prisma.city.findUnique({ where: { id: req.params.id } });
  if (!city) {
    throw new ApiError(404, "City not found");
  }
  await prisma.city.delete({ where: { id: req.params.id } });
  return apiResponse(res, 200, "City deleted");
});
