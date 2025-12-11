import axios from 'axios';
import { getCustomerToken } from '../../utils/tokenUtils';

const API_BASE = (import.meta.env.VITE_BASE_URL || "https://www.hecommerce.shop") + '/api/customers/payments';

function getAuthHeader() {
  const token = getCustomerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface PaymentInitiateRequest {
  orderId: number;
  paymentMethod: 'CASH' | 'TRANSFER' | 'CARD' | 'E_WALLET';
  totalAmount: number;
}

export interface PaymentResponse {
  id: string;
  orderId: number;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId?: string;
  paymentUrl?: string; // URL thanh toán online nếu có
  createdAt: string;
}

export const CustomerPaymentApi = {
  // Bắt đầu quá trình thanh toán
  initiatePayment: (request: PaymentInitiateRequest) =>
    axios.post(`${API_BASE}/initiate`, request, { headers: getAuthHeader() }),

  // Xác nhận thanh toán (sau khi callback từ payment gateway)
  confirmPayment: (orderId: number, transactionId: string) =>
    axios.post(
      `${API_BASE}/confirm`,
      { orderId, transactionId },
      { headers: getAuthHeader() }
    ),

  // Lấy trạng thái thanh toán
  getPaymentStatus: (orderId: number) =>
    axios.get(`${API_BASE}/status/${orderId}`, { headers: getAuthHeader() }),

  // Hủy thanh toán
  cancelPayment: (orderId: number) =>
    axios.post(`${API_BASE}/cancel/${orderId}`, {}, { headers: getAuthHeader() }),

  // Lấy lịch sử thanh toán của khách hàng
  getPaymentHistory: (page: number = 0, size: number = 10) =>
    axios.get(`${API_BASE}/history?page=${page}&size=${size}`, {
      headers: getAuthHeader(),
    }),
};
