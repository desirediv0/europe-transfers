import { Router } from "express";
import {
  saveStep1,
  resumeDraft,
  uploadImages,
  deleteImage,
  submitApplication,
  getFleetPartnerApplications,
  updateFleetPartnerStatus,
  deleteFleetPartnerApplication,
} from "../controllers/fleetPartner.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import { z } from "zod";

const router = Router();

const step1Schema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  country: z.string().min(1),
  city: z.string().min(1),
  vehicleType: z.string().min(1),
  vehicleDetails: z.string().optional(),
});

const resumeSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(1),
});

const statusSchema = z.object({
  status: z.enum(["SUBMITTED", "REVIEWED", "APPROVED", "REJECTED"]),
});

// Public Routes
router.post("/step1", validate(step1Schema), saveStep1);
router.post("/resume", validate(resumeSchema), resumeDraft);
router.post("/:id/images", upload.array("images", 4), uploadImages);
router.delete("/:id/images", deleteImage);
router.post("/:id/submit", submitApplication);

// Admin Routes
router.get("/admin/all", protectAdmin, getFleetPartnerApplications);
router.put("/admin/:id/status", protectAdmin, validate(statusSchema), updateFleetPartnerStatus);
router.delete("/admin/:id", protectAdmin, deleteFleetPartnerApplication);

export default router;
