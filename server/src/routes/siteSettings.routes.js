import { Router } from "express";
import { getSiteSettings, updateSiteSettings } from "../controllers/siteSettings.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

const settingsSchema = z.object({
  showPrivateTransfers: z.boolean().optional(),
  showVanCoach: z.boolean().optional(),
  showPackages: z.boolean().optional(),
  showSightseeing: z.boolean().optional(),
});

router.get("/", getSiteSettings);
router.put("/", protectAdmin, validate(settingsSchema), updateSiteSettings);

export default router;
