import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getBlogTags = asyncHandler(async (req, res) => {
  const tags = await prisma.blogTag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  const formatted = tags.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    postsCount: t._count.posts,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));

  return apiResponse(res, 200, "Tags retrieved", formatted);
});

export const getBlogTagById = asyncHandler(async (req, res) => {
  const tag = await prisma.blogTag.findUnique({
    where: { id: req.params.id },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  if (!tag) {
    throw new ApiError(404, "Tag not found");
  }

  return apiResponse(res, 200, "Tag retrieved", {
    ...tag,
    postsCount: tag._count.posts,
  });
});

export const createBlogTag = asyncHandler(async (req, res) => {
  const { name, slug } = req.body;

  if (!name || !slug) {
    throw new ApiError(400, "Tag Name and URL Slug are required");
  }

  const cleanSlug = slug.replace(/^\/+/, "").trim();

  const existing = await prisma.blogTag.findUnique({ where: { slug: cleanSlug } });
  if (existing) {
    throw new ApiError(400, "A tag with this URL slug already exists");
  }

  const tag = await prisma.blogTag.create({
    data: {
      name,
      slug: cleanSlug,
    },
  });

  return apiResponse(res, 201, "Tag created successfully", tag);
});

export const updateBlogTag = asyncHandler(async (req, res) => {
  const { name, slug } = req.body;

  const existing = await prisma.blogTag.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Tag not found");
  }

  const dataToUpdate = {};
  if (name !== undefined) dataToUpdate.name = name;
  if (slug !== undefined) {
    const cleanSlug = slug.replace(/^\/+/, "").trim();
    if (cleanSlug !== existing.slug) {
      const slugCheck = await prisma.blogTag.findUnique({ where: { slug: cleanSlug } });
      if (slugCheck) throw new ApiError(400, "Slug already in use");
    }
    dataToUpdate.slug = cleanSlug;
  }

  const updatedTag = await prisma.blogTag.update({
    where: { id: req.params.id },
    data: dataToUpdate,
  });

  return apiResponse(res, 200, "Tag updated successfully", updatedTag);
});

export const deleteBlogTag = asyncHandler(async (req, res) => {
  const existing = await prisma.blogTag.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Tag not found");
  }

  // Delete relations first to prevent FK constraint errors
  await prisma.blogPostTag.deleteMany({ where: { tagId: req.params.id } });
  await prisma.blogTag.delete({ where: { id: req.params.id } });
  return apiResponse(res, 200, "Tag deleted successfully");
});

