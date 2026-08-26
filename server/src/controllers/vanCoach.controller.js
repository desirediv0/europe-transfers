import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendEmail } from "../config/mailer.js";
import { convertFromEur } from "../config/currency.js";

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
  if (req.query.featured === "true") where.showOnHomepage = true;
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
    isActive,
    showOnHomepage,
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
      isActive: isActive ?? true,
      showOnHomepage: showOnHomepage ?? false,
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
    showOnHomepage,
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
  if (showOnHomepage !== undefined) dataToUpdate.showOnHomepage = showOnHomepage;

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

// ─── Enquiries ───────────────────────────────────────────

export const submitVanCoachEnquiry = asyncHandler(async (req, res) => {
  const {
    vehicleId,
    vehicleName,
    location,
    hours,
    rate,
    name,
    phone,
    email,
    pickupAddress,
    itineraryNotes,
  } = req.body;

  if (!vehicleName || !location || hours == null || rate == null || !name || !phone || !email) {
    throw new ApiError(400, "vehicleName, location, hours, rate, name, phone, and email are required");
  }

  // Ensure table exists in database
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "VanCoachEnquiry" (
      "id" TEXT PRIMARY KEY,
      "vehicleId" TEXT,
      "vehicleName" TEXT NOT NULL,
      "location" TEXT NOT NULL,
      "hours" INTEGER NOT NULL,
      "rate" DECIMAL(10,2) NOT NULL,
      "customerName" TEXT NOT NULL,
      "phone" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "pickupAddress" TEXT,
      "notes" TEXT,
      "status" TEXT DEFAULT 'PENDING',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const id = `vce_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await prisma.$executeRawUnsafe(
    `INSERT INTO "VanCoachEnquiry" ("id", "vehicleId", "vehicleName", "location", "hours", "rate", "customerName", "phone", "email", "pickupAddress", "notes", "status", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'PENDING', NOW(), NOW())`,
    id,
    vehicleId || null,
    vehicleName,
    location,
    hours,
    rate,
    name,
    phone,
    email,
    pickupAddress || null,
    itineraryNotes || null
  );

  const rateInr = await convertFromEur(rate, "INR");

  const adminEmail = process.env.ADMIN_EMAIL || process.env.BREVO_SMTP_USER || "info@theeuropetransfers.com";
  try {
    await sendEmail({
      to: adminEmail,
      subject: `🚐 New Van & Coach Enquiry: ${vehicleName} (${location})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #0B1528; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0;">
            <h2 style="color: #060C17; margin-top: 0;">🚐 New Van & Coach Disposal Enquiry</h2>
            <p style="color: #64748b; font-size: 14px;">A customer has submitted a new Van & Coach hourly disposal enquiry on Europe Transfers.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />

            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #64748b; width: 140px;">Vehicle:</td><td style="padding: 8px 0; font-weight: bold; color: #060C17;">${vehicleName}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Location:</td><td style="padding: 8px 0; font-weight: bold; color: #060C17;">${location}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Duration:</td><td style="padding: 8px 0; font-weight: bold; color: #060C17;">${hours} hours</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Estimated Total:</td><td style="padding: 8px 0; font-weight: bold; color: #059669;">₹${rateInr}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Pickup Address:</td><td style="padding: 8px 0; font-weight: bold; color: #060C17;">${pickupAddress || "Not specified"}</td></tr>
            </table>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />

            <h3 style="color: #060C17; font-size: 16px; margin-bottom: 12px;">Customer Details</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #64748b; width: 140px;">Name:</td><td style="padding: 8px 0; font-weight: bold; color: #060C17;">${name}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Phone:</td><td style="padding: 8px 0; font-weight: bold; color: #060C17;">${phone}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Email:</td><td style="padding: 8px 0; font-weight: bold; color: #060C17;">${email}</td></tr>
              ${itineraryNotes ? `<tr><td style="padding: 8px 0; color: #64748b; vertical-align: top;">Notes:</td><td style="padding: 8px 0; color: #060C17;">${itineraryNotes}</td></tr>` : ""}
            </table>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send Van & Coach enquiry email:", err.message);
  }

  return apiResponse(res, 201, "Enquiry submitted successfully", {
    id,
    vehicleId,
    vehicleName,
    location,
    hours,
    rate,
    customerName: name,
    phone,
    email,
    pickupAddress,
    notes: itineraryNotes,
    status: "PENDING",
  });
});

export const getVanCoachEnquiries = asyncHandler(async (req, res) => {
  try {
    const enquiries = await prisma.$queryRawUnsafe(
      `SELECT * FROM "VanCoachEnquiry" ORDER BY "createdAt" DESC`
    );
    return apiResponse(res, 200, "Van & Coach enquiries retrieved", enquiries);
  } catch (err) {
    return apiResponse(res, 200, "Van & Coach enquiries retrieved", []);
  }
});
