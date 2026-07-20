import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const search = asyncHandler(async (req, res) => {
  const { fromLocationId, toLocationId, passengers } = req.body;

  if (!fromLocationId || !toLocationId) {
    throw new ApiError(400, "fromLocationId and toLocationId are required");
  }

  if (!passengers || passengers < 1) {
    throw new ApiError(400, "passengers must be at least 1");
  }

  if (fromLocationId === toLocationId) {
    throw new ApiError(400, "From and To locations must be different");
  }

  const route = await prisma.route.findUnique({
    where: { fromLocationId_toLocationId: { fromLocationId, toLocationId } },
    include: {
      fromLocation: true,
      toLocation: true,
    },
  });

  if (!route || !route.isActive) {
    return apiResponse(res, 200, "No route found for these locations", {
      route: null,
      cars: [],
    });
  }

  const routePrices = await prisma.routePrice.findMany({
    where: {
      routeId: route.id,
      carType: { isActive: true, seats: { gte: passengers } },
    },
    include: { carType: true },
    orderBy: { price: "asc" },
  });

  const cars = routePrices.map((rp) => ({
    routePriceId: rp.id,
    carType: {
      id: rp.carType.id,
      name: rp.carType.name,
      seats: rp.carType.seats,
      image: rp.carType.image,
      isAC: rp.carType.isAC,
    },
    price: Number(rp.price),
    currency: rp.currency,
  }));

  return apiResponse(res, 200, "Search results", {
    route: {
      id: route.id,
      from: { id: route.fromLocation.id, name: route.fromLocation.name, city: route.fromLocation.city, latitude: route.fromLocation.latitude, longitude: route.fromLocation.longitude },
      to: { id: route.toLocation.id, name: route.toLocation.name, city: route.toLocation.city, latitude: route.toLocation.latitude, longitude: route.toLocation.longitude },
    },
    cars,
  });
});

export const getLocations = asyncHandler(async (req, res) => {
  const locations = await prisma.location.findMany({
    where: { isActive: true },
    orderBy: { city: "asc" },
  });
  return apiResponse(res, 200, "Locations retrieved", locations);
});
