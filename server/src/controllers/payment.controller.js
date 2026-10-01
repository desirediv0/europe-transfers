import Razorpay from "razorpay";
import crypto from "crypto";
import prisma from "../config/db.js";
import apiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendEmail } from "../config/mailer.js";
import { getRates } from "../config/currency.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = asyncHandler(async (req, res) => {
  const {
    productType,
    productId,
    productName,
    amount,
    currency = "EUR",
    customerName,
    customerEmail,
    customerPhone,
    travelDate,
    pax,
    optionSelected,
    notes,
  } = req.body;

  if (!productType || !productId || !productName || !amount || !customerName || !customerEmail || !customerPhone) {
    throw new ApiError(400, "Missing required fields: productType, productId, productName, amount, customerName, customerEmail, customerPhone");
  }

  const userId = req.user?.id || null;
  const orderPax = parseInt(pax, 10) || 1;

  // Double-click / retry guard: if the same user already has an unpaid order
  // for exactly this booking created in the last 15 minutes, hand back that
  // same order instead of creating a second Razorpay order + DB row.
  const recent = await prisma.order.findFirst({
    where: {
      userId,
      status: "CREATED",
      productType,
      productId,
      amount: Number(amount),
      pax: orderPax,
      optionSelected: optionSelected || null,
      travelDate: travelDate || null,
      razorpayOrderId: { not: null },
      createdAt: { gt: new Date(Date.now() - 15 * 60 * 1000) },
    },
    orderBy: { createdAt: "desc" },
  });
  if (recent && recent.amountInr != null) {
    return apiResponse(res, 200, "Order already created", {
      orderId: recent.id,
      razorpayOrderId: recent.razorpayOrderId,
      amount: Math.round(Number(recent.amountInr) * 100),
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
    });
  }

  // The site always sends its base EUR price here; Razorpay (INR-only account)
  // always charges the customer in INR, converted at today's rate.
  const rates = await getRates();
  const eurToInrRate = rates.INR;
  const amountEur = Number(amount);
  const amountInr = Math.round(amountEur * eurToInrRate * 100) / 100;
  const amountInPaise = Math.round(amountInr * 100);

  const razorpayOrder = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `order_${productType}_${productId}_${Date.now()}`,
    notes: {
      productType,
      productId,
      productName,
      customerName,
      customerEmail,
    },
  });

  const order = await prisma.order.create({
    data: {
      userId,
      productType,
      productId,
      productName,
      amount: amountEur,
      currency: currency || "EUR",
      amountInr,
      eurToInrRate,
      razorpayOrderId: razorpayOrder.id,
      status: "CREATED",
      customerName,
      customerEmail,
      customerPhone,
      travelDate: travelDate || null,
      pax: orderPax,
      optionSelected: optionSelected || null,
      notes: notes || null,
    },
  });

  return apiResponse(res, 201, "Order created", {
    orderId: order.id,
    razorpayOrderId: razorpayOrder.id,
    amount: amountInPaise,
    currency: "INR",
    key: process.env.RAZORPAY_KEY_ID,
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
    throw new ApiError(400, "Missing payment verification fields");
  }

  const orderToVerify = await prisma.order.findUnique({ where: { id: orderId } });
  if (!orderToVerify) {
    throw new ApiError(404, "Order not found");
  }
  // The signed Razorpay order must be the one created for THIS order, and
  // it must belong to the logged-in user - otherwise a valid signature from
  // one payment could be replayed to mark a different order as paid.
  if (orderToVerify.razorpayOrderId !== razorpay_order_id) {
    throw new ApiError(400, "Payment does not match this order");
  }
  if (orderToVerify.userId && req.user?.id && orderToVerify.userId !== req.user.id) {
    throw new ApiError(403, "This order belongs to another account");
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  const isValid = expectedSignature === razorpay_signature;

  if (!isValid) {
    // Only an unpaid order can be marked failed - never downgrade one that
    // was already captured.
    await prisma.order.updateMany({
      where: { id: orderId, status: "CREATED" },
      data: { status: "FAILED" },
    });
    throw new ApiError(400, "Payment verification failed");
  }

  const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existingOrder) {
    throw new ApiError(404, "Order not found");
  }

  // Idempotency guard: if this order was already captured (e.g. the client
  // retried the verify call, or the Razorpay handler fired twice), don't
  // re-process it or send duplicate confirmation emails.
  if (existingOrder.status === "CAPTURED") {
    return apiResponse(res, 200, "Payment already verified", { order: existingOrder });
  }

  const { count } = await prisma.order.updateMany({
    where: { id: orderId, status: { not: "CAPTURED" } },
    data: {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "CAPTURED",
    },
  });

  if (count === 0) {
    // Lost the race against a concurrent verify call; re-fetch and return
    // the now-captured order without sending a second round of emails.
    const settled = await prisma.order.findUnique({ where: { id: orderId } });
    return apiResponse(res, 200, "Payment already verified", { order: settled });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });

  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.BREVO_SMTP_USER || "info@theeuropetransfers.com";
    await sendEmail({
      to: adminEmail,
      subject: `Payment Received: ${order.productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #0B1528; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0;">
            <h2 style="color: #060C17; margin-top: 0;">Payment Received</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #64748b; width: 140px;">Product:</td><td style="padding: 8px 0; font-weight: bold;">${order.productName}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Type:</td><td style="padding: 8px 0; font-weight: bold;">${order.productType}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Amount:</td><td style="padding: 8px 0; font-weight: bold; color: #059669;">₹${order.amountInr ?? order.amount}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Customer:</td><td style="padding: 8px 0; font-weight: bold;">${order.customerName}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Email:</td><td style="padding: 8px 0; font-weight: bold;">${order.customerEmail}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Phone:</td><td style="padding: 8px 0; font-weight: bold;">${order.customerPhone}</td></tr>
              <tr><td style="padding: 8px 0; color: #64748b;">Payment ID:</td><td style="padding: 8px 0; font-weight: bold;">${razorpay_payment_id}</td></tr>
            </table>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send admin payment email:", err);
  }

  try {
    await sendEmail({
      to: order.customerEmail,
      subject: `Payment Confirmation - ${order.productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #0B1528; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0;">
            <h2 style="color: #060C17; margin-top: 0;">Payment Confirmed!</h2>
            <p style="color: #475569; font-size: 14px;">Dear <strong>${order.customerName}</strong>,</p>
            <p style="color: #475569; font-size: 14px;">Your payment for <strong>${order.productName}</strong> has been received successfully.</p>
            <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px; margin: 20px 0;">
              <p style="margin: 4px 0; font-size: 13px;"><strong>Product:</strong> ${order.productName}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Amount:</strong> ₹${order.amountInr ?? order.amount}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
            </div>
            <p style="color: #64748b; font-size: 13px;">Our team will contact you shortly with booking confirmation.</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send customer payment email:", err);
  }

  return apiResponse(res, 200, "Payment verified successfully", { order });
});

// ─── Private Transfers booking payments ─────────────────
// A Private Transfers booking is created first (POST /bookings, priced from
// the route price table) and then paid here. Razorpay charges in INR, so the
// booking's EUR price is converted at today's rate, same as the other orders.

const bookingInclude = {
  route: { include: { fromLocation: true, toLocation: true } },
  carType: true,
};

export const createBookingOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  if (!bookingId) {
    throw new ApiError(400, "bookingId is required");
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: bookingInclude });
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }
  if (booking.paymentStatus === "PAID") {
    throw new ApiError(400, "This booking is already paid");
  }
  if (booking.bookingStatus === "CANCELLED") {
    throw new ApiError(400, "This booking was cancelled");
  }

  const description = `${booking.route.fromLocation.name} to ${booking.route.toLocation.name} - ${booking.carType.name}`;

  // Double-click / retry guard: reuse the Razorpay order already created
  // for this booking instead of creating another one.
  if (booking.razorpayOrderId && booking.amountInr != null) {
    return apiResponse(res, 200, "Order already created", {
      orderId: booking.razorpayOrderId,
      amount: Math.round(Number(booking.amountInr) * 100),
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      description,
    });
  }

  const rates = await getRates();
  const amountEur = Number(booking.price);
  const amountInr = Math.round(amountEur * rates.INR * 100) / 100;
  const amountInPaise = Math.round(amountInr * 100);

  const razorpayOrder = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `booking_${booking.id}`,
    notes: { bookingId: booking.id, customerName: booking.customerName },
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: { razorpayOrderId: razorpayOrder.id, amountInr },
  });

  return apiResponse(res, 201, "Order created", {
    orderId: razorpayOrder.id,
    amount: amountInPaise,
    currency: "INR",
    keyId: process.env.RAZORPAY_KEY_ID,
    description,
  });
});

const detailRow = (label, value) =>
  value
    ? `<tr><td style="padding:6px 0;color:#64748b;width:150px;">${label}</td><td style="padding:6px 0;font-weight:bold;">${value}</td></tr>`
    : "";

export const verifyBookingPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
    throw new ApiError(400, "Missing payment verification fields");
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: bookingInclude });
  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }
  // The signed Razorpay order must be the one created for THIS booking.
  if (booking.razorpayOrderId !== razorpay_order_id) {
    throw new ApiError(400, "Payment does not match this booking");
  }

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");
  if (expected !== razorpay_signature) {
    await prisma.booking.updateMany({
      where: { id: bookingId, paymentStatus: "PENDING" },
      data: { paymentStatus: "FAILED" },
    });
    throw new ApiError(400, "Payment verification failed");
  }

  // Idempotent: a repeated verify call never re-processes or re-emails.
  if (booking.paymentStatus === "PAID") {
    return apiResponse(res, 200, "Payment already verified", booking);
  }

  const { count } = await prisma.booking.updateMany({
    where: { id: bookingId, paymentStatus: { not: "PAID" } },
    data: { paymentStatus: "PAID", paymentId: razorpay_payment_id, bookingStatus: "CONFIRMED" },
  });
  const paid = await prisma.booking.findUnique({ where: { id: bookingId }, include: bookingInclude });
  if (count === 0) {
    return apiResponse(res, 200, "Payment already verified", paid);
  }

  const route = `${paid.route.fromLocation.name} → ${paid.route.toLocation.name}`;
  const travelDate = new Date(paid.travelDate).toDateString();
  const summary = `
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${detailRow("Route", route)}
      ${detailRow("Vehicle", paid.carType.name)}
      ${detailRow("Date / Time", `${travelDate}${paid.travelTime ? " · " + paid.travelTime : ""}`)}
      ${detailRow("Passengers", String(paid.pax))}
      ${detailRow("Flight / Train", paid.flightDetails)}
      ${detailRow("Pickup address", paid.pickupAddress)}
      ${detailRow("Drop-off address", paid.dropAddress)}
      ${detailRow("Passenger", paid.customerName)}
      ${detailRow("Passenger email", paid.email)}
      ${detailRow("Passenger phone", paid.phone)}
      ${detailRow("Agent contact", paid.agentContact)}
      ${detailRow("Agent email", paid.agentEmail)}
      ${detailRow("Paid", `₹${paid.amountInr ?? ""} (EUR ${paid.price})`)}
      ${detailRow("Payment ID", razorpay_payment_id)}
    </table>`;
  const wrap = (title, intro) => `
    <div style="font-family:Arial,sans-serif;padding:24px;color:#0B1528;background:#f8fafc;">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;padding:24px;border:1px solid #e2e8f0;">
        <h2 style="color:#060C17;margin-top:0;">${title}</h2>${intro}${summary}
      </div>
    </div>`;

  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.BREVO_SMTP_USER || "info@theeuropetransfers.com";
    await sendEmail({ to: adminEmail, subject: `Transfer Booking Paid: ${route}`, html: wrap("New paid transfer booking", "") });
  } catch (err) {
    console.error("Failed to send admin booking email:", err);
  }
  // Passenger gets the confirmation; the booking agent (if given) gets a copy.
  const recipients = [...new Set([paid.email, paid.agentEmail].filter(Boolean))];
  for (const to of recipients) {
    try {
      await sendEmail({
        to,
        subject: `Booking Confirmed - ${route}`,
        html: wrap("Booking Confirmed!", `<p style="font-size:14px;color:#475569;">Your private transfer payment was received. Our team will share driver details before pickup.</p>`),
      });
    } catch (err) {
      console.error("Failed to send booking confirmation email:", err);
    }
  }

  return apiResponse(res, 200, "Payment verified successfully", paid);
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
  });
  if (!order) {
    throw new ApiError(404, "Order not found");
  }
  return apiResponse(res, 200, "Order retrieved", order);
});

export const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, "Not authenticated");
  }

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return apiResponse(res, 200, "Orders retrieved", orders);
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;
  const status = req.query.status;
  const productType = req.query.productType;

  const where = {};
  if (status) where.status = status;
  if (productType) where.productType = productType;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return apiResponse(res, 200, "Orders retrieved", {
    items: orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status },
  });
  return apiResponse(res, 200, "Order updated", order);
});
