import { Router } from "express";
import {
  createOrder,
  createBookingOrder,
  verifyBookingPayment,
  verifyPayment,
  getOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/payment.controller.js";
import protectUser from "../middlewares/auth.middleware.js";
import protectAdmin from "../middlewares/adminAuth.middleware.js";

const router = Router();

router.post("/create-order", protectUser, createOrder);
router.post("/verify-payment", protectUser, verifyPayment);
router.post("/booking/create-order", protectUser, createBookingOrder);
router.post("/booking/verify", protectUser, verifyBookingPayment);
router.get("/my-orders", protectUser, getUserOrders);
router.get("/admin/all", protectAdmin, getAllOrders);
router.get("/:id", protectUser, getOrder);
router.put("/:id/status", protectAdmin, updateOrderStatus);

export default router;
