import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendEmail } from "../config/mailer.js";

// Ensure Sightseeing tables exist in PostgreSQL
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
        "order" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
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

// Initial seed tours if table is empty
const SEED_TOURS = [
  {
    id: "st_eiffel_summit",
    title: "Summit Eiffel Tower Ticket with Reserved Access & Audio Guide",
    slug: "eiffel-tower-summit-reserved-access",
    cityName: "Paris",
    countryName: "France",
    duration: "2 - 3 Hours",
    priceFrom: 99.00,
    coverImage: "/images/hero_swiss_alps.png",
    galleryImages: JSON.stringify(["/images/hero_swiss_alps.png", "/images/lucerne_chape_bridge.png"]),
    summary: "Skip the main lines and reach the top of Paris' iconic Eiffel Tower with priority access & digital guide.",
    description: "Ascend to the very summit of the Eiffel Tower for breathtaking 360-degree panoramic views of Paris. Enjoy priority lift access to the 2nd floor and top summit, complete with an immersive audio guide detailing Gustave Eiffel's engineering marvel.",
    highlights: JSON.stringify([
      "Priority elevator access to Eiffel Tower Summit",
      "Panoramic views of Notre-Dame, Louvre, and Seine River",
      "Interactive multi-language digital audio guide",
      "Access to Gustave Eiffel's restored private summit office"
    ]),
    includes: JSON.stringify([
      "Summit ticket with reserved access",
      "Host meeting point assistance",
      "Audio guide app download"
    ]),
    options: JSON.stringify([
      { name: "Standard Summit Access with Audio Guide", price: 99.00, duration: "2 Hours" },
      { name: "VIP Champagne Summit Experience", price: 149.00, duration: "3 Hours" }
    ]),
    schedule: JSON.stringify([
      { type: "Departure", address: "Champ de Mars, 5 Avenue Anatole France, 75007 Paris", metro: "Bir-Hakeim (M6)", time: "Flexible Departure" },
      { type: "Time", address: "2.5 Hours total duration", metro: "", time: "Daily 09:30 AM - 10:00 PM" }
    ]),
    seoTitle: "Summit Eiffel Tower Tickets & Audio Guide Tour Paris",
    seoDescription: "Book priority summit access tickets for the Eiffel Tower in Paris. Includes audio guide, summit views, and flexible time slots.",
    isActive: true,
    order: 1
  },
  {
    id: "st_versailles_extended",
    title: "Versailles Extended Tour from Paris (Palace, Gardens & Trianons)",
    slug: "versailles-extended-tour-paris",
    cityName: "Paris",
    countryName: "France",
    duration: "Full Day (7-8 Hours)",
    priceFrom: 96.00,
    coverImage: "/images/lucerne_chape_bridge.png",
    galleryImages: JSON.stringify(["/images/lucerne_chape_bridge.png", "/images/hero_swiss_alps.png"]),
    summary: "Explore the Hall of Mirrors, royal apartments, vast fountains & Queen's Hamlet with luxury transport.",
    description: "Travel in air-conditioned luxury comfort from central Paris to the grand Palace of Versailles. Discover the lavish Hall of Mirrors, King's Grand Apartments, manicured fountain gardens, Grand Trianon, and Queen Marie Antoinette's Hamlet.",
    highlights: JSON.stringify([
      "Skip-the-line entrance ticket to Palace of Versailles",
      "Guided tour of Hall of Mirrors & Royal Suites",
      "Free time to stroll the world-famous Versailles Gardens",
      "Visit Grand & Petit Trianon & Queen's Hamlet"
    ]),
    includes: JSON.stringify([
      "Round-trip AC coach transport from Paris",
      "Skip-the-line Palace & Estate entry ticket",
      "Professional expert English-speaking guide"
    ]),
    options: JSON.stringify([
      { name: "Full Day Guided Tour with Bus Transport", price: 96.00, duration: "7 Hours" },
      { name: "Small Group VIP Tour with Gourmet Lunch", price: 185.00, duration: "8 Hours" }
    ]),
    schedule: JSON.stringify([
      { type: "Departure", address: "Central Paris Meeting Point near Eiffel Tower", metro: "Passy (M6)", time: "08:15 AM Departure" },
      { type: "Arrival", address: "Return to Central Paris", metro: "", time: "04:30 PM Arrival" }
    ]),
    seoTitle: "Palace of Versailles Guided Day Tour from Paris",
    seoDescription: "Book Versailles Palace day tour from Paris. Includes skip-the-line ticket, gardens, Trianon estate, and AC coach transfer.",
    isActive: true,
    order: 2
  },
  {
    id: "st_seine_dinner_cruise",
    title: "Bistronomic Dinner Cruise Paris Seine 6.45 PM",
    slug: "bistronomic-dinner-cruise-paris-seine",
    cityName: "Paris",
    countryName: "France",
    duration: "1:15 Hours",
    priceFrom: 87.00,
    coverImage: "/images/hero_swiss_alps.png",
    galleryImages: JSON.stringify(["/images/hero_swiss_alps.png", "/images/lucerne_chape_bridge.png"]),
    summary: "Savor a 3-course French dinner aboard a panoramic glass boat while gliding past illuminated Paris landmarks.",
    description: "Spend an unforgettable evening on the Seine River in Paris. Floating along the water, enjoy a chef-prepared 3-course traditional French meal, French wine/coffee, and romantic views of the Louvre, Notre-Dame, and twinkling Eiffel Tower.",
    highlights: JSON.stringify([
      "1:15 hour scenic dinner cruise along the Seine River",
      "Freshly prepared 3-course gourmet French dinner menu",
      "Gliding past illuminated landmarks (Eiffel Tower, Louvre, Musée d'Orsay)",
      "Window seat options for romantic couples"
    ]),
    includes: JSON.stringify([
      "3-course gourmet French dinner",
      "Coffee or tea",
      "1.15 hour dinner cruise on the Seine"
    ]),
    options: JSON.stringify([
      { name: "Bistronomic Dinner Cruise 6.45 PM", price: 87.00, duration: "1:15 Hour" },
      { name: "Romantic Dinner Cruise, Table by the Window", price: 135.00, duration: "1:15 Hour" }
    ]),
    schedule: JSON.stringify([
      { type: "Departure", address: "Port de Solférino - Promenade Édouard Glissant, 75007 Paris", metro: "Musée d'Orsay (RER C)", time: "Boarding 06:15 PM | Departure 06:45 PM" },
      { type: "Arrival", address: "Port de Solférino, Paris", metro: "", time: "Return 08:00 PM" }
    ]),
    seoTitle: "Bistronomic Seine River Dinner Cruise Paris",
    seoDescription: "Enjoy a gourmet 3-course French dinner cruise on the Seine River in Paris. Window table options, wine, and illuminated views.",
    isActive: true,
    order: 3
  },
  {
    id: "st_val_dorcia_tuscan",
    title: "Val d'Orcia: Montepulciano & Pienza Wine and Cheese Tasting Tour",
    slug: "val-dorcia-montepulciano-pienza-wine-tasting-rome",
    cityName: "Rome / Tuscany",
    countryName: "Italy",
    duration: "12 Hours (Full Day)",
    priceFrom: 115.00,
    coverImage: "/images/lucerne_chape_bridge.png",
    galleryImages: JSON.stringify(["/images/lucerne_chape_bridge.png", "/images/hero_swiss_alps.png"]),
    summary: "Discover rolling Tuscan hills, medieval wine cellars, Vino Nobile tastings & Pecorino cheese in Pienza.",
    description: "Escape Rome for the rolling hills of UNESCO-listed Val d'Orcia in Tuscany. Visit Montepulciano for exclusive underground wine cellar tastings of Vino Nobile, followed by Pienza for artisanal Pecorino cheese tastings and panoramic valley views.",
    highlights: JSON.stringify([
      "Day trip from Rome to Tuscan countryside & Val d'Orcia",
      "Tasting of 3-4 fine wines at historic underground winery in Montepulciano",
      "Pecorino cheese tasting in UNESCO medieval Pienza",
      "Roundtrip travel by GT luxury air-conditioned coach"
    ]),
    includes: JSON.stringify([
      "Roundtrip transport from Rome by GT coach",
      "Expert tour leader",
      "Winery visit & 3-4 wine tastings",
      "Pecorino cheese tasting"
    ]),
    options: JSON.stringify([
      { name: "Val d'Orcia Day Tour from Rome", price: 115.00, duration: "12 Hours" },
      { name: "VIP Small Group Tour with Tuscan Farmhouse Lunch", price: 175.00, duration: "12 Hours" }
    ]),
    schedule: JSON.stringify([
      { type: "Departure", address: "Piazza del Popolo, Rome (In front of Leonardo da Vinci Museum)", metro: "Flaminio (Metro A)", time: "07:30 AM Departure" },
      { type: "Arrival", address: "Return to Piazza del Popolo, Rome", metro: "", time: "07:30 PM Arrival" }
    ]),
    seoTitle: "Tuscany Val d'Orcia Wine & Cheese Tasting Tour from Rome",
    seoDescription: "Book Montepulciano & Pienza day tour from Rome with wine tasting and Pecorino cheese sampling in Tuscany.",
    isActive: true,
    order: 4
  }
];

export const getSightseeingTours = asyncHandler(async (req, res) => {
  await ensureTablesExist();

  const search = req.query.search;
  const city = req.query.city;
  const isAdmin = req.query.admin === "true";
  const page = parseInt(req.query.page, 10) || 1;
  const limit = isAdmin ? 100 : (parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;

  try {
    const where = {
      ...(isAdmin ? {} : { isActive: true }),
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

    let [tours, total] = await Promise.all([
      prisma.sightseeingTour.findMany({
        where,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.sightseeingTour.count({ where }),
    ]);

    // Seed default tours if DB table is currently empty
    if (!tours || (tours.length === 0 && total === 0 && page === 1 && !search && !city)) {
      for (const seed of SEED_TOURS) {
        try {
          await prisma.sightseeingTour.create({ data: seed });
        } catch (e) {
          // ignore duplicate seed error
        }
      }
      const allSeeded = await prisma.sightseeingTour.findMany({
        where: { ...(isAdmin ? {} : { isActive: true }) },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      });
      const seededTotal = await prisma.sightseeingTour.count({ where: { ...(isAdmin ? {} : { isActive: true }) } });
      tours = allSeeded;
      total = seededTotal;
    }

    // Admin gets flat array (backward compat), client gets paginated response
    if (isAdmin) {
      return apiResponse(res, 200, "Sightseeing tours retrieved", tours);
    }

    return apiResponse(res, 200, "Sightseeing tours retrieved", {
      items: tours,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Failed to fetch sightseeing tours:", err);
    if (isAdmin) {
      return apiResponse(res, 200, "Sightseeing tours retrieved", SEED_TOURS);
    }
    const pagedSeeds = SEED_TOURS.slice(skip, skip + limit);
    return apiResponse(res, 200, "Sightseeing tours retrieved", {
      items: pagedSeeds,
      pagination: { page, limit, total: SEED_TOURS.length, pages: Math.ceil(SEED_TOURS.length / limit) },
    });
  }
});

export const getSightseeingBySlug = asyncHandler(async (req, res) => {
  await ensureTablesExist();
  const { slug } = req.params;

  try {
    const tour = await prisma.sightseeingTour.findFirst({
      where: {
        OR: [{ slug: slug }, { id: slug }],
      },
    });

    if (tour) {
      return apiResponse(res, 200, "Sightseeing tour retrieved", tour);
    }

    const fallback = SEED_TOURS.find((t) => t.slug === slug || t.id === slug);
    if (fallback) {
      return apiResponse(res, 200, "Sightseeing tour retrieved", fallback);
    }

    throw new ApiError(404, "Sightseeing tour not found");
  } catch (err) {
    const fallback = SEED_TOURS.find((t) => t.slug === slug || t.id === slug);
    if (fallback) {
      return apiResponse(res, 200, "Sightseeing tour retrieved", fallback);
    }
    throw new ApiError(404, "Sightseeing tour not found");
  }
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

  // 1. Send Email Notification to Admin
  const adminEmail = process.env.ADMIN_EMAIL || process.env.BREVO_SMTP_USER || "codeshorts007@gmail.com";
  try {
    await sendEmail({
      to: adminEmail,
      subject: `🏛️ New Sightseeing Activity Booking Request: ${sightseeingTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #0B1528; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0;">
            <h2 style="color: #060C17; margin-top: 0;">🏛️ New Sightseeing Tour Enquiry</h2>
            <p style="color: #64748b; font-size: 14px;">A customer has requested a sightseeing activity booking on Europe Transfers.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #64748b; width: 140px;">Activity:</td><td style="padding: 8px 0; font-weight: bold; color: #060C17;">${sightseeingTitle}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Selected Option:</td><td style="padding: 8px 0; font-weight: bold; color: #2563eb;">${optionSelected || "Standard Option"}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">City / Region:</td><td style="padding: 8px 0; font-weight: bold; color: #060C17;">${cityName || "Europe"}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Quoted Price:</td><td style="padding: 8px 0; font-weight: bold; color: #059669;">€${priceDisplay || "N/A"} / person</td></tr>
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

  // 2. Send Email Confirmation to Customer
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
              <p style="margin: 4px 0; font-size: 13px;"><strong>Price:</strong> €${priceDisplay || "N/A"} / person</p>
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
