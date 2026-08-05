import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const paginateArgs = (page = 1, limit = 20) => {
  return { skip: (page - 1) * limit, take: limit };
};

export const getSeoPages = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const search = req.query.search || "";
  const status = req.query.status || "";
  const category = req.query.category || "";

  const where = {};
  if (status) {
    where.status = status;
  }
  if (category) {
    where.linkedCategory = { equals: category, mode: "insensitive" };
  }
  if (search) {
    const searchCondition = {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { linkedCategory: { contains: search, mode: "insensitive" } },
      ],
    };
    if (where.status || where.linkedCategory) {
      where.AND = [searchCondition];
    } else {
      where.OR = searchCondition.OR;
    }
  }

  const [pages, total] = await Promise.all([
    prisma.seoPage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...paginateArgs(page, limit),
    }),
    prisma.seoPage.count({ where }),
  ]);


  return apiResponse(res, 200, "SEO pages retrieved", {
    items: pages,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getSeoPageById = asyncHandler(async (req, res) => {
  const page = await prisma.seoPage.findUnique({ where: { id: req.params.id } });
  if (!page) {
    throw new ApiError(404, "SEO page not found");
  }
  return apiResponse(res, 200, "SEO page retrieved", page);
});

export const getSeoPageBySlug = asyncHandler(async (req, res) => {
  const page = await prisma.seoPage.findUnique({ where: { slug: req.params.slug } });
  if (!page) {
    throw new ApiError(404, "SEO page not found");
  }
  return apiResponse(res, 200, "SEO page retrieved", page);
});

export const createSeoPage = asyncHandler(async (req, res) => {
  const {
    title,
    slug,
    linkedCategory,
    pageDescription,
    cityContent,
    additionalSeoContent,
    faqs,
    metaTitle,
    metaDescription,
    metaKeywords,
    status,
  } = req.body;

  if (!title || !slug) {
    throw new ApiError(400, "Title and URL Slug are required");
  }

  const cleanSlug = slug.replace(/^\/+/, "").trim();

  const existing = await prisma.seoPage.findUnique({ where: { slug: cleanSlug } });
  if (existing) {
    throw new ApiError(400, "A page with this URL slug already exists");
  }

  // Auto-generate missing SEO metadata
  const fallbackSeo = {
    metaTitle: metaTitle || `${title} - Europe Transfers | B2B Europe Travel Partner`,
    metaDescription:
      metaDescription ||
      (pageDescription
        ? pageDescription.substring(0, 155) + "..."
        : `Book ${title} with Europe Transfers. Premium B2B Europe travel transfers and DMC partner.`),
    metaKeywords:
      metaKeywords ||
      [title, linkedCategory, "Europe Transfers", "B2B Travel", "Europe Transfers Partner"]
        .filter(Boolean)
        .join(", "),
  };


  const seoPage = await prisma.seoPage.create({
    data: {
      title,
      slug: cleanSlug,
      linkedCategory: linkedCategory || null,
      pageDescription: pageDescription || null,
      cityContent: cityContent || null,
      additionalSeoContent: additionalSeoContent || null,
      faqs: faqs || [],
      metaTitle: fallbackSeo.metaTitle,
      metaDescription: fallbackSeo.metaDescription,
      metaKeywords: fallbackSeo.metaKeywords,
      status: status || "ACTIVE",
    },
  });

  return apiResponse(res, 201, "SEO page created successfully", seoPage);
});


export const updateSeoPage = asyncHandler(async (req, res) => {
  const {
    title,
    slug,
    linkedCategory,
    pageDescription,
    cityContent,
    additionalSeoContent,
    faqs,
    metaTitle,
    metaDescription,
    metaKeywords,
    status,
  } = req.body;

  const existing = await prisma.seoPage.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "SEO page not found");
  }

  const dataToUpdate = {};
  if (title !== undefined) dataToUpdate.title = title;
  if (slug !== undefined) {
    const cleanSlug = slug.replace(/^\/+/, "").trim();
    if (cleanSlug !== existing.slug) {
      const slugCheck = await prisma.seoPage.findUnique({ where: { slug: cleanSlug } });
      if (slugCheck) throw new ApiError(400, "Slug already in use");
    }
    dataToUpdate.slug = cleanSlug;
  }
  if (linkedCategory !== undefined) dataToUpdate.linkedCategory = linkedCategory;
  if (pageDescription !== undefined) dataToUpdate.pageDescription = pageDescription;
  if (cityContent !== undefined) dataToUpdate.cityContent = cityContent;
  if (additionalSeoContent !== undefined) dataToUpdate.additionalSeoContent = additionalSeoContent;
  if (faqs !== undefined) dataToUpdate.faqs = faqs;
  if (metaTitle !== undefined) dataToUpdate.metaTitle = metaTitle;
  if (metaDescription !== undefined) dataToUpdate.metaDescription = metaDescription;
  if (metaKeywords !== undefined) dataToUpdate.metaKeywords = metaKeywords;
  if (status !== undefined) dataToUpdate.status = status;

  const updatedPage = await prisma.seoPage.update({
    where: { id: req.params.id },
    data: dataToUpdate,
  });

  return apiResponse(res, 200, "SEO page updated successfully", updatedPage);
});

export const deleteSeoPage = asyncHandler(async (req, res) => {
  const existing = await prisma.seoPage.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "SEO page not found");
  }
  await prisma.seoPage.delete({ where: { id: req.params.id } });
  return apiResponse(res, 200, "SEO page deleted successfully");
});
