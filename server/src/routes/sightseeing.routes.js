import { Router } from "express";
import {
  getSightseeingTours,
  getSightseeingBySlug,
  submitSightseeingEnquiry,
  getSightseeingEnquiries,
  createSightseeingTour,
  updateSightseeingTour,
  deleteSightseeingTour,
} from "../controllers/sightseeing.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

const enquirySchema = z.object({
  sightseeingId: z.string().optional(),
  sightseeingTitle: z.string().min(1),
  optionSelected: z.string().optional(),
  cityName: z.string().optional(),
  priceDisplay: z.string().optional(),
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  travelDate: z.string().optional(),
  pax: z.union([z.number(), z.string()]).optional(),
  message: z.string().optional(),
  notes: z.string().optional(),
});

// Public Routes
router.get("/", getSightseeingTours);
router.post("/enquire", validate(enquirySchema), submitSightseeingEnquiry);

// Admin Routes (must be registered before "/:slug" so they aren't shadowed)
router.get("/admin/enquiries", protectAdmin, getSightseeingEnquiries);
router.post("/admin/tours", protectAdmin, createSightseeingTour);
router.put("/admin/tours/:id", protectAdmin, updateSightseeingTour);
router.delete("/admin/tours/:id", protectAdmin, deleteSightseeingTour);

router.get("/:slug", getSightseeingBySlug);

export default router;
