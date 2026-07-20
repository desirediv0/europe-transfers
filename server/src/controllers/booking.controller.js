import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getBookings = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const status = req.query.status;
  const skip = (page - 1) * limit;

  const where = status ? { bookingStatus: status } : {};

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      include: {
        route: { include: { fromLocation: true, toLocation: true } },
        carType: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.count({ where }),
  ]);

  return apiResponse(res, 200, "Bookings retrieved", {
    items: bookings,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params.id },
    include: {
      route: { include: { fromLocation: true, toLocation: true } },
      carType: true,
    },
  });
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }
  return apiResponse(res, 200, "Booking retrieved", booking);
});

export const getBookingByPhone = asyncHandler(async (req, res) => {
  const { phone, bookingId } = req.query;

  if (!phone || !bookingId) {
    throw new ApiError(400, "phone and bookingId are required");
  }

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, phone },
    include: {
      route: { include: { fromLocation: true, toLocation: true } },
      carType: true,
    },
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  return apiResponse(res, 200, "Booking retrieved", booking);
});

export const createBooking = asyncHandler(async (req, res) => {
  const {
    routeId,
    carTypeId,
    customerName,
    phone,
    email,
    pickupAddress,
    dropAddress,
    travelDate,
    travelTime,
    pax,
    luggageNotes,
    message,
  } = req.body;

  if (!routeId || !carTypeId || !customerName || !phone || !travelDate || !pax) {
    throw new ApiError(400, "routeId, carTypeId, customerName, phone, travelDate, and pax are required");
  }

  const route = await prisma.route.findUnique({ where: { id: routeId } });
  if (!route) {
    throw new ApiError(404, "Route not found");
  }

  const carType = await prisma.carType.findUnique({ where: { id: carTypeId } });
  if (!carType) {
    throw new ApiError(404, "Car type not found");
  }

  const routePrice = await prisma.routePrice.findUnique({
    where: { routeId_carTypeId: { routeId, carTypeId } },
  });
  if (!routePrice) {
    throw new ApiError(400, "No price set for this car on this route");
  }

  const booking = await prisma.booking.create({
    data: {
      route: { connect: { id: routeId } },
      carType: { connect: { id: carTypeId } },
      customerName,
      phone,
      email: email || null,
      pickupAddress: pickupAddress || "",
      dropAddress: dropAddress || "",
      travelDate: new Date(travelDate),
      travelTime: travelTime || null,
      pax,
      luggageNotes: luggageNotes || null,
      price: routePrice.price,
      currency: routePrice.currency,
      message: message || null,
    },
    include: {
      route: { include: { fromLocation: true, toLocation: true } },
      carType: true,
    },
  });

  return apiResponse(res, 201, "Booking created", booking);
});

export const updateBooking = asyncHandler(async (req, res) => {
  const { bookingStatus, paymentStatus, paymentId } = req.body;

  const existing = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Booking not found");
  }

  const booking = await prisma.booking.update({
    where: { id: req.params.id },
    data: { bookingStatus, paymentStatus, paymentId },
    include: {
      route: { include: { fromLocation: true, toLocation: true } },
      carType: true,
    },
  });
  return apiResponse(res, 200, "Booking updated", booking);
});

export const deleteBooking = asyncHandler(async (req, res) => {
  const existing = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Booking not found");
  }
  await prisma.booking.delete({ where: { id: req.params.id } });
  return apiResponse(res, 200, "Booking deleted");
});
