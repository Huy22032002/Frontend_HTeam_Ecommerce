import { useState, useCallback, useRef, useEffect } from 'react';
import type { PayOSCheckoutRequest, PayOSPaymentState } from '../models/payments/PayOSPayment';
import { PayOSPaymentApi } from '../api/payment/PayOSPaymentApi';
import {
  storePayOSPaymentState,
  getPayOSPaymentState,
  clearPayOSPaymentState,
  incrementPaymentRetryCount,
  clearPaymentRetryCount,
  isPaymentExpired,
  getPayOSErrorMessage,
  isValidPayOSCheckoutUrl,
} from '../utils/payosUtils';

export interface PayOSCheckoutHookState {
  loading: boolean;
  error: string | null;
  success: boolean;
  paymentState: PayOSPaymentState | null;
  checkoutUrl: string | null;
  isProcessing: boolean;
}

export interface UsePayOSCheckoutResult {
  state: PayOSCheckoutHookState;
  initiatePayment: (request: PayOSCheckoutRequest) => Promise<void>;
  verifyPayment: (orderId: number) => Promise<void>;
  retryPayment: (orderId: number) => Promise<void>;
  cancelPayment: (orderId: number) => Promise<void>;
  resetState: () => void;
  redirectToCheckout: (checkoutUrl: string) => void;
}

/**
 * Hook for managing PayOS checkout flow
 * Handles payment initiation, verification, retry logic, and error handling
 * Completely separate from legacy payment flows
 */
export const usePayOSCheckout = (): UsePayOSCheckoutResult => {
  const [state, setState] = useState<PayOSCheckoutHookState>({
    loading: false,
    error: null,
    success: false,
    paymentState: null,
    checkoutUrl: null,
    isProcessing: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Initiate PayOS payment
   * Creates payment link and prepares checkout
   */
  const initiatePayment = useCallback(
    async (request: PayOSCheckoutRequest) => {
      try {
        setState((prev) => ({
          ...prev,
          loading: true,
          error: null,
          isProcessing: true,
        }));

        // Validate request
        if (!request.orderId || !request.amount || request.amount <= 0) {
          throw new Error('Invalid payment request: orderId and amount are required');
        }

        // Call API to initiate payment
        const response = await PayOSPaymentApi.initiatePayment(request);
        const paymentData = response.data?.data;

        if (!paymentData || !paymentData.checkoutUrl) {
          throw new Error('Failed to create payment link');
        }

        // Store payment state locally for recovery
        const paymentState: PayOSPaymentState = {
          orderId: request.orderId,
          orderCode: request.orderCode,
          status: 'PENDING',
          paymentLinkId: paymentData.paymentLinkId,
          checkoutUrl: paymentData.checkoutUrl,
          qrCode: paymentData.qrCode,
          amount: request.amount,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        storePayOSPaymentState(request.orderId, paymentState);
        clearPaymentRetryCount(request.orderId);

        setState((prev) => ({
          ...prev,
          loading: false,
          success: true,
          paymentState,
          checkoutUrl: paymentData.checkoutUrl,
          isProcessing: false,
        }));
      } catch (err: any) {
        const errorMessage = getPayOSErrorMessage(err);
        console.error('PayOS payment initiation error:', err);

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          isProcessing: false,
        }));
      }
    },
    []
  );

  /**
   * Verify payment status with PayOS
   * Called after user completes/cancels checkout
   */
  const verifyPayment = useCallback(async (orderId: number) => {
    try {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        isProcessing: true,
      }));

      const response = await PayOSPaymentApi.verifyPayment(orderId);
      const paymentData = response.data?.data;

      if (!paymentData) {
        throw new Error('Payment verification failed');
      }

      // Map PayOS status to application status
      const statusMap: Record<string, PayOSPaymentState['status']> = {
        COMPLETED: 'COMPLETED',
        PAID: 'COMPLETED',
        PENDING: 'PENDING',
        PROCESSING: 'PENDING',
        CANCELLED: 'CANCELLED',
        EXPIRED: 'FAILED',
        FAILED: 'FAILED',
      };

      const applicationStatus = statusMap[paymentData.status] || 'PENDING';

      const updatedPaymentState: PayOSPaymentState = {
        orderId,
        orderCode: String(paymentData.orderCode),
        status: applicationStatus,
        paymentLinkId: paymentData.id,
        amount: paymentData.amount,
        createdAt: paymentData.createdAt,
        updatedAt: new Date().toISOString(),
        transactionId: paymentData.id,
      };

      storePayOSPaymentState(orderId, updatedPaymentState);

      setState((prev) => ({
        ...prev,
        loading: false,
        success: applicationStatus === 'COMPLETED',
        error: applicationStatus === 'FAILED' ? 'Thanh toán thất bại' : null,
        paymentState: updatedPaymentState,
        isProcessing: false,
      }));
    } catch (err: any) {
      const errorMessage = getPayOSErrorMessage(err);
      console.error('PayOS verification error:', err);

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
        isProcessing: false,
      }));
    }
  }, []);

  /**
   * Retry payment with retry limit
   * Allows user to retry failed payments
   */
  const retryPayment = useCallback(
    async (orderId: number) => {
      try {
        // Check retry limit
        if (!incrementPaymentRetryCount(orderId, 3)) {
          setState((prev) => ({
            ...prev,
            error: 'Đã vượt quá số lần thử lại tối đa (3 lần). Vui lòng liên hệ hỗ trợ.',
          }));
          return;
        }

        // Get stored payment state
        const storedState = getPayOSPaymentState(orderId);
        if (!storedState) {
          throw new Error('Payment state not found');
        }

        // Check if payment is expired
        if (storedState.createdAt && isPaymentExpired(Math.floor(new Date(storedState.createdAt).getTime() / 1000) + 3600)) {
          throw new Error('Payment link expired. Please create a new payment.');
        }

        // Retry verification
        await verifyPayment(orderId);
      } catch (err: any) {
        const errorMessage = getPayOSErrorMessage(err);
        setState((prev) => ({
          ...prev,
          error: errorMessage,
        }));
      }
    },
    [verifyPayment]
  );

  /**
   * Cancel payment
   */
  const cancelPayment = useCallback(async (orderId: number) => {
    try {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      await PayOSPaymentApi.cancelPayment(orderId);
      clearPayOSPaymentState(orderId);
      clearPaymentRetryCount(orderId);

      setState((prev) => ({
        ...prev,
        loading: false,
        success: false,
        error: 'Thanh toán đã bị hủy',
        paymentState: null,
        checkoutUrl: null,
      }));
    } catch (err: any) {
      const errorMessage = getPayOSErrorMessage(err);
      console.error('PayOS cancel error:', err);

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, []);

  /**
   * Reset state
   */
  const resetState = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
      paymentState: null,
      checkoutUrl: null,
      isProcessing: false,
    });
  }, []);

  /**
   * Redirect to PayOS checkout
   */
  const redirectToCheckout = useCallback((checkoutUrl: string) => {
    if (isValidPayOSCheckoutUrl(checkoutUrl)) {
      window.location.href = checkoutUrl;
    } else {
      setState((prev) => ({
        ...prev,
        error: 'Invalid checkout URL',
      }));
    }
  }, []);

  return {
    state,
    initiatePayment,
    verifyPayment,
    retryPayment,
    cancelPayment,
    resetState,
    redirectToCheckout,
  };
};
