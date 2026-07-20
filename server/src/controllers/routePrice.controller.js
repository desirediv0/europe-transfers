import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getRoutePrices = asyncHandler(async (req, res) => {
  const { routeId } = req.query;

  const where = routeId ? { routeId } : {};

  const routePrices = await prisma.routePrice.findMany({
    where,
    include: { route: { include: { fromLocation: true, toLocation: true } }, carType: true },
    orderBy: { createdAt: "desc" },
  });

  return apiResponse(res, 200, "Route prices retrieved", routePrices);
});

export const getRoutePriceById = asyncHandler(async (req, res) => {
  const routePrice = await prisma.routePrice.findUnique({
    where: { id: req.params.id },
    include: { route: { include: { fromLocation: true, toLocation: true } }, carType: true },
  });
  if (!routePrice) {
    throw new ApiError(404, "Route price not found");
  }
  return apiResponse(res, 200, "Route price retrieved", routePrice);
});

export const upsertRoutePrice = asyncHandler(async (req, res) => {
  const { routeId, carTypeId, price, currency } = req.body;
  if (!routeId || !carTypeId || price == null) {
    throw new ApiError(400, "routeId, carTypeId, and price are required");
  }

  const route = await prisma.route.findUnique({ where: { id: routeId } });
  if (!route) {
    throw new ApiError(404, "Route not found");
  }

  const carType = await prisma.carType.findUnique({ where: { id: carTypeId } });
  if (!carType) {
    throw new ApiError(404, "Car type not found");
  }

  const routePrice = await prisma.routePrice.upsert({
    where: { routeId_carTypeId: { routeId, carTypeId } },
    update: { price, currency: currency || "EUR" },
    create: { routeId, carTypeId, price, currency: currency || "EUR" },
    include: { route: { include: { fromLocation: true, toLocation: true } }, carType: true },
  });

  return apiResponse(res, 201, "Route price saved", routePrice);
});

export const bulkUpsertRoutePrices = asyncHandler(async (req, res) => {
  const { routeId, prices } = req.body;

  if (!routeId || !prices || !Array.isArray(prices)) {
    throw new ApiError(400, "routeId and prices array are required");
  }

  const route = await prisma.route.findUnique({ where: { id: routeId } });
  if (!route) {
    throw new ApiError(404, "Route not found");
  }

  const results = [];
  for (const item of prices) {
    const { carTypeId, price, currency } = item;
    if (!carTypeId || price == null) continue;

    const rp = await prisma.routePrice.upsert({
      where: { routeId_carTypeId: { routeId, carTypeId } },
      update: { price, currency: currency || "EUR" },
      create: { routeId, carTypeId, price, currency: currency || "EUR" },
      include: { carType: true },
    });
    results.push(rp);
  }

  return apiResponse(res, 201, "Route prices saved", results);
});

export const deleteRoutePrice = asyncHandler(async (req, res) => {
  const routePrice = await prisma.routePrice.findUnique({ where: { id: req.params.id } });
  if (!routePrice) {
    throw new ApiError(404, "Route price not found");
  }
  await prisma.routePrice.delete({ where: { id: req.params.id } });
  return apiResponse(res, 200, "Route price deleted");
});
