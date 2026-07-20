import { Router } from "express";
import {
  getBookings,
  getBookingById,
  getBookingByPhone,
  createBooking,
  updateBooking,
  deleteBooking,
} from "../controllers/booking.controller.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";
import { bookingRateLimiter } from "../middlewares/rateLimiter.js";
import validate from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

const bookingSchema = z.object({
  routeId: z.string().min(1),
  carTypeId: z.string().min(1),
  customerName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  pickupAddress: z.string().optional(),
  dropAddress: z.string().optional(),
  travelDate: z.string().min(1),
  travelTime: z.string().optional(),
  pax: z.number().int().min(1),
  luggageNotes: z.string().optional(),
  message: z.string().optional(),
});

const updateBookingSchema = z.object({
  bookingStatus: z.enum(["PENDING", "CONFIRMED", "ONGOING", "COMPLETED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "PARTIAL", "FAILED", "REFUNDED"]).optional(),
  paymentId: z.string().optional(),
});

router.post("/", bookingRateLimiter, validate(bookingSchema), createBooking);
router.get("/find", getBookingByPhone);
router.get("/", protectAdmin, getBookings);
router.get("/:id", protectAdmin, getBookingById);
router.put("/:id", protectAdmin, validate(updateBookingSchema), updateBooking);
router.delete("/:id", protectAdmin, deleteBooking);

export default router;
