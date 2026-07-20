import { Router } from "express";
import { getTestimonials, getTestimonialById, createTestimonial, updateTestimonial, deleteTestimonial } from "../controllers/testimonial.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

const testimonialSchema = z.object({
  name: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  message: z.string().min(1),
  isPublished: z.boolean().optional(),
});

router.get("/", getTestimonials);
router.get("/:id", getTestimonialById);
router.post("/", protectAdmin, validate(testimonialSchema), createTestimonial);
router.put("/:id", protectAdmin, validate(testimonialSchema.partial()), updateTestimonial);
router.delete("/:id", protectAdmin, deleteTestimonial);

export default router;
