import { Router } from "express";
import {
  getRoutePrices,
  getRoutePriceById,
  upsertRoutePrice,
  bulkUpsertRoutePrices,
  deleteRoutePrice,
} from "../controllers/routePrice.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

const upsertSchema = z.object({
  routeId: z.string().min(1),
  carTypeId: z.string().min(1),
  price: z.number().min(0),
  currency: z.string().optional(),
});

const bulkUpsertSchema = z.object({
  routeId: z.string().min(1),
  prices: z.array(
    z.object({
      carTypeId: z.string().min(1),
      price: z.number().min(0),
      currency: z.string().optional(),
    }),
  ),
});

router.get("/", protectAdmin, getRoutePrices);
router.get("/:id", protectAdmin, getRoutePriceById);
router.post("/", protectAdmin, validate(upsertSchema), upsertRoutePrice);
router.post("/bulk", protectAdmin, validate(bulkUpsertSchema), bulkUpsertRoutePrices);
router.delete("/:id", protectAdmin, deleteRoutePrice);

export default router;
