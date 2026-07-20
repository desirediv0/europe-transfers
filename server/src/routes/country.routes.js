import { Router } from "express";
import { getCountries, getCountryById, createCountry, updateCountry, deleteCountry } from "../controllers/country.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

const countrySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});

router.get("/", getCountries);
router.get("/:id", getCountryById);
router.post("/", protectAdmin, validate(countrySchema), createCountry);
router.put("/:id", protectAdmin, validate(countrySchema.partial()), updateCountry);
router.delete("/:id", protectAdmin, deleteCountry);

export default router;
