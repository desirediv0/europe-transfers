import { Router } from "express";
import {
  getLocations,
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../controllers/location.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

const locationSchema = z.object({
  name: z.string().min(1),
  city: z.string().min(1),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
});

router.get("/", getLocations);
router.get("/all", getAllLocations);
router.get("/:id", getLocationById);
router.post("/", protectAdmin, validate(locationSchema), createLocation);
router.put("/:id", protectAdmin, validate(locationSchema.partial()), updateLocation);
router.delete("/:id", protectAdmin, deleteLocation);

export default router;
