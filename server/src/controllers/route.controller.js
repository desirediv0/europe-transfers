import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getRoutes = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const [routes, total] = await Promise.all([
    prisma.route.findMany({
      skip,
      take: limit,
      include: { fromLocation: true, toLocation: true, routePrices: { include: { carType: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.route.count(),
  ]);

  return apiResponse(res, 200, "Routes retrieved", {
    items: routes,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getAllRoutes = asyncHandler(async (req, res) => {
  const routes = await prisma.route.findMany({
    where: { isActive: true },
    include: { fromLocation: true, toLocation: true },
    orderBy: { createdAt: "desc" },
  });
  return apiResponse(res, 200, "Routes retrieved", routes);
});

export const getRouteById = asyncHandler(async (req, res) => {
  const route = await prisma.route.findUnique({
    where: { id: req.params.id },
    include: {
      fromLocation: true,
      toLocation: true,
      routePrices: { include: { carType: true } },
    },
  });
  if (!route) {
    throw new ApiError(404, "Route not found");
  }
  return apiResponse(res, 200, "Route retrieved", route);
});

export const createRoute = asyncHandler(async (req, res) => {
  const { fromLocationId, toLocationId } = req.body;
  if (!fromLocationId || !toLocationId) {
    throw new ApiError(400, "fromLocationId and toLocationId are required");
  }

  if (fromLocationId === toLocationId) {
    throw new ApiError(400, "From and To locations must be different");
  }

  const fromLocation = await prisma.location.findUnique({ where: { id: fromLocationId } });
  if (!fromLocation) {
    throw new ApiError(404, "From location not found");
  }

  const toLocation = await prisma.location.findUnique({ where: { id: toLocationId } });
  if (!toLocation) {
    throw new ApiError(404, "To location not found");
  }

  const existing = await prisma.route.findUnique({
    where: { fromLocationId_toLocationId: { fromLocationId, toLocationId } },
  });
  if (existing) {
    throw new ApiError(409, "Route already exists between these locations");
  }

  const route = await prisma.route.create({
    data: { fromLocationId, toLocationId },
    include: { fromLocation: true, toLocation: true },
  });

  return apiResponse(res, 201, "Route created", route);
});

export const updateRoute = asyncHandler(async (req, res) => {
  const { isActive, fromLocationId, toLocationId } = req.body;

  const existing = await prisma.route.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Route not found");
  }

  const data = {};
  if (typeof isActive === "boolean") data.isActive = isActive;

  if (fromLocationId !== undefined || toLocationId !== undefined) {
    const newFrom = fromLocationId || existing.fromLocationId;
    const newTo = toLocationId || existing.toLocationId;

    if (newFrom === newTo) {
      throw new ApiError(400, "From and To locations must be different");
    }

    if (newFrom !== existing.fromLocationId || newTo !== existing.toLocationId) {
      const duplicate = await prisma.route.findUnique({
        where: { fromLocationId_toLocationId: { fromLocationId: newFrom, toLocationId: newTo } },
      });
      if (duplicate && duplicate.id !== existing.id) {
        throw new ApiError(409, "Route already exists between these locations");
      }
      data.fromLocationId = newFrom;
      data.toLocationId = newTo;
    }
  }

  const route = await prisma.route.update({
    where: { id: req.params.id },
    data,
    include: { fromLocation: true, toLocation: true },
  });
  return apiResponse(res, 200, "Route updated", route);
});

export const deleteRoute = asyncHandler(async (req, res) => {
  const route = await prisma.route.findUnique({ where: { id: req.params.id } });
  if (!route) {
    throw new ApiError(404, "Route not found");
  }
  await prisma.route.delete({ where: { id: req.params.id } });
  return apiResponse(res, 200, "Route deleted");
});
