import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getBlogCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  const formatted = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    metaTitle: cat.metaTitle,
    metaDescription: cat.metaDescription,
    postsCount: cat._count.posts,
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt,
  }));

  return apiResponse(res, 200, "Categories retrieved", formatted);
});

export const getBlogCategoryById = asyncHandler(async (req, res) => {
  const category = await prisma.blogCategory.findUnique({
    where: { id: req.params.id },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return apiResponse(res, 200, "Category retrieved", {
    ...category,
    postsCount: category._count.posts,
  });
});

export const createBlogCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, metaTitle, metaDescription } = req.body;

  if (!name || !slug) {
    throw new ApiError(400, "Category Name and URL Slug are required");
  }

  const cleanSlug = slug.replace(/^\/+/, "").trim();

  const existing = await prisma.blogCategory.findUnique({ where: { slug: cleanSlug } });
  if (existing) {
    throw new ApiError(400, "A category with this URL slug already exists");
  }

  const category = await prisma.blogCategory.create({
    data: {
      name,
      slug: cleanSlug,
      description: description || null,
      metaTitle: metaTitle || `${name} Guides & Articles | Europe Transfers Blog`,
      metaDescription:
        metaDescription ||
        (description
          ? description.substring(0, 155)
          : `Explore ${name} articles, destination guides, and Europe travel tips from Europe Transfers.`),

    },
  });

  return apiResponse(res, 201, "Category created successfully", category);

});

export const updateBlogCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, metaTitle, metaDescription } = req.body;

  const existing = await prisma.blogCategory.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Category not found");
  }

  const dataToUpdate = {};
  if (name !== undefined) dataToUpdate.name = name;
  if (slug !== undefined) {
    const cleanSlug = slug.replace(/^\/+/, "").trim();
    if (cleanSlug !== existing.slug) {
      const slugCheck = await prisma.blogCategory.findUnique({ where: { slug: cleanSlug } });
      if (slugCheck) throw new ApiError(400, "Slug already in use");
    }
    dataToUpdate.slug = cleanSlug;
  }
  if (description !== undefined) dataToUpdate.description = description;
  if (metaTitle !== undefined) dataToUpdate.metaTitle = metaTitle;
  if (metaDescription !== undefined) dataToUpdate.metaDescription = metaDescription;

  const updatedCategory = await prisma.blogCategory.update({
    where: { id: req.params.id },
    data: dataToUpdate,
  });

  return apiResponse(res, 200, "Category updated successfully", updatedCategory);
});

export const deleteBlogCategory = asyncHandler(async (req, res) => {
  const existing = await prisma.blogCategory.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    throw new ApiError(404, "Category not found");
  }

  // Unlink posts first to prevent FK constraint errors
  await prisma.blogPost.updateMany({
    where: { categoryId: req.params.id },
    data: { categoryId: null },
  });

  await prisma.blogCategory.delete({ where: { id: req.params.id } });
  return apiResponse(res, 200, "Category deleted successfully");
});

