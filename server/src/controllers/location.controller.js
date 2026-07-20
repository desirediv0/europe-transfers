import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getLocations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const search = req.query.search || "";
  const skip = (page - 1) * limit;

  const where = search
    ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { city: { contains: search, mode: "insensitive" } }] }
    : {};

  const [locations, total] = await Promise.all([
    prisma.location.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.location.count({ where }),
  ]);

  return apiResponse(res, 200, "Locations retrieved", {
    items: locations,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getAllLocations = asyncHandler(async (req, res) => {
  const locations = await prisma.location.findMany({
    where: { isActive: true },
    orderBy: { city: "asc" },
  });
  return apiResponse(res, 200, "Locations retrieved", locations);
});

export const getLocationById = asyncHandler(async (req, res) => {
  const location = await prisma.location.findUnique({ where: { id: req.params.id } });
  if (!location) {
    throw new ApiError(404, "Location not found");
  }
  return apiResponse(res, 200, "Location retrieved", location);
});

export const createLocation = asyncHandler(async (req, res) => {
  const { name, city, latitude, longitude } = req.body;
  if (!name || !city) {
    throw new ApiError(400, "Name and city are required");
  }

  const location = await prisma.location.create({
    data: { name, city, latitude: latitude || null, longitude: longitude || null },
  });
  return apiResponse(res, 201, "Location created", location);
});

export const updateLocation = asyncHandler(async (req, res) => {
  const { name, city, latitude, longitude, isActive } = req.body;

  const existing = await prisma.location.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Location not found");
  }

  const location = await prisma.location.update({
    where: { id: req.params.id },
    data: { name, city, latitude, longitude, isActive },
  });
  return apiResponse(res, 200, "Location updated", location);
});

export const deleteLocation = asyncHandler(async (req, res) => {
  const location = await prisma.location.findUnique({ where: { id: req.params.id } });
  if (!location) {
    throw new ApiError(404, "Location not found");
  }
  await prisma.location.delete({ where: { id: req.params.id } });
  return apiResponse(res, 200, "Location deleted");
});
