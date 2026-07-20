import { Router } from "express";
import {
  createOrder,
  verifyPayment,
  webhookHandler,
  getPaymentStatus,
} from "../controllers/payment.controller.js";
import { bookingRateLimiter } from "../middlewares/rateLimiter.js";
import validate from "../middlewares/validate.middleware.js";
import { z } from "zod";

const router = Router();

const createOrderSchema = z.object({
  bookingId: z.string().min(1),
});

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  bookingId: z.string().min(1),
});

router.post("/create-order", bookingRateLimiter, validate(createOrderSchema), createOrder);
router.post("/verify", validate(verifySchema), verifyPayment);
router.post("/webhook", webhookHandler);
router.get("/status/:bookingId", getPaymentStatus);

export default router;
