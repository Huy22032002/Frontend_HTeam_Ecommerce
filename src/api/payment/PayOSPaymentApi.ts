import axios from 'axios';
import type {
  PayOSCheckoutRequest,
  PayOSPaymentCallback,
} from '../../models/payments/PayOSPayment';

const API_BASE = import.meta.env.VITE_BASE_URL + '/api/customers/payos';

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * PayOS Payment API Client
 * Separate from legacy payment methods - creates standalone PayOS payment flow
 * Does not modify existing payment models or endpoints
 */
export const PayOSPaymentApi = {
  /**
   * Initiate a PayOS payment
   * Creates a payment link and returns checkout details
   */
  initiatePayment: (request: PayOSCheckoutRequest) =>
    axios.post(`${API_BASE}/initiate`, request, { headers: getAuthHeader() }),

  /**
   * Get payment link details
   * Retrieves current status and details of a payment link
   */
  getPaymentLink: (paymentLinkId: string) =>
    axios.get(`${API_BASE}/payment-link/${paymentLinkId}`, { headers: getAuthHeader() }),

  /**
   * Verify payment status from PayOS
   * Checks if payment was completed successfully
   */
  verifyPayment: (orderId: number) =>
    axios.get(`${API_BASE}/verify/${orderId}`, { headers: getAuthHeader() }),

  /**
   * Get payment status for an order
   * Returns current payment status and details
   */
  getPaymentStatus: (orderId: number) =>
    axios.get(`${API_BASE}/status/${orderId}`, { headers: getAuthHeader() }),

  /**
   * Cancel a PayOS payment
   * Cancels an active payment link
   */
  cancelPayment: (orderId: number) =>
    axios.post(`${API_BASE}/cancel/${orderId}`, {}, { headers: getAuthHeader() }),

  /**
   * Handle webhook callback from PayOS
   * Backend endpoint that receives payment notifications
   * Frontend can use this to verify payment status after redirect
   */
  handleWebhookCallback: (callbackData: PayOSPaymentCallback) =>
    axios.post(`${API_BASE}/webhook/callback`, callbackData, { headers: getAuthHeader() }),

  /**
   * Confirm payment after successful redirect
   * Called when user is redirected back from PayOS checkout
   */
  confirmPaymentAfterCheckout: (orderId: number, paymentLinkId: string) =>
    axios.post(
      `${API_BASE}/confirm`,
      { orderId, paymentLinkId },
      { headers: getAuthHeader() }
    ),

  /**
   * Get payment history with PayOS
   * Retrieves list of all PayOS payments for current customer
   */
  getPaymentHistory: (page: number = 0, size: number = 10) =>
    axios.get(`${API_BASE}/history?page=${page}&size=${size}`, { headers: getAuthHeader() }),

  /**
   * Get recent payment (for checking status after redirect)
   * Useful when navigating back from PayOS
   */
  getRecentPayment: (orderId: number) =>
    axios.get(`${API_BASE}/recent/${orderId}`, { headers: getAuthHeader() }),
};
