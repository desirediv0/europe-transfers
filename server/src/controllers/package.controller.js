import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendEmail } from "../config/mailer.js";
import { convertFromEur } from "../config/currency.js";

const paginateArgs = (page = 1, limit = 20) => {
  return { skip: (page - 1) * limit, take: limit };
};

const priceToInrDisplay = async (priceDisplay) => {
  const numeric = parseFloat(String(priceDisplay).replace(/[^0-9.]/g, ""));
  if (Number.isNaN(numeric)) return priceDisplay || "N/A";
  return await convertFromEur(numeric, "INR");
};

export const getPackages = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const countryId = req.query.countryId;
  const search = req.query.search;

  const where = {};
  if (countryId) where.countryId = countryId;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { summary: { contains: search, mode: "insensitive" } },
    ];
  }

  const [packages, total] = await Promise.all([
    prisma.package.findMany({
      where,
      include: { country: true, itineraryDays: true },
      orderBy: { createdAt: "desc" },
      ...paginateArgs(page, limit),
    }),
    prisma.package.count({ where }),
  ]);

  return apiResponse(res, 200, "Packages retrieved", {
    items: packages,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getPackageById = asyncHandler(async (req, res) => {
  const pkg = await prisma.package.findUnique({
    where: { id: req.params.id },
    include: { country: true, itineraryDays: { orderBy: { dayNumber: "asc" } } },
  });
  if (!pkg) {
    throw new ApiError(404, "Package not found");
  }
  return apiResponse(res, 200, "Package retrieved", pkg);
});

export const createPackage = asyncHandler(async (req, res) => {
  const { title, slug, countryId, durationDays, coverImage, summary, priceFrom, isActive } = req.body;
  if (!title || !slug || !countryId || !durationDays) {
    throw new ApiError(400, "Title, slug, country ID, and duration days are required");
  }

  const country = await prisma.country.findUnique({ where: { id: countryId } });
  if (!country) {
    throw new ApiError(404, "Country not found");
  }

  const existingSlug = await prisma.package.findUnique({ where: { slug } });
  if (existingSlug) {
    throw new ApiError(400, "Slug already exists");
  }

  const pkg = await prisma.package.create({
    data: { title, slug, countryId, durationDays, coverImage, summary, priceFrom, isActive },
    include: { country: true },
  });
  return apiResponse(res, 201, "Package created", pkg);
});

export const updatePackage = asyncHandler(async (req, res) => {
  const { title, slug, countryId, durationDays, coverImage, summary, priceFrom, isActive } = req.body;

  const existing = await prisma.package.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Package not found");
  }

  if (slug && slug !== existing.slug) {
    const slugExists = await prisma.package.findUnique({ where: { slug } });
    if (slugExists) {
      throw new ApiError(400, "Slug already exists");
    }
  }

  const pkg = await prisma.package.update({
    where: { id: req.params.id },
    data: { title, slug, countryId, durationDays, coverImage, summary, priceFrom, isActive },
    include: { country: true },
  });
  return apiResponse(res, 200, "Package updated", pkg);
});

export const deletePackage = asyncHandler(async (req, res) => {
  const pkg = await prisma.package.findUnique({ where: { id: req.params.id } });
  if (!pkg) {
    throw new ApiError(404, "Package not found");
  }
  await prisma.package.delete({ where: { id: req.params.id } });
  return apiResponse(res, 200, "Package deleted");
});

export const getItinerary = asyncHandler(async (req, res) => {
  const days = await prisma.itineraryDay.findMany({
    where: { packageId: req.params.id },
    orderBy: { dayNumber: "asc" },
  });
  return apiResponse(res, 200, "Itinerary retrieved", days);
});

export const createItinerary = asyncHandler(async (req, res) => {
  const { dayNumber, title, description } = req.body;
  const { id } = req.params;

  if (!dayNumber || !title || !description) {
    throw new ApiError(400, "Day number, title, and description are required");
  }

  const pkg = await prisma.package.findUnique({ where: { id } });
  if (!pkg) {
    throw new ApiError(404, "Package not found");
  }

  const day = await prisma.itineraryDay.create({ data: { packageId: id, dayNumber, title, description } });
  return apiResponse(res, 201, "Itinerary day created", day);
});

export const updateItinerary = asyncHandler(async (req, res) => {
  const { dayNumber, title, description } = req.body;

  const existing = await prisma.itineraryDay.findUnique({ where: { id: req.params.dayId } });
  if (!existing) {
    throw new ApiError(404, "Itinerary day not found");
  }

  const day = await prisma.itineraryDay.update({
    where: { id: req.params.dayId },
    data: { dayNumber, title, description },
  });
  return apiResponse(res, 200, "Itinerary day updated", day);
});

export const deleteItinerary = asyncHandler(async (req, res) => {
  const existing = await prisma.itineraryDay.findUnique({ where: { id: req.params.dayId } });
  if (!existing) {
    throw new ApiError(404, "Itinerary day not found");
  }
  await prisma.itineraryDay.delete({ where: { id: req.params.dayId } });
  return apiResponse(res, 200, "Itinerary day deleted");
});

// ─── Package Enquiries (Public Submission & Admin Listing) ───

export const submitPackageEnquiry = asyncHandler(async (req, res) => {
  const {
    packageId,
    packageTitle,
    countryName,
    priceDisplay,
    name,
    phone,
    email,
    travelDate,
    pax,
    message,
    notes,
  } = req.body;

  if (!packageTitle || !name || !phone || !email) {
    throw new ApiError(400, "packageTitle, name, phone, and email are required");
  }

  // Ensure table exists in database
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PackageEnquiry" (
      "id" TEXT PRIMARY KEY,
      "packageId" TEXT,
      "packageTitle" TEXT NOT NULL,
      "countryName" TEXT,
      "priceDisplay" TEXT,
      "customerName" TEXT NOT NULL,
      "phone" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "travelDate" TEXT,
      "pax" INTEGER DEFAULT 1,
      "notes" TEXT,
      "status" TEXT DEFAULT 'PENDING',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const id = `pe_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const finalNotes = message || notes || null;
  const paxCount = parseInt(pax, 10) || 1;

  await prisma.$executeRawUnsafe(
    `INSERT INTO "PackageEnquiry" ("id", "packageId", "packageTitle", "countryName", "priceDisplay", "customerName", "phone", "email", "travelDate", "pax", "notes", "status", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'PENDING', NOW(), NOW())`,
    id,
    packageId || null,
    packageTitle,
    countryName || null,
    priceDisplay || null,
    name,
    phone,
    email,
    travelDate || null,
    paxCount,
    finalNotes
  );

  const enquiry = {
    id,
    packageId,
    packageTitle,
    countryName,
    priceDisplay,
    customerName: name,
    phone,
    email,
    travelDate,
    pax: paxCount,
    notes: finalNotes,
    status: "PENDING",
  };

  const priceInr = await priceToInrDisplay(priceDisplay);

  // 1. Send Email Notification to Admin
  const adminEmail = process.env.ADMIN_EMAIL || process.env.BREVO_SMTP_USER || "info@theeuropetransfers.com";
  try {
    await sendEmail({
      to: adminEmail,
      subject: `📦 New Tour Package Enquiry: ${packageTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #0B1528; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0;">
            <h2 style="color: #060C17; margin-top: 0;">📦 New Tour Package Enquiry</h2>
            <p style="color: #64748b; font-size: 14px;">A customer has requested a tour package quote on Europe Transfers.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #64748b; width: 140px;">Package:</td><td style="padding: 8px 0; font-weight: bold; color: #060C17;">${packageTitle}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Destination:</td><td style="padding: 8px 0; font-weight: bold; color: #060C17;">${countryName || "Europe"}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Starting Price:</td><td style="padding: 8px 0; font-weight: bold; color: #059669;">₹${priceInr} / person</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Travel Date:</td><td style="padding: 8px 0; font-weight: bold; color: #060C17;">${travelDate || "Not specified"}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Passengers:</td><td style="padding: 8px 0; font-weight: bold; color: #060C17;">${paxCount} Person(s)</td></tr>
            </table>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />

            <h3 style="color: #060C17; font-size: 16px; margin-bottom: 12px;">Customer Contact</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 6px 0; color: #64748b; width: 140px;">Customer Name:</td><td style="padding: 6px 0; font-weight: bold;">${name}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Phone / WhatsApp:</td><td style="padding: 6px 0; font-weight: bold;"><a href="tel:${phone}" style="color: #2563eb;">${phone}</a></td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Email:</td><td style="padding: 6px 0; font-weight: bold;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Special Notes:</td><td style="padding: 6px 0; font-weight: normal; color: #334155;">${finalNotes || "None"}</td></tr>
            </table>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send admin package email:", err);
  }

  // 2. Send Email Confirmation to Customer
  try {
    await sendEmail({
      to: email,
      subject: `Tour Package Enquiry Confirmation - ${packageTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #0B1528; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0;">
            <h2 style="color: #060C17; margin-top: 0;">Thank you for your Tour Enquiry!</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.5;">
              Dear <strong>${name}</strong>,<br/><br/>
              We have received your enquiry for <strong>${packageTitle}</strong>. Our European travel concierge team is reviewing your travel itinerary and will get back to you within 24 hours with a customized quote.
            </p>

            <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #0f172a;">Tour Summary</h4>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Package:</strong> ${packageTitle}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Destination:</strong> ${countryName || "Europe"}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Starting Price:</strong> ₹${priceInr} / person</p>
              ${travelDate ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Preferred Date:</strong> ${travelDate}</p>` : ""}
              <p style="margin: 4px 0; font-size: 13px;"><strong>Travelers:</strong> ${paxCount} Person(s)</p>
            </div>

            <p style="color: #64748b; font-size: 13px;">
              If you need urgent assistance, call us at <a href="tel:+41441234567" style="color: #2563eb;">+41 44 123 4567</a> or reply directly to this email.
            </p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send customer package confirmation email:", err);
  }

  return apiResponse(res, 201, "Package enquiry submitted successfully", enquiry);
});

export const getPackageEnquiries = asyncHandler(async (req, res) => {
  try {
    const enquiries = await prisma.$queryRawUnsafe(
      `SELECT * FROM "PackageEnquiry" ORDER BY "createdAt" DESC`
    );
    return apiResponse(res, 200, "Package enquiries retrieved", enquiries);
  } catch (err) {
    return apiResponse(res, 200, "Package enquiries retrieved", []);
  }
});

