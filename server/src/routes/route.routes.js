import { Router } from "express";
import {
  getRoutes,
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
} from "../controllers/route.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

const createRouteSchema = z.object({
  fromLocationId: z.string().min(1),
  toLocationId: z.string().min(1),
});

const updateRouteSchema = z.object({
  isActive: z.boolean().optional(),
  fromLocationId: z.string().min(1).optional(),
  toLocationId: z.string().min(1).optional(),
});

router.get("/", getRoutes);
router.get("/all", getAllRoutes);
router.get("/:id", getRouteById);
router.post("/", protectAdmin, validate(createRouteSchema), createRoute);
router.put("/:id", protectAdmin, validate(updateRouteSchema), updateRoute);
router.delete("/:id", protectAdmin, deleteRoute);

export default router;
