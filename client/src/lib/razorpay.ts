declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: any) => any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    animation?: boolean;
    backdropclose?: boolean;
    confirm_close?: boolean;
  };
  notes?: Record<string, string>;
  // false stops Razorpay from reusing a phone number it saved in this
  // browser from an earlier payment ("Using as +91 ..."), so the number we
  // prefill is the one the OTP goes to.
  remember_customer?: boolean;
}

// Razorpay reads a bare number as Indian (+91). Send "+<country><digits>"
// with no spaces/dashes so the number the customer typed is used as-is.
export function toE164(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) return "";
  const digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+")) return `+${digits}`;
  if (trimmed.startsWith("00")) return `+${digits.slice(2)}`;
  return digits;
}

export interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function initRazorpay(options: RazorpayOptions): Promise<void> {
  const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
  if (!loaded) {
    throw new Error("Failed to load Razorpay SDK. Check your internet connection.");
  }

  return new Promise((resolve, reject) => {
    const originalHandler = options.handler;

    options.handler = (response) => {
      originalHandler?.(response);
      resolve();
    };

    options.modal = {
      ...options.modal,
      ondismiss: () => {
        reject(new Error("Payment cancelled by user"));
      },
      escape: true,
      backdropclose: false,
    };

    const rzp = new window.Razorpay({ remember_customer: false, ...options });

    rzp.on?.("payment.failed", (response: { error: { description: string } }) => {
      reject(new Error(response.error.description || "Payment failed"));
    });

    rzp.open();
  });
}
