import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const paginateArgs = (page = 1, limit = 10) => {
  return { skip: (page - 1) * limit, take: limit };
};

export const getBlogPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const categoryId = req.query.categoryId;
  const categorySlug = req.query.categorySlug;
  const tagSlug = req.query.tagSlug;
  const status = req.query.status;
  const search = req.query.search;

  const where = {};
  if (categoryId) where.categoryId = categoryId;
  if (categorySlug) where.category = { slug: categorySlug };
  if (tagSlug) where.tags = { some: { tag: { slug: tagSlug } } };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }


  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        tags: {
          include: { tag: true },
        },
      },
      ...paginateArgs(page, limit),
    }),
    prisma.blogPost.count({ where }),
  ]);

  return apiResponse(res, 200, "Blog posts retrieved", {
    items: posts,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getBlogPostById = asyncHandler(async (req, res) => {
  const post = await prisma.blogPost.findUnique({
    where: { id: req.params.id },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  if (!post) {
    throw new ApiError(404, "Blog post not found");
  }

  return apiResponse(res, 200, "Blog post retrieved", post);
});

export const getBlogPostBySlug = asyncHandler(async (req, res) => {
  const post = await prisma.blogPost.findUnique({
    where: { slug: req.params.slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  if (!post) {
    throw new ApiError(404, "Blog post not found");
  }

  return apiResponse(res, 200, "Blog post retrieved", post);
});

export const createBlogPost = asyncHandler(async (req, res) => {
  const {
    title,
    slug,
    content,
    coverImage,
    categoryId,
    tagIds,
    status,
    metaTitle,
    metaDescription,
    metaKeywords,
  } = req.body;

  if (!title || !slug) {
    throw new ApiError(400, "Title and URL Slug are required");
  }

  const cleanSlug = slug.replace(/^\/+/, "").trim();

  const existing = await prisma.blogPost.findUnique({ where: { slug: cleanSlug } });
  if (existing) {
    throw new ApiError(400, "A post with this URL slug already exists");
  }

  const isPublished = status === "PUBLISHED";

  // Clean HTML from content to make clean meta description snippet
  const rawText = (content || "").replace(/<[^>]*>?/gm, "").trim();
  const autoMetaDesc = rawText
    ? rawText.substring(0, 155) + (rawText.length > 155 ? "..." : "")
    : `Read ${title} on Europe Transfers blog. Travel tips, Europe transfers, and DMC insights.`;

  const autoMetaKeywords = [title, "Europe Travel", "Europe Transfers", "B2B Transfers"]
    .filter(Boolean)
    .join(", ");

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug: cleanSlug,
      content: content || null,
      coverImage: coverImage || null,
      categoryId: categoryId || null,
      status: status || "DRAFT",
      publishedAt: isPublished ? new Date() : null,
      metaTitle: metaTitle || `${title} | Europe Transfers Blog`,
      metaDescription: metaDescription || autoMetaDesc,
      metaKeywords: metaKeywords || autoMetaKeywords,

      tags: Array.isArray(tagIds) && tagIds.length > 0
        ? {
            create: tagIds.map((tagId) => ({ tagId })),
          }
        : undefined,
    },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  return apiResponse(res, 201, "Blog post created successfully", post);
});


export const updateBlogPost = asyncHandler(async (req, res) => {
  const {
    title,
    slug,
    content,
    coverImage,
    categoryId,
    tagIds,
    status,
    metaTitle,
    metaDescription,
    metaKeywords,
  } = req.body;

  const existing = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Blog post not found");
  }

  const dataToUpdate = {};
  if (title !== undefined) dataToUpdate.title = title;
  if (slug !== undefined) {
    const cleanSlug = slug.replace(/^\/+/, "").trim();
    if (cleanSlug !== existing.slug) {
      const slugCheck = await prisma.blogPost.findUnique({ where: { slug: cleanSlug } });
      if (slugCheck) throw new ApiError(400, "Slug already in use");
    }
    dataToUpdate.slug = cleanSlug;
  }
  if (content !== undefined) dataToUpdate.content = content;
  if (coverImage !== undefined) dataToUpdate.coverImage = coverImage;
  if (categoryId !== undefined) dataToUpdate.categoryId = categoryId;
  if (status !== undefined) {
    dataToUpdate.status = status;
    if (status === "PUBLISHED" && !existing.publishedAt) {
      dataToUpdate.publishedAt = new Date();
    }
  }
  if (metaTitle !== undefined) dataToUpdate.metaTitle = metaTitle;
  if (metaDescription !== undefined) dataToUpdate.metaDescription = metaDescription;
  if (metaKeywords !== undefined) dataToUpdate.metaKeywords = metaKeywords;

  if (Array.isArray(tagIds)) {
    await prisma.blogPostTag.deleteMany({ where: { postId: req.params.id } });
    if (tagIds.length > 0) {
      dataToUpdate.tags = {
        create: tagIds.map((tagId) => ({ tagId })),
      };
    }
  }

  const updatedPost = await prisma.blogPost.update({
    where: { id: req.params.id },
    data: dataToUpdate,
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  });

  return apiResponse(res, 200, "Blog post updated successfully", updatedPost);
});

export const deleteBlogPost = asyncHandler(async (req, res) => {
  const existing = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Blog post not found");
  }

  // Delete relations first to prevent Foreign Key constraint errors
  await prisma.blogPostTag.deleteMany({ where: { postId: req.params.id } });
  await prisma.blogPost.delete({ where: { id: req.params.id } });
  return apiResponse(res, 200, "Blog post deleted successfully");
});

