import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendEmail } from "../config/mailer.js";

const includeRoutes = {
  routes: { orderBy: { order: "asc" } },
};

// ─── Cities ────────────────────────────────────────

export const getPrivateTransferCities = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.privateTransferCity.findMany({
      skip,
      take: limit,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: includeRoutes,
    }),
    prisma.privateTransferCity.count(),
  ]);

  return apiResponse(res, 200, "Private transfer cities retrieved", {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getAllPrivateTransferCities = asyncHandler(async (req, res) => {
  const items = await prisma.privateTransferCity.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: includeRoutes,
  });
  return apiResponse(res, 200, "Private transfer cities retrieved", items);
});

export const getPrivateTransferCityById = asyncHandler(async (req, res) => {
  const item = await prisma.privateTransferCity.findUnique({
    where: { id: req.params.id },
    include: includeRoutes,
  });
  if (!item) {
    throw new ApiError(404, "Private transfer city not found");
  }
  return apiResponse(res, 200, "Private transfer city retrieved", item);
});

export const createPrivateTransferCity = asyncHandler(async (req, res) => {
  const { name, slug, coverImage, order, routes } = req.body;

  if (!name || !slug) {
    throw new ApiError(400, "Name and slug are required");
  }

  const existing = await prisma.privateTransferCity.findUnique({ where: { slug } });
  if (existing) {
    throw new ApiError(400, "Slug already exists");
  }

  const item = await prisma.privateTransferCity.create({
    data: {
      name,
      slug,
      coverImage: coverImage || null,
      order: order ?? 0,
      routes:
        Array.isArray(routes) && routes.length > 0
          ? {
              create: routes.map((r, i) => ({
                description: r.description,
                sedanPrice: r.sedanPrice,
                minivanPrice: r.minivanPrice,
                currency: r.currency || "GBP",
                order: r.order ?? i,
              })),
            }
          : undefined,
    },
    include: includeRoutes,
  });

  return apiResponse(res, 201, "Private transfer city created", item);
});

export const updatePrivateTransferCity = asyncHandler(async (req, res) => {
  const { name, slug, coverImage, isActive, order, routes } = req.body;

  const existing = await prisma.privateTransferCity.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Private transfer city not found");
  }

  if (slug && slug !== existing.slug) {
    const slugTaken = await prisma.privateTransferCity.findUnique({ where: { slug } });
    if (slugTaken) {
      throw new ApiError(400, "Slug already exists");
    }
  }

  const dataToUpdate = {};
  if (name !== undefined) dataToUpdate.name = name;
  if (slug !== undefined) dataToUpdate.slug = slug;
  if (coverImage !== undefined) dataToUpdate.coverImage = coverImage;
  if (isActive !== undefined) dataToUpdate.isActive = isActive;
  if (order !== undefined) dataToUpdate.order = order;

  if (Array.isArray(routes)) {
    await prisma.privateTransferRoute.deleteMany({ where: { cityId: req.params.id } });
    if (routes.length > 0) {
      dataToUpdate.routes = {
        create: routes.map((r, i) => ({
          description: r.description,
          sedanPrice: r.sedanPrice,
          minivanPrice: r.minivanPrice,
          currency: r.currency || "GBP",
          order: r.order ?? i,
        })),
      };
    }
  }

  const item = await prisma.privateTransferCity.update({
    where: { id: req.params.id },
    data: dataToUpdate,
    include: includeRoutes,
  });

  return apiResponse(res, 200, "Private transfer city updated", item);
});

export const deletePrivateTransferCity = asyncHandler(async (req, res) => {
  const existing = await prisma.privateTransferCity.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Private transfer city not found");
  }

  await prisma.privateTransferRoute.deleteMany({ where: { cityId: req.params.id } });
  await prisma.privateTransferCity.delete({ where: { id: req.params.id } });
  return apiResponse(res, 200, "Private transfer city deleted");
});

// ─── Routes (individual route CRUD under a city) ───

export const getPrivateTransferRoutes = asyncHandler(async (req, res) => {
  const cityId = req.query.cityId;
  const where = cityId ? { cityId } : {};

  const items = await prisma.privateTransferRoute.findMany({
    where,
    orderBy: [{ order: "asc" }],
    include: { city: true },
  });

  return apiResponse(res, 200, "Private transfer routes retrieved", items);
});

export const createPrivateTransferRoute = asyncHandler(async (req, res) => {
  const { cityId, description, sedanPrice, minivanPrice, currency, order } = req.body;

  if (!cityId || !description || sedanPrice == null || minivanPrice == null) {
    throw new ApiError(400, "cityId, description, sedanPrice, and minivanPrice are required");
  }

  const city = await prisma.privateTransferCity.findUnique({ where: { id: cityId } });
  if (!city) {
    throw new ApiError(404, "City not found");
  }

  const item = await prisma.privateTransferRoute.create({
    data: {
      cityId,
      description,
      sedanPrice,
      minivanPrice,
      currency: currency || "GBP",
      order: order ?? 0,
    },
    include: { city: true },
  });

  return apiResponse(res, 201, "Private transfer route created", item);
});

export const updatePrivateTransferRoute = asyncHandler(async (req, res) => {
  const { description, sedanPrice, minivanPrice, currency, isActive, order } = req.body;

  const existing = await prisma.privateTransferRoute.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Private transfer route not found");
  }

  const dataToUpdate = {};
  if (description !== undefined) dataToUpdate.description = description;
  if (sedanPrice !== undefined) dataToUpdate.sedanPrice = sedanPrice;
  if (minivanPrice !== undefined) dataToUpdate.minivanPrice = minivanPrice;
  if (currency !== undefined) dataToUpdate.currency = currency;
  if (isActive !== undefined) dataToUpdate.isActive = isActive;
  if (order !== undefined) dataToUpdate.order = order;

  const item = await prisma.privateTransferRoute.update({
    where: { id: req.params.id },
    data: dataToUpdate,
    include: { city: true },
  });

  return apiResponse(res, 200, "Private transfer route updated", item);
});

export const deletePrivateTransferRoute = asyncHandler(async (req, res) => {
  const existing = await prisma.privateTransferRoute.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Private transfer route not found");
  }

  await prisma.privateTransferRoute.delete({ where: { id: req.params.id } });
  return apiResponse(res, 200, "Private transfer route deleted");
});

// ─── Enquiries (Public Submission & Admin Listing) ───

export const submitPrivateTransferEnquiry = asyncHandler(async (req, res) => {
  const {
    cityName,
    routeDescription,
    vehicleType,
    price,
    currency,
    name,
    phone,
    email,
    pickupDate,
    pickupTime,
    message,
  } = req.body;

  if (!cityName || !routeDescription || !vehicleType || price == null || !name || !phone || !email) {
    throw new ApiError(400, "cityName, routeDescription, vehicleType, price, name, phone, and email are required");
  }

  // Ensure table exists in database
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PrivateTransferEnquiry" (
      "id" TEXT PRIMARY KEY,
      "cityName" TEXT NOT NULL,
      "routeDescription" TEXT NOT NULL,
      "vehicleType" TEXT NOT NULL,
      "price" DECIMAL(10,2) NOT NULL,
      "currency" TEXT DEFAULT 'GBP',
      "customerName" TEXT NOT NULL,
      "phone" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "pickupDate" TEXT,
      "pickupTime" TEXT,
      "notes" TEXT,
      "status" TEXT DEFAULT 'PENDING',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const id = `pte_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await prisma.$executeRawUnsafe(
    `INSERT INTO "PrivateTransferEnquiry" ("id", "cityName", "routeDescription", "vehicleType", "price", "currency", "customerName", "phone", "email", "pickupDate", "pickupTime", "notes", "status", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'PENDING', NOW(), NOW())`,
    id,
    cityName,
    routeDescription,
    vehicleType,
    price,
    currency || "GBP",
    name,
    phone,
    email,
    pickupDate || null,
    pickupTime || null,
    message || null
  );

  const enquiry = {
    id,
    cityName,
    routeDescription,
    vehicleType,
    price,
    currency: currency || "GBP",
    customerName: name,
    phone,
    email,
    pickupDate,
    pickupTime,
    notes: message,
    status: "PENDING",
  };

  // 1. Send Email Notification to Admin
  const adminEmail = process.env.ADMIN_EMAIL || process.env.BREVO_SMTP_USER || "codeshorts007@gmail.com";
  try {
    await sendEmail({
      to: adminEmail,
      subject: `🚘 New Private Transfer Enquiry: ${cityName} (${vehicleType.toUpperCase()} - £${price})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #0B1528; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0;">
            <h2 style="color: #060C17; margin-top: 0;">🚘 New Private Transfer Enquiry</h2>
            <p style="color: #64748b; font-size: 14px;">A customer has submitted a new private transfer enquiry on Europe Transfers.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #64748b; width: 140px;">City:</td><td style="padding: 8px 0; font-weight: bold; color: #060C17;">${cityName}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Route:</td><td style="padding: 8px 0; font-weight: bold; color: #060C17;">${routeDescription}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Vehicle:</td><td style="padding: 8px 0; font-weight: bold; color: #d97706;">${vehicleType.toUpperCase()}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Quoted Price:</td><td style="padding: 8px 0; font-weight: bold; color: #059669;">£${price} ${currency || "GBP"}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Pickup Date:</td><td style="padding: 8px 0; font-weight: bold; color: #060C17;">${pickupDate || "Not specified"}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Pickup Time:</td><td style="padding: 8px 0; font-weight: bold; color: #060C17;">${pickupTime || "Not specified"}</td></tr>
            </table>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />

            <h3 style="color: #060C17; font-size: 16px; margin-bottom: 12px;">Customer Details</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 6px 0; color: #64748b; width: 140px;">Full Name:</td><td style="padding: 6px 0; font-weight: bold;">${name}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Phone / WhatsApp:</td><td style="padding: 6px 0; font-weight: bold;"><a href="tel:${phone}" style="color: #2563eb;">${phone}</a></td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Email:</td><td style="padding: 6px 0; font-weight: bold;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Notes / Special Requests:</td><td style="padding: 6px 0; font-weight: normal; color: #334155;">${message || "None"}</td></tr>
            </table>
          </div>
        </div>
      `,
    });
  } catch (emailErr) {
    console.error("Failed to send admin enquiry notification email:", emailErr);
  }

  // 2. Send Email Confirmation to Customer
  try {
    await sendEmail({
      to: email,
      subject: `Transfer Enquiry Confirmation - ${cityName} (${routeDescription})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #0B1528; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0;">
            <h2 style="color: #060C17; margin-top: 0;">Thank you for your Enquiry!</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.5;">
              Dear <strong>${name}</strong>,<br/><br/>
              We have received your private transfer enquiry for <strong>${cityName}</strong>. Our concierge team is reviewing your route request and will contact you within 15 minutes to confirm booking details.
            </p>

            <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #0f172a;">Enquiry Summary</h4>
              <p style="margin: 4px 0; font-size: 13px;"><strong>City:</strong> ${cityName}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Route:</strong> ${routeDescription}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Vehicle:</strong> ${vehicleType.toUpperCase()}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Price Quote:</strong> £${price} ${currency || "GBP"}</p>
              ${pickupDate ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Pickup Date & Time:</strong> ${pickupDate} ${pickupTime || ""}</p>` : ""}
            </div>

            <p style="color: #64748b; font-size: 13px;">
              If you have urgent questions, feel free to call us at <a href="tel:+41441234567" style="color: #2563eb;">+41 44 123 4567</a> or reply to this email.
            </p>
          </div>
        </div>
      `,
    });
  } catch (emailErr) {
    console.error("Failed to send customer enquiry confirmation email:", emailErr);
  }

  return apiResponse(res, 201, "Private transfer enquiry submitted successfully", enquiry);
});

export const getPrivateTransferEnquiries = asyncHandler(async (req, res) => {
  try {
    const enquiries = await prisma.$queryRawUnsafe(
      `SELECT * FROM "PrivateTransferEnquiry" ORDER BY "createdAt" DESC`
    );
    return apiResponse(res, 200, "Private transfer enquiries retrieved", enquiries);
  } catch (err) {
    return apiResponse(res, 200, "Private transfer enquiries retrieved", []);
  }
});
