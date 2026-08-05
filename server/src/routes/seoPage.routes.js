import { Router } from "express";
import {
  getSeoPages,
  getSeoPageById,
  getSeoPageBySlug,
  createSeoPage,
  updateSeoPage,
  deleteSeoPage,
} from "../controllers/seoPage.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";

const router = Router();

router.get("/", getSeoPages);
router.get("/slug/:slug", getSeoPageBySlug);
router.get("/:id", getSeoPageById);
router.post("/", protectAdmin, createSeoPage);
router.put("/:id", protectAdmin, updateSeoPage);
router.delete("/:id", protectAdmin, deleteSeoPage);

export default router;
