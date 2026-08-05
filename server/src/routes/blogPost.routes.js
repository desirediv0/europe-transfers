import { Router } from "express";
import {
  getBlogPosts,
  getBlogPostById,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "../controllers/blogPost.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";

const router = Router();

router.get("/", getBlogPosts);
router.get("/slug/:slug", getBlogPostBySlug);
router.get("/:id", getBlogPostById);
router.post("/", protectAdmin, createBlogPost);
router.put("/:id", protectAdmin, updateBlogPost);
router.delete("/:id", protectAdmin, deleteBlogPost);

export default router;
