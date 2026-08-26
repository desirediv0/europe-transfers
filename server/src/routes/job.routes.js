import { Router } from "express";
import {
  getJobs,
  getAdminJobs,
  getJobBySlug,
  createJob,
  updateJob,
  deleteJob,
  applyToJob,
  getJobApplications,
  updateApplicationStatus,
  deleteJobApplication,
} from "../controllers/job.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import cvUpload from "../middlewares/cvUpload.middleware.js";
import { z } from "zod";

const router = Router();

const jobSchema = z.object({
  title: z.string().min(1),
  location: z.string().min(1),
  type: z.string().min(1),
  description: z.string().min(1),
  isActive: z.boolean().optional(),
  order: z.number().int().optional(),
});

const applicationStatusSchema = z.object({
  status: z.enum(["PENDING", "REVIEWED", "SHORTLISTED", "REJECTED", "HIRED"]),
});

// Public Routes
router.get("/", getJobs);
router.post("/:jobId/apply", cvUpload.single("cv"), applyToJob);

// Admin Routes (must be registered before "/:slug" so they aren't shadowed)
router.get("/admin/all", protectAdmin, getAdminJobs);
router.post("/admin", protectAdmin, validate(jobSchema), createJob);
router.put("/admin/:id", protectAdmin, validate(jobSchema.partial()), updateJob);
router.delete("/admin/:id", protectAdmin, deleteJob);

router.get("/admin/applications", protectAdmin, getJobApplications);
router.put("/admin/applications/:id", protectAdmin, validate(applicationStatusSchema), updateApplicationStatus);
router.delete("/admin/applications/:id", protectAdmin, deleteJobApplication);

router.get("/:slug", getJobBySlug);

export default router;
