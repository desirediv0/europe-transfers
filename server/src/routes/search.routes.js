import { Router } from "express";
import { search, getLocations } from "../controllers/search.controller.js";
import { otpRateLimiter } from "../middlewares/rateLimiter.js";
import validate from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

const searchSchema = z.object({
  fromLocationId: z.string().min(1),
  toLocationId: z.string().min(1),
  passengers: z.number().int().min(1),
});

router.get("/locations", getLocations);
router.post("/", validate(searchSchema), search);

export default router;
