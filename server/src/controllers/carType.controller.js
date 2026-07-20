import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getCarTypes = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const [carTypes, total] = await Promise.all([
    prisma.carType.findMany({ skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.carType.count(),
  ]);

  return apiResponse(res, 200, "Car types retrieved", {
    items: carTypes,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getAllCarTypes = asyncHandler(async (req, res) => {
  const carTypes = await prisma.carType.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return apiResponse(res, 200, "Car types retrieved", carTypes);
});

export const getCarTypeById = asyncHandler(async (req, res) => {
  const carType = await prisma.carType.findUnique({ where: { id: req.params.id } });
  if (!carType) {
    throw new ApiError(404, "Car type not found");
  }
  return apiResponse(res, 200, "Car type retrieved", carType);
});

export const createCarType = asyncHandler(async (req, res) => {
  const { name, seats, image, isAC, isWiFi, isLuggage, isChildSeat, isVIP, isPetFriendly } = req.body;
  if (!name || seats == null) {
    throw new ApiError(400, "Name and seats are required");
  }

  const carType = await prisma.carType.create({
    data: {
      name, seats, image: image || null,
      isAC: isAC !== false,
      isWiFi: isWiFi === true,
      isLuggage: isLuggage !== false,
      isChildSeat: isChildSeat === true,
      isVIP: isVIP === true,
      isPetFriendly: isPetFriendly === true,
    },
  });
  return apiResponse(res, 201, "Car type created", carType);
});

export const updateCarType = asyncHandler(async (req, res) => {
  const { name, seats, image, isAC, isWiFi, isLuggage, isChildSeat, isVIP, isPetFriendly, isActive } = req.body;

  const existing = await prisma.carType.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Car type not found");
  }

  const carType = await prisma.carType.update({
    where: { id: req.params.id },
    data: { name, seats, image, isAC, isWiFi, isLuggage, isChildSeat, isVIP, isPetFriendly, isActive },
  });
  return apiResponse(res, 200, "Car type updated", carType);
});

export const deleteCarType = asyncHandler(async (req, res) => {
  const carType = await prisma.carType.findUnique({ where: { id: req.params.id } });
  if (!carType) {
    throw new ApiError(404, "Car type not found");
  }
  await prisma.carType.delete({ where: { id: req.params.id } });
  return apiResponse(res, 200, "Car type deleted");
});
