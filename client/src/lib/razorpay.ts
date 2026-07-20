declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
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
  };
  notes?: Record<string, string>;
}

export interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (response: { error: { description: string } }) => void) => void;
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

export async function initRazorpay(options: RazorpayOptions): Promise<boolean> {
  const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
  if (!loaded) {
    throw new Error("Failed to load Razorpay SDK. Check your internet connection.");
  }

  const rzp = new window.Razorpay(options);

  return new Promise((resolve, reject) => {
    const originalHandler = options.handler;
    options.handler = (response) => {
      originalHandler?.(response);
      resolve(true);
    };

    rzp.on("payment.failed", (response: { error: { description: string } }) => {
      reject(new Error(response.error.description || "Payment failed"));
    });

    options.modal = {
      ...options.modal,
      ondismiss: () => {
        reject(new Error("Payment cancelled by user"));
      },
    };

    rzp.open();
  });
}
