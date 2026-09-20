import React, { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';

export interface RazorpaySuccessPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutButtonProps {
  /** Amount to charge in paise (e.g., 50000 = ₹500.00). Must be >= 100. */
  amountInPaise?: number;
  /** Amount in Rupees (converted to paise automatically). Used if amountInPaise not provided. */
  amountInRupees?: number;
  currency?: string;
  receipt?: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  buttonText?: string;
  className?: string;
  disabled?: boolean;
  onSuccess?: (payload: RazorpaySuccessPayload) => void;
  onError?: (error: Error | string) => void;
  onDismiss?: () => void;
  children?: React.ReactNode;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const RazorpayCheckoutButton: React.FC<RazorpayCheckoutButtonProps> = ({
  amountInPaise,
  amountInRupees,
  currency = 'INR',
  receipt,
  name = 'Bingooo Luxury Streetwear',
  description = 'Order Payment',
  prefill,
  buttonText,
  className,
  disabled = false,
  onSuccess,
  onError,
  onDismiss,
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const calculatePaise = (): number => {
    if (amountInPaise !== undefined) {
      return Math.round(amountInPaise);
    }
    if (amountInRupees !== undefined) {
      return Math.round(amountInRupees * 100);
    }
    return 10000; // default 10000 paise = ₹100
  };

  const handleCheckout = async () => {
    const finalPaise = calculatePaise();
    if (finalPaise < 100) {
      const err = new Error('Amount must be at least 100 paise (₹1.00)');
      onError?.(err);
      alert('Amount must be at least 100 paise (₹1.00)');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Ensure Razorpay SDK script is ready
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady || !(window as any).Razorpay) {
        throw new Error('Failed to load Razorpay Checkout SDK. Please check your internet connection.');
      }

      // 2. STEP 1: Call Backend to Create Order (POST /api/create-order)
      const apiUrl = import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/create-order`
        : '/api/create-order';

      const createOrderRes = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          amount: finalPaise,
          currency: currency.toUpperCase(),
          receipt: receipt || `rcpt_${Date.now()}`,
        }),
      });

      if (!createOrderRes.ok) {
        const errJson = await createOrderRes.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || errJson?.message || 'Failed to create Razorpay order';
        throw new Error(errMsg);
      }

      const orderData = await createOrderRes.json();
      const orderId = orderData.order_id || orderData.data?.order_id || orderData.data?.razorpayOrderId;

      if (!orderId) {
        throw new Error('Backend failed to return a valid Razorpay order ID.');
      }

      const keyId =
        orderData.keyId ||
        orderData.data?.keyId ||
        import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!keyId) {
        throw new Error('Razorpay Key ID is not configured on frontend or backend.');
      }

      // 3. STEP 2: Configure & Open Razorpay Standard Checkout Modal
      const options: any = {
        key: keyId,
        amount: orderData.amount || orderData.data?.amount || finalPaise,
        currency: (orderData.currency || orderData.data?.currency || currency).toUpperCase(),
        name,
        description,
        order_id: orderId,
        prefill: {
          name: prefill?.name || '',
          email: prefill?.email || '',
          contact: prefill?.contact || '',
        },
        theme: {
          color: '#E6321C', // Bingooo brand red
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // 4. STEP 3: Call Backend to Verify Payment Signature (POST /api/verify-payment)
            const verifyUrl = import.meta.env.VITE_API_URL
              ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/verify-payment`
              : '/api/verify-payment';

            const verifyRes = await fetch(verifyUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json().catch(() => ({}));

            if (!verifyRes.ok || verifyData.success === false) {
              const errMsg =
                verifyData?.error?.message ||
                verifyData?.message ||
                'Payment signature verification failed. Please contact support.';
              throw new Error(errMsg);
            }

            onSuccess?.(response);
          } catch (verifyErr: any) {
            onError?.(verifyErr);
          } finally {
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            onDismiss?.();
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on('payment.failed', (failResponse: any) => {
        setIsLoading(false);
        const desc =
          failResponse?.error?.description ||
          failResponse?.error?.reason ||
          'Payment failed. Please try again.';
        onError?.(new Error(desc));
      });

      rzp.open();
    } catch (err: any) {
      setIsLoading(false);
      onError?.(err);
    }
  };

  const displayAmount = (calculatePaise() / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={disabled || isLoading}
      className={
        className ||
        'inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-semibold text-sm rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed'
      }
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing Checkout...</span>
        </>
      ) : children ? (
        children
      ) : (
        <>
          <CreditCard className="w-4 h-4" />
          <span>{buttonText || `Pay with Razorpay (${displayAmount})`}</span>
        </>
      )}
    </button>
  );
};
