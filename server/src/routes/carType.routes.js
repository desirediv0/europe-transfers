import { Router } from "express";
import {
  getCarTypes,
  getAllCarTypes,
  getCarTypeById,
  createCarType,
  updateCarType,
  deleteCarType,
} from "../controllers/carType.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

const carTypeSchema = z.object({
  name: z.string().min(1),
  seats: z.number().int().min(1),
  image: z.string().url().optional().nullable(),
  isAC: z.boolean().optional(),
});

router.get("/", getCarTypes);
router.get("/all", getAllCarTypes);
router.get("/:id", getCarTypeById);
router.post("/", protectAdmin, validate(carTypeSchema), createCarType);
router.put("/:id", protectAdmin, validate(carTypeSchema.partial()), updateCarType);
router.delete("/:id", protectAdmin, deleteCarType);

export default router;
