import { Router } from "express";
import { getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle } from "../controllers/vehicle.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

const vehicleSchema = z.object({
  cityId: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["SEDAN", "MINI_VAN", "MID_COACH", "LARGE_COACH"]),
  seatsMin: z.number().int().min(1),
  seatsMax: z.number().int().min(1),
  luggageMin: z.number().int().min(0),
  luggageMax: z.number().int().min(0),
  image: z.string().url().optional(),
});

router.get("/", getVehicles);
router.get("/:id", getVehicleById);
router.post("/", protectAdmin, validate(vehicleSchema), createVehicle);
router.put("/:id", protectAdmin, validate(vehicleSchema.partial()), updateVehicle);
router.delete("/:id", protectAdmin, deleteVehicle);

export default router;
