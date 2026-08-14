import { Router } from "express";
import {
  getVanCoachVehicles,
  getAllVanCoachVehicles,
  getVanCoachVehicleById,
  createVanCoachVehicle,
  updateVanCoachVehicle,
  deleteVanCoachVehicle,
} from "../controllers/vanCoach.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

const routePriceSchema = z.object({
  group: z.enum(["AIRPORT_TRANSFER", "POINT_TO_POINT", "TOUR_PACKAGE"]),
  label: z.string().min(1),
  price: z.number(),
  order: z.number().optional(),
});

const vehicleSchema = z.object({
  name: z.string().min(1),
  seats: z.number().int().min(1),
  image: z.string().url().optional().nullable(),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  rate8h: z.number(),
  rate10h: z.number(),
  overtimeRate: z.number(),
  currency: z.string().optional(),
  order: z.number().optional(),
  routePrices: z.array(routePriceSchema).optional(),
});

router.get("/", getVanCoachVehicles);
router.get("/all", getAllVanCoachVehicles);
router.get("/:id", getVanCoachVehicleById);
router.post("/", protectAdmin, validate(vehicleSchema), createVanCoachVehicle);
router.put("/:id", protectAdmin, validate(vehicleSchema.partial()), updateVanCoachVehicle);
router.delete("/:id", protectAdmin, deleteVanCoachVehicle);

export default router;
