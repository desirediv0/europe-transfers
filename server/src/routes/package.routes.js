import { Router } from "express";
import {
  getPackages, getPackageById, createPackage, updatePackage, deletePackage,
  getItinerary, createItinerary, updateItinerary, deleteItinerary,
  submitPackageEnquiry, getPackageEnquiries,
} from "../controllers/package.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";
import protectUser from "../middlewares/auth.middleware.js";
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
  showOnHomepage: z.boolean().optional(),
});

const itinerarySchema = z.object({
  dayNumber: z.number().int().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

const enquirySchema = z.object({
  packageId: z.string().optional(),
  packageTitle: z.string().min(1),
  countryName: z.string().optional(),
  priceDisplay: z.string().optional(),
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  travelDate: z.string().optional(),
  pax: z.union([z.number(), z.string()]).optional(),
  message: z.string().optional(),
  notes: z.string().optional(),
});

// Enquiry routes (requires login to submit; admin can list)
router.post("/enquire", protectUser, validate(enquirySchema), submitPackageEnquiry);
router.get("/enquiries", protectAdmin, getPackageEnquiries);

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

