import crypto from "crypto";
import razorpay from "../config/razorpay.js";
import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    throw new ApiError(400, "bookingId is required");
  }

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_ID.includes("placeholder")) {
    throw new ApiError(503, "Payment gateway not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      route: { include: { fromLocation: true, toLocation: true } },
      carType: true,
    },
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.paymentStatus === "PAID") {
    throw new ApiError(400, "Booking is already paid");
  }

  const amountInPaise = Math.round(Number(booking.price) * 100);

  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: booking.currency || "EUR",
    receipt: booking.id,
    notes: {
      bookingId: booking.id,
      customerName: booking.customerName,
      phone: booking.phone,
      route: `${booking.route?.fromLocation?.name} → ${booking.route?.toLocation?.name}`,
    },
  });

  return apiResponse(res, 200, "Order created", {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    customerName: booking.customerName,
    email: booking.email || undefined,
    phone: booking.phone,
    description: `Transfer: ${booking.route?.fromLocation?.name} → ${booking.route?.toLocation?.name}`,
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
    throw new ApiError(400, "Missing payment verification fields");
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: "FAILED",
        paymentId: razorpay_payment_id,
        message: "Payment signature verification failed",
      },
    });
    throw new ApiError(400, "Payment verification failed — invalid signature");
  }

  const payment = await razorpay.payments.fetch(razorpay_payment_id);

  if (payment.status !== "captured" && payment.status !== "authorized") {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: "FAILED",
        paymentId: razorpay_payment_id,
        message: `Payment status: ${payment.status}`,
      },
    });
    throw new ApiError(400, `Payment not completed — status: ${payment.status}`);
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: "PAID",
      bookingStatus: "CONFIRMED",
      paymentId: razorpay_payment_id,
      message: `Paid via Razorpay | Order: ${razorpay_order_id} | Payment: ${razorpay_payment_id}`,
    },
    include: {
      route: { include: { fromLocation: true, toLocation: true } },
      carType: true,
    },
  });

  return apiResponse(res, 200, "Payment verified successfully", updatedBooking);
});

export const webhookHandler = asyncHandler(async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  if (!webhookSecret) {
    return apiResponse(res, 200, "Webhook secret not configured");
  }

  const body = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== signature) {
    return apiResponse(res, 400, "Invalid webhook signature");
  }

  const event = req.body.event;
  const paymentEntity = req.body.payload?.payment?.entity;

  if (event === "payment.captured" && paymentEntity) {
    const receipt = paymentEntity.receipt;
    if (receipt) {
      await prisma.booking.update({
        where: { id: receipt },
        data: {
          paymentStatus: "PAID",
          bookingStatus: "CONFIRMED",
          paymentId: paymentEntity.id,
          message: `Paid via Razorpay webhook | Payment: ${paymentEntity.id}`,
        },
      }).catch(() => {});
    }
  }

  if (event === "payment.failed" && paymentEntity) {
    const receipt = paymentEntity.receipt;
    if (receipt) {
      await prisma.booking.update({
        where: { id: receipt },
        data: {
          paymentStatus: "FAILED",
          paymentId: paymentEntity.id,
          message: `Failed via Razorpay webhook | ${paymentEntity.error_description || paymentEntity.status}`,
        },
      }).catch(() => {});
    }
  }

  return apiResponse(res, 200, "Webhook processed");
});

export const getPaymentStatus = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      paymentStatus: true,
      bookingStatus: true,
      paymentId: true,
      price: true,
      currency: true,
      message: true,
    },
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  return apiResponse(res, 200, "Payment status retrieved", booking);
});
