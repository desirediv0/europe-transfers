import { Router } from "express";
import { getRates, getRateById, createRate, updateRate, deleteRate } from "../controllers/rate.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

const rateSchema = z.object({
  vehicleId: z.string().min(1),
  mode: z.enum(["HOURLY", "TRANSFER"]),
  label: z.string().min(1),
  price: z.number().min(0),
  currency: z.string().optional(),
});

router.get("/", getRates);
router.get("/:id", getRateById);
router.post("/", protectAdmin, validate(rateSchema), createRate);
router.put("/:id", protectAdmin, validate(rateSchema.partial()), updateRate);
router.delete("/:id", protectAdmin, deleteRate);

export default router;
