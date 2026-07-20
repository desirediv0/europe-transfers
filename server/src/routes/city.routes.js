import { Router } from "express";
import { getCities, getCityById, createCity, updateCity, deleteCity } from "../controllers/city.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

const citySchema = z.object({
  countryId: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  image: z.string().url().optional(),
});

router.get("/", getCities);
router.get("/:id", getCityById);
router.post("/", protectAdmin, validate(citySchema), createCity);
router.put("/:id", protectAdmin, validate(citySchema.partial()), updateCity);
router.delete("/:id", protectAdmin, deleteCity);

export default router;
