import { Router } from "express";
import {
  getBlogTags,
  getBlogTagById,
  createBlogTag,
  updateBlogTag,
  deleteBlogTag,
} from "../controllers/blogTag.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";

const router = Router();

router.get("/", getBlogTags);
router.get("/:id", getBlogTagById);
router.post("/", protectAdmin, createBlogTag);
router.put("/:id", protectAdmin, updateBlogTag);
router.delete("/:id", protectAdmin, deleteBlogTag);

export default router;
