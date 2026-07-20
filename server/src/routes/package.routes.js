import { Router } from "express";
import {
  getPackages, getPackageById, createPackage, updatePackage, deletePackage,
  getItinerary, createItinerary, updateItinerary, deleteItinerary,
} from "../controllers/package.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

const packageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  countryId: z.string().min(1),
  durationDays: z.number().int().min(1),
  coverImage: z.string().url().optional(),
  summary: z.string().optional(),
  priceFrom: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

const itinerarySchema = z.object({
  dayNumber: z.number().int().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

router.get("/", getPackages);
router.get("/:id", getPackageById);
router.post("/", protectAdmin, validate(packageSchema), createPackage);
router.put("/:id", protectAdmin, validate(packageSchema.partial()), updatePackage);
router.delete("/:id", protectAdmin, deletePackage);

router.get("/:id/itinerary", getItinerary);
router.post("/:id/itinerary", protectAdmin, validate(itinerarySchema), createItinerary);
router.put("/:id/itinerary/:dayId", protectAdmin, validate(itinerarySchema.partial()), updateItinerary);
router.delete("/:id/itinerary/:dayId", protectAdmin, deleteItinerary);

export default router;
