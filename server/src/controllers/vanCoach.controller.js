import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const includeRoutePrices = {
  routePrices: { orderBy: { order: "asc" } },
};

export const getVanCoachVehicles = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.vanCoachVehicle.findMany({
      skip,
      take: limit,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: includeRoutePrices,
    }),
    prisma.vanCoachVehicle.count(),
  ]);

  return apiResponse(res, 200, "Van & Coach vehicles retrieved", {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getAllVanCoachVehicles = asyncHandler(async (req, res) => {
  const search = req.query.search;

  const where = { isActive: true };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const items = await prisma.vanCoachVehicle.findMany({
    where,
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: includeRoutePrices,
  });
  return apiResponse(res, 200, "Van & Coach vehicles retrieved", items);
});

export const getVanCoachVehicleById = asyncHandler(async (req, res) => {
  const item = await prisma.vanCoachVehicle.findUnique({
    where: { id: req.params.id },
    include: includeRoutePrices,
  });
  if (!item) {
    throw new ApiError(404, "Van & Coach vehicle not found");
  }
  return apiResponse(res, 200, "Van & Coach vehicle retrieved", item);
});

export const createVanCoachVehicle = asyncHandler(async (req, res) => {
  const {
    name,
    seats,
    image,
    category,
    description,
    rate8h,
    rate10h,
    overtimeRate,
    currency,
    order,
    routePrices,
  } = req.body;

  if (!name || seats == null || rate8h == null || rate10h == null || overtimeRate == null) {
    throw new ApiError(400, "Name, seats, and rates (8h, 10h, overtime) are required");
  }

  const item = await prisma.vanCoachVehicle.create({
    data: {
      name,
      seats,
      image: image || null,
      category: category || null,
      description: description || null,
      rate8h,
      rate10h,
      overtimeRate,
      currency: currency || "USD",
      order: order ?? 0,
      routePrices:
        Array.isArray(routePrices) && routePrices.length > 0
          ? {
              create: routePrices.map((rp, i) => ({
                group: rp.group,
                label: rp.label,
                price: rp.price,
                order: rp.order ?? i,
              })),
            }
          : undefined,
    },
    include: includeRoutePrices,
  });

  return apiResponse(res, 201, "Van & Coach vehicle created", item);
});

export const updateVanCoachVehicle = asyncHandler(async (req, res) => {
  const {
    name,
    seats,
    image,
    category,
    description,
    rate8h,
    rate10h,
    overtimeRate,
    currency,
    order,
    isActive,
    routePrices,
  } = req.body;

  const existing = await prisma.vanCoachVehicle.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Van & Coach vehicle not found");
  }

  const dataToUpdate = {};
  if (name !== undefined) dataToUpdate.name = name;
  if (seats !== undefined) dataToUpdate.seats = seats;
  if (image !== undefined) dataToUpdate.image = image;
  if (category !== undefined) dataToUpdate.category = category;
  if (description !== undefined) dataToUpdate.description = description;
  if (rate8h !== undefined) dataToUpdate.rate8h = rate8h;
  if (rate10h !== undefined) dataToUpdate.rate10h = rate10h;
  if (overtimeRate !== undefined) dataToUpdate.overtimeRate = overtimeRate;
  if (currency !== undefined) dataToUpdate.currency = currency;
  if (order !== undefined) dataToUpdate.order = order;
  if (isActive !== undefined) dataToUpdate.isActive = isActive;

  if (Array.isArray(routePrices)) {
    await prisma.vanCoachRoutePrice.deleteMany({ where: { vehicleId: req.params.id } });
    if (routePrices.length > 0) {
      dataToUpdate.routePrices = {
        create: routePrices.map((rp, i) => ({
          group: rp.group,
          label: rp.label,
          price: rp.price,
          order: rp.order ?? i,
        })),
      };
    }
  }

  const item = await prisma.vanCoachVehicle.update({
    where: { id: req.params.id },
    data: dataToUpdate,
    include: includeRoutePrices,
  });

  return apiResponse(res, 200, "Van & Coach vehicle updated", item);
});

export const deleteVanCoachVehicle = asyncHandler(async (req, res) => {
  const existing = await prisma.vanCoachVehicle.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Van & Coach vehicle not found");
  }

  await prisma.vanCoachRoutePrice.deleteMany({ where: { vehicleId: req.params.id } });
  await prisma.vanCoachVehicle.delete({ where: { id: req.params.id } });
  return apiResponse(res, 200, "Van & Coach vehicle deleted");
});
