import { Router } from "express";
import {
  getPrivateTransferCities,
  getAllPrivateTransferCities,
  getPrivateTransferCityById,
  createPrivateTransferCity,
  updatePrivateTransferCity,
  deletePrivateTransferCity,
  getPrivateTransferRoutes,
  createPrivateTransferRoute,
  updatePrivateTransferRoute,
  deletePrivateTransferRoute,
  submitPrivateTransferEnquiry,
  getPrivateTransferEnquiries,
} from "../controllers/privateTransfer.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

const routeSchema = z.object({
  description: z.string().min(1),
  sedanPrice: z.number(),
  minivanPrice: z.number(),
  currency: z.string().optional(),
  order: z.number().optional(),
});

const citySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  coverImage: z.string().url().optional().nullable(),
  order: z.number().optional(),
  routes: z.array(routeSchema).optional(),
});

const enquirySchema = z.object({
  cityName: z.string().min(1),
  routeDescription: z.string().min(1),
  vehicleType: z.string().min(1),
  price: z.number(),
  currency: z.string().optional(),
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  pickupDate: z.string().optional(),
  pickupTime: z.string().optional(),
  message: z.string().optional(),
});

// Enquiry routes (public submit & admin list)
router.post("/enquire", validate(enquirySchema), submitPrivateTransferEnquiry);
router.get("/enquiries", protectAdmin, getPrivateTransferEnquiries);

// City routes
router.get("/", getPrivateTransferCities);
router.get("/all", getAllPrivateTransferCities);
router.get("/:id", getPrivateTransferCityById);
router.post("/", protectAdmin, validate(citySchema), createPrivateTransferCity);
router.put("/:id", protectAdmin, validate(citySchema.partial()), updatePrivateTransferCity);
router.delete("/:id", protectAdmin, deletePrivateTransferCity);

// Route sub-resource
router.get("/routes/list", getPrivateTransferRoutes);
router.post("/routes", protectAdmin, validate(routeSchema.extend({ cityId: z.string().min(1) })), createPrivateTransferRoute);
router.put("/routes/:id", protectAdmin, validate(routeSchema.partial()), updatePrivateTransferRoute);
router.delete("/routes/:id", protectAdmin, deletePrivateTransferRoute);

export default router;

