"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { initRazorpay, type RazorpayResponse } from "@/lib/razorpay";
import { toast } from "sonner";

interface PaymentParams {
  productType: "SIGHTSEEING" | "PACKAGE" | "VAN_COACH";
  productId: string;
  productName: string;
  amount: number;
  currency?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  travelDate?: string;
  pax?: number;
  optionSelected?: string;
  notes?: string;
}

interface PaymentCallbacks {
  // Awaited right before the Razorpay popup opens. Lets the caller close a
  // modal (e.g. a Radix Dialog) that would otherwise lock pointer events and
  // focus, making the popup unclickable.
  onBeforeCheckout?: () => void | Promise<void>;
  // Called when checkout ends without a successful payment, so the caller
  // can bring its modal back.
  onCheckoutAborted?: () => void;
}

export function usePayment() {
  const [loading, setLoading] = useState(false);
  // Synchronous guard: state updates are async, so a fast double-click could
  // otherwise start two payments before `loading` re-renders as true.
  const inFlight = useRef(false);
  const { user } = useAuth();
  const router = useRouter();

  const initiatePayment = async (params: PaymentParams, callbacks: PaymentCallbacks = {}) => {
    if (!user) {
      toast.error("Please login to make a payment");
      router.push("/auth/login");
      return;
    }

    if (inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    try {
      const orderData = await api.post<{
        orderId: string;
        razorpayOrderId: string;
        amount: number;
        currency: string;
        key: string;
      }>("/payments/create-order", params);

      await callbacks.onBeforeCheckout?.();

      await initRazorpay({
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Europe Transfers",
        description: params.productName,
        order_id: orderData.razorpayOrderId,
        handler: async (response: RazorpayResponse) => {
          // The customer has already been charged at this point, so retry the
          // verification a few times before giving up - the server ignores
          // repeats, so a retry can never double-process the order.
          let verified = false;
          for (let attempt = 0; attempt < 3 && !verified; attempt++) {
            try {
              await api.post("/payments/verify-payment", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderData.orderId,
              });
              verified = true;
            } catch {
              await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
            }
          }
          if (verified) {
            toast.success("Payment successful! Booking confirmed.");
            router.push("/account#orders");
          } else {
            toast.error(
              `Payment received but confirmation is pending. Please do not pay again - contact support with payment ID ${response.razorpay_payment_id}.`,
              { duration: 15000 }
            );
          }
        },
        prefill: {
          name: params.customerName,
          email: params.customerEmail,
          contact: params.customerPhone,
        },
        theme: { color: "#D4A843" },
      });
    } catch (error) {
      callbacks.onCheckoutAborted?.();
      const err = error as { message?: string };
      if (err.message === "Payment cancelled by user") {
        toast.info("Payment cancelled");
      } else {
        console.error("Payment initiation failed:", error);
        toast.error("Failed to initiate payment. Please try again.");
      }
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  };

  return { initiatePayment, loading };
}
