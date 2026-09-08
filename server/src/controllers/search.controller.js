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
      luggageCapacity: rp.carType.luggageCapacity,
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

// Some cities intentionally have several same-named locations - e.g. many
// "Paris City Center" rows, each paired one-to-one with a different
// destination (the airport, Disneyland, the train station...) instead of
// one shared location reused everywhere. So a single fromLocationId only
// ever reaches ONE destination directly, but the "To" dropdown should
// still offer every destination that city serves overall. This looks up
// destinations reachable from ANY location sharing the given origin's
// name (not just this one row's id), giving the full picture.
export const getDestinationsByName = asyncHandler(async (req, res) => {
  const fromName = req.query.fromName;
  if (!fromName) {
    throw new ApiError(400, "fromName is required");
  }

  const originLocations = await prisma.location.findMany({
    where: { name: fromName, isActive: true },
    select: { id: true },
  });
  if (originLocations.length === 0) {
    return apiResponse(res, 200, "Destinations retrieved", []);
  }

  const routes = await prisma.route.findMany({
    where: { fromLocationId: { in: originLocations.map((l) => l.id) }, isActive: true },
    include: { toLocation: true },
  });

  // De-dupe by destination name - the dropdown shows one entry per
  // distinct place (e.g. one "Paris Disneyland"), not one per row.
  const seen = new Set();
  const destinations = [];
  for (const r of routes) {
    if (!r.toLocation.isActive || seen.has(r.toLocation.name)) continue;
    seen.add(r.toLocation.name);
    destinations.push(r.toLocation);
  }

  return apiResponse(res, 200, "Destinations retrieved", destinations);
});

// The "To" dropdown picks a destination by name, but the specific
// fromLocationId currently selected may not be the one row that actually
// routes to that destination (see getDestinationsByName above). This
// resolves the real (fromLocationId, toLocationId) pair for a given
// (fromName, toName), so the UI can snap "From" to the matching row
// instead of ending up with a mismatched pair that returns no route.
export const resolveLocationPair = asyncHandler(async (req, res) => {
  const { fromName, toName } = req.query;
  if (!fromName || !toName) {
    throw new ApiError(400, "fromName and toName are required");
  }

  const route = await prisma.route.findFirst({
    where: {
      isActive: true,
      fromLocation: { name: fromName, isActive: true },
      toLocation: { name: toName, isActive: true },
    },
    include: { fromLocation: true, toLocation: true },
  });

  if (!route) {
    return apiResponse(res, 200, "No route found for these locations", { route: null });
  }

  return apiResponse(res, 200, "Route found", {
    route: { from: route.fromLocation, to: route.toLocation },
  });
});
