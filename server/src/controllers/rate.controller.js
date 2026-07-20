import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const paginateArgs = (page = 1, limit = 20) => {
  return { skip: (page - 1) * limit, take: limit };
};

export const getRates = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;

  const [rates, total] = await Promise.all([
    prisma.rate.findMany({ include: { vehicle: true }, orderBy: { createdAt: "desc" }, ...paginateArgs(page, limit) }),
    prisma.rate.count(),
  ]);

  return apiResponse(res, 200, "Rates retrieved", {
    items: rates,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getRateById = asyncHandler(async (req, res) => {
  const rate = await prisma.rate.findUnique({ where: { id: req.params.id }, include: { vehicle: true } });
  if (!rate) {
    throw new ApiError(404, "Rate not found");
  }
  return apiResponse(res, 200, "Rate retrieved", rate);
});

export const createRate = asyncHandler(async (req, res) => {
  const { vehicleId, mode, label, price, currency } = req.body;
  if (!vehicleId || !mode || !label || price == null) {
    throw new ApiError(400, "Vehicle ID, mode, label, and price are required");
  }

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found");
  }

  const rate = await prisma.rate.create({
    data: { vehicleId, mode, label, price, currency: currency || "EUR" },
    include: { vehicle: true },
  });
  return apiResponse(res, 201, "Rate created", rate);
});

export const updateRate = asyncHandler(async (req, res) => {
  const { vehicleId, mode, label, price, currency } = req.body;

  const existing = await prisma.rate.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Rate not found");
  }

  const rate = await prisma.rate.update({
    where: { id: req.params.id },
    data: { vehicleId, mode, label, price, currency },
    include: { vehicle: true },
  });
  return apiResponse(res, 200, "Rate updated", rate);
});

export const deleteRate = asyncHandler(async (req, res) => {
  const rate = await prisma.rate.findUnique({ where: { id: req.params.id } });
  if (!rate) {
    throw new ApiError(404, "Rate not found");
  }
  await prisma.rate.delete({ where: { id: req.params.id } });
  return apiResponse(res, 200, "Rate deleted");
});
