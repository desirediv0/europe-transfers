import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendEmail } from "../config/mailer.js";

export const getMyBookings = asyncHandler(async (req, res) => {
  const phone = req.user.phone;
  const email = req.user.email;

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { phone: { equals: phone } },
        { email: { equals: email } },
      ],
    },
    include: {
      route: { include: { fromLocation: true, toLocation: true } },
      carType: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return apiResponse(res, 200, "My bookings retrieved", {
    items: bookings,
    pagination: { page: 1, limit: bookings.length, total: bookings.length, pages: 1 },
  });
});

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

export const cancelBooking = asyncHandler(async (req, res) => {
  const { reason, notes } = req.body;
  const bookingId = req.params.id;

  const existing = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      route: { include: { fromLocation: true, toLocation: true } },
      carType: true,
    },
  });

  if (!existing) {
    throw new ApiError(404, "Booking not found");
  }

  // Check ownership
  const isOwner = existing.phone === req.user.phone || existing.email === req.user.email;
  if (!isOwner) {
    throw new ApiError(403, "You are not authorized to cancel this booking");
  }

  const cancelReasonText = `${reason || "Other"}${notes ? ` - ${notes}` : ""}`;

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      bookingStatus: "CANCELLED",
      message: existing.message ? `${existing.message} | Cancellation reason: ${cancelReasonText}` : `Cancellation reason: ${cancelReasonText}`,
    },
    include: {
      route: { include: { fromLocation: true, toLocation: true } },
      carType: true,
    },
  });

  // Send Email Notification to Admin
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.BREVO_SMTP_USER || "admin@europetransfers.com";
    await sendEmail({
      to: adminEmail,
      subject: `🚨 Booking Cancelled #${updated.id} - ${updated.customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #0B1528;">
          <h2 style="color: #DC2626;">Booking Cancellation Notice</h2>
          <p>A user has cancelled their transfer booking.</p>
          <hr style="border: 1px solid #eee; margin: 15px 0;" />
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
            <tr><th style="padding: 6px;">Booking ID:</th><td style="padding: 6px;"><strong>${updated.id}</strong></td></tr>
            <tr><th style="padding: 6px;">Customer Name:</th><td style="padding: 6px;">${updated.customerName}</td></tr>
            <tr><th style="padding: 6px;">Phone:</th><td style="padding: 6px;">${updated.phone}</td></tr>
            <tr><th style="padding: 6px;">Email:</th><td style="padding: 6px;">${updated.email || "N/A"}</td></tr>
            <tr><th style="padding: 6px;">Route:</th><td style="padding: 6px;">${updated.route?.fromLocation?.name} → ${updated.route?.toLocation?.name}</td></tr>
            <tr><th style="padding: 6px;">Travel Date:</th><td style="padding: 6px;">${updated.travelDate ? new Date(updated.travelDate).toLocaleDateString() : "N/A"} ${updated.travelTime || ""}</td></tr>
            <tr><th style="padding: 6px;">Vehicle:</th><td style="padding: 6px;">${updated.carType?.name}</td></tr>
            <tr><th style="padding: 6px;">Total Price:</th><td style="padding: 6px;">€${updated.price} (${updated.paymentStatus})</td></tr>
            <tr style="background-color: #FEE2E2;"><th style="padding: 8px; color: #991B1B;">Cancellation Reason:</th><td style="padding: 8px; color: #991B1B; font-weight: bold;">${cancelReasonText}</td></tr>
          </table>
        </div>
      `,
    });
  } catch (emailErr) {
    console.error("Failed to send cancellation email to admin:", emailErr);
  }

  return apiResponse(res, 200, "Booking cancelled successfully", updated);
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
