import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendEmail } from "../config/mailer.js";
import { convertFromEur } from "../config/currency.js";

const priceToInrDisplay = async (priceDisplay) => {
  const numeric = parseFloat(String(priceDisplay).replace(/[^0-9.]/g, ""));
  if (Number.isNaN(numeric)) return priceDisplay || "N/A";
  return await convertFromEur(numeric, "INR");
};

const ensureTablesExist = async () => {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SightseeingTour" (
        "id" TEXT PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT UNIQUE NOT NULL,
        "cityName" TEXT,
        "countryName" TEXT,
        "duration" TEXT NOT NULL,
        "priceFrom" DECIMAL(10,2) NOT NULL,
        "coverImage" TEXT,
        "galleryImages" TEXT,
        "summary" TEXT,
        "description" TEXT,
        "highlights" TEXT,
        "includes" TEXT,
        "options" TEXT,
        "schedule" TEXT,
        "seoTitle" TEXT,
        "seoDescription" TEXT,
        "isActive" BOOLEAN DEFAULT true,
        "showOnHomepage" BOOLEAN DEFAULT false,
        "order" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "SightseeingTour" ADD COLUMN IF NOT EXISTS "showOnHomepage" BOOLEAN DEFAULT false;
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SightseeingEnquiry" (
        "id" TEXT PRIMARY KEY,
        "sightseeingId" TEXT,
        "sightseeingTitle" TEXT NOT NULL,
        "optionSelected" TEXT,
        "cityName" TEXT,
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
  } catch (err) {
    console.error("Sightseeing tables init check:", err);
  }
};

// Lightweight endpoint for populating the city dropdown/search - returns
// only distinct active city names instead of full tour payloads, so it
// stays fast and small no matter how many tours (or cities) exist.
export const getSightseeingCities = asyncHandler(async (req, res) => {
  await ensureTablesExist();

  const rows = await prisma.sightseeingTour.findMany({
    where: { isActive: true, cityName: { not: null } },
    select: { cityName: true },
    distinct: ["cityName"],
    orderBy: { cityName: "asc" },
  });

  const cities = rows.map((r) => r.cityName).filter(Boolean);
  return apiResponse(res, 200, "Cities retrieved", cities);
});

export const getSightseeingTours = asyncHandler(async (req, res) => {
  await ensureTablesExist();

  const search = req.query.search;
  const city = req.query.city;
  const isAdmin = req.query.admin === "true";
  const page = parseInt(req.query.page, 10) || 1;
  const limit = isAdmin ? 100 : (parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;

  const where = {
    ...(isAdmin ? {} : { isActive: true }),
    ...(req.query.featured === "true" ? { showOnHomepage: true } : {}),
    ...(city ? { cityName: { contains: city, mode: "insensitive" } } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { summary: { contains: search, mode: "insensitive" } },
            { cityName: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [tours, total] = await Promise.all([
    prisma.sightseeingTour.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.sightseeingTour.count({ where }),
  ]);

  if (isAdmin) {
    return apiResponse(res, 200, "Sightseeing tours retrieved", tours);
  }

  return apiResponse(res, 200, "Sightseeing tours retrieved", {
    items: tours,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getSightseeingBySlug = asyncHandler(async (req, res) => {
  await ensureTablesExist();
  const { slug } = req.params;

  const tour = await prisma.sightseeingTour.findFirst({
    where: {
      OR: [{ slug: slug }, { id: slug }],
    },
  });

  if (!tour) {
    throw new ApiError(404, "Sightseeing tour not found");
  }

  return apiResponse(res, 200, "Sightseeing tour retrieved", tour);
});

export const submitSightseeingEnquiry = asyncHandler(async (req, res) => {
  await ensureTablesExist();

  const {
    sightseeingId,
    sightseeingTitle,
    optionSelected,
    cityName,
    priceDisplay,
    name,
    phone,
    email,
    travelDate,
    pax,
    message,
    notes,
  } = req.body;

  if (!sightseeingTitle || !name || !phone || !email) {
    throw new ApiError(400, "sightseeingTitle, name, phone, and email are required");
  }

  const id = `se_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const finalNotes = message || notes || null;
  const paxCount = parseInt(pax, 10) || 1;

  await prisma.$executeRawUnsafe(
    `INSERT INTO "SightseeingEnquiry" ("id", "sightseeingId", "sightseeingTitle", "optionSelected", "cityName", "priceDisplay", "customerName", "phone", "email", "travelDate", "pax", "notes", "status", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'PENDING', NOW(), NOW())`,
    id,
    sightseeingId || null,
    sightseeingTitle,
    optionSelected || null,
    cityName || null,
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
    sightseeingId,
    sightseeingTitle,
    optionSelected,
    cityName,
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

  const adminEmail = process.env.ADMIN_EMAIL || process.env.BREVO_SMTP_USER || "info@theeuropetransfers.com";
  try {
    await sendEmail({
      to: adminEmail,
      subject: `New Sightseeing Activity Booking Request: ${sightseeingTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #0B1528; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0;">
            <h2 style="color: #060C17; margin-top: 0;">New Sightseeing Tour Enquiry</h2>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #64748b; width: 140px;">Activity:</td><td style="padding: 8px 0; font-weight: bold; color: #060C17;">${sightseeingTitle}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Selected Option:</td><td style="padding: 8px 0; font-weight: bold; color: #2563eb;">${optionSelected || "Standard Option"}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">City / Region:</td><td style="padding: 8px 0; font-weight: bold; color: #060C17;">${cityName || "Europe"}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Quoted Price:</td><td style="padding: 8px 0; font-weight: bold; color: #059669;">₹${priceInr} / person</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Activity Date:</td><td style="padding: 8px 0; font-weight: bold; color: #060C17;">${travelDate || "Not specified"}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Passengers:</td><td style="padding: 8px 0; font-weight: bold; color: #060C17;">${paxCount} Person(s)</td></tr>
            </table>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <h3 style="color: #060C17; font-size: 16px; margin-bottom: 12px;">Customer Contact Details</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 6px 0; color: #64748b; width: 140px;">Customer Name:</td><td style="padding: 6px 0; font-weight: bold;">${name}</td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Phone / WhatsApp:</td><td style="padding: 6px 0; font-weight: bold;"><a href="tel:${phone}" style="color: #2563eb;">${phone}</a></td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Email:</td><td style="padding: 6px 0; font-weight: bold;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td></tr>
              <tr><td style="padding: 6px 0; color: #64748b;">Special Requests:</td><td style="padding: 6px 0; font-weight: normal; color: #334155;">${finalNotes || "None"}</td></tr>
            </table>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send admin sightseeing email:", err);
  }

  try {
    await sendEmail({
      to: email,
      subject: `Sightseeing Tour Request Received - ${sightseeingTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #0B1528; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0;">
            <h2 style="color: #060C17; margin-top: 0;">Sightseeing Activity Request Received!</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.5;">
              Dear <strong>${name}</strong>,<br/><br/>
              We have received your sightseeing booking request for <strong>${sightseeingTitle}</strong> (${optionSelected || "Standard Option"}). Our European travel concierge team will confirm ticket availability & timing for your travel date.
            </p>
            <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #0f172a;">Tour Summary</h4>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Activity:</strong> ${sightseeingTitle}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Option:</strong> ${optionSelected || "Standard Access"}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>City:</strong> ${cityName || "Europe"}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Price:</strong> ₹${priceInr} / person</p>
              ${travelDate ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Preferred Date:</strong> ${travelDate}</p>` : ""}
              <p style="margin: 4px 0; font-size: 13px;"><strong>Travelers:</strong> ${paxCount} Person(s)</p>
            </div>
            <p style="color: #64748b; font-size: 13px;">
              If you have any questions, feel free to call us at <a href="tel:+41441234567" style="color: #2563eb;">+41 44 123 4567</a> or reply to this email.
            </p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send customer sightseeing confirmation email:", err);
  }

  return apiResponse(res, 201, "Sightseeing enquiry submitted successfully", enquiry);
});

export const getSightseeingEnquiries = asyncHandler(async (req, res) => {
  await ensureTablesExist();
  try {
    const enquiries = await prisma.$queryRawUnsafe(
      `SELECT * FROM "SightseeingEnquiry" ORDER BY "createdAt" DESC`
    );
    return apiResponse(res, 200, "Sightseeing enquiries retrieved", enquiries);
  } catch (err) {
    return apiResponse(res, 200, "Sightseeing enquiries retrieved", []);
  }
});

export const createSightseeingTour = asyncHandler(async (req, res) => {
  await ensureTablesExist();
  const {
    title,
    slug,
    cityName,
    countryName,
    duration,
    priceFrom,
    coverImage,
    galleryImages,
    summary,
    description,
    highlights,
    includes,
    options,
    schedule,
    seoTitle,
    seoDescription,
    isActive,
    showOnHomepage,
  } = req.body;

  if (!title || !slug || !duration || priceFrom === undefined) {
    throw new ApiError(400, "Title, slug, duration, and priceFrom are required");
  }

  const id = `st_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const tour = await prisma.sightseeingTour.create({
    data: {
      id,
      title,
      slug,
      cityName: cityName || "Paris",
      countryName: countryName || "France",
      duration,
      priceFrom: Number(priceFrom),
      coverImage: coverImage || "/images/hero_swiss_alps.png",
      galleryImages: typeof galleryImages === "string" ? galleryImages : JSON.stringify(galleryImages || []),
      summary: summary || "",
      description: description || "",
      highlights: typeof highlights === "string" ? highlights : JSON.stringify(highlights || []),
      includes: typeof includes === "string" ? includes : JSON.stringify(includes || []),
      options: typeof options === "string" ? options : JSON.stringify(options || []),
      schedule: typeof schedule === "string" ? schedule : JSON.stringify(schedule || []),
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || summary,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      showOnHomepage: showOnHomepage !== undefined ? Boolean(showOnHomepage) : false,
    },
  });

  return apiResponse(res, 201, "Sightseeing tour created", tour);
});

export const updateSightseeingTour = asyncHandler(async (req, res) => {
  await ensureTablesExist();
  const { id } = req.params;

  const existing = await prisma.sightseeingTour.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Sightseeing tour not found");
  }

  const data = { ...req.body };
  if (data.priceFrom !== undefined) data.priceFrom = Number(data.priceFrom);
  if (data.galleryImages && typeof data.galleryImages !== "string") data.galleryImages = JSON.stringify(data.galleryImages);
  if (data.highlights && typeof data.highlights !== "string") data.highlights = JSON.stringify(data.highlights);
  if (data.includes && typeof data.includes !== "string") data.includes = JSON.stringify(data.includes);
  if (data.options && typeof data.options !== "string") data.options = JSON.stringify(data.options);
  if (data.schedule && typeof data.schedule !== "string") data.schedule = JSON.stringify(data.schedule);

  const updated = await prisma.sightseeingTour.update({
    where: { id },
    data,
  });

  return apiResponse(res, 200, "Sightseeing tour updated", updated);
});

export const deleteSightseeingTour = asyncHandler(async (req, res) => {
  await ensureTablesExist();
  const { id } = req.params;

  const existing = await prisma.sightseeingTour.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, "Sightseeing tour not found");
  }

  await prisma.sightseeingTour.delete({ where: { id } });
  return apiResponse(res, 200, "Sightseeing tour deleted");
});
