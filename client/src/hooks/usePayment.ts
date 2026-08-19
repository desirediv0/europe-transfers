"use client";

import { useState } from "react";
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

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const initiatePayment = async (params: PaymentParams) => {
    if (!user) {
      toast.error("Please login to make a payment");
      router.push("/auth/login");
      return;
    }

    setLoading(true);
    try {
      const orderData = await api.post<{
        orderId: string;
        razorpayOrderId: string;
        amount: number;
        currency: string;
        key: string;
      }>("/payments/create-order", params);

      await initRazorpay({
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Europe Transfers",
        description: params.productName,
        order_id: orderData.razorpayOrderId,
        handler: async (response: RazorpayResponse) => {
          try {
            await api.post("/payments/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderData.orderId,
            });
            toast.success("Payment successful! Booking confirmed.");
            router.push("/account/orders");
          } catch {
            toast.error("Payment verification failed. Please contact support.");
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
      const err = error as { message?: string };
      if (err.message === "Payment cancelled by user") {
        toast.info("Payment cancelled");
      } else {
        console.error("Payment initiation failed:", error);
        toast.error("Failed to initiate payment. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { initiatePayment, loading };
}
