import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const paginateArgs = (page = 1, limit = 20) => {
  return { skip: (page - 1) * limit, take: limit };
};

export const getVehicles = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({ include: { city: true }, orderBy: { createdAt: "desc" }, ...paginateArgs(page, limit) }),
    prisma.vehicle.count(),
  ]);

  return apiResponse(res, 200, "Vehicles retrieved", {
    items: vehicles,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id }, include: { city: true } });
  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }
  return apiResponse(res, 200, "Vehicle retrieved", vehicle);
});

export const createVehicle = asyncHandler(async (req, res) => {
  const { cityId, name, type, seatsMin, seatsMax, luggageMin, luggageMax, image } = req.body;
  if (!cityId || !name || !type || seatsMin == null || seatsMax == null || luggageMin == null || luggageMax == null) {
    throw new ApiError(400, "All fields are required");
  }

  const city = await prisma.city.findUnique({ where: { id: cityId } });
  if (!city) {
    throw new ApiError(404, "City not found");
  }

  const vehicle = await prisma.vehicle.create({
    data: { cityId, name, type, seatsMin, seatsMax, luggageMin, luggageMax, image },
    include: { city: true },
  });
  return apiResponse(res, 201, "Vehicle created", vehicle);
});

export const updateVehicle = asyncHandler(async (req, res) => {
  const { cityId, name, type, seatsMin, seatsMax, luggageMin, luggageMax, image } = req.body;

  const existing = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Vehicle not found");
  }

  const vehicle = await prisma.vehicle.update({
    where: { id: req.params.id },
    data: { cityId, name, type, seatsMin, seatsMax, luggageMin, luggageMax, image },
    include: { city: true },
  });
  return apiResponse(res, 200, "Vehicle updated", vehicle);
});

export const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }
  await prisma.vehicle.delete({ where: { id: req.params.id } });
  return apiResponse(res, 200, "Vehicle deleted");
});
