import { Router } from "express";
import {
  getBlogCategories,
  getBlogCategoryById,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
} from "../controllers/blogCategory.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";

const router = Router();

router.get("/", getBlogCategories);
router.get("/:id", getBlogCategoryById);
router.post("/", protectAdmin, createBlogCategory);
router.put("/:id", protectAdmin, updateBlogCategory);
router.delete("/:id", protectAdmin, deleteBlogCategory);

export default router;
