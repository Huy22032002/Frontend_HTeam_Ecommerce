/**
 * PayOS Payment Models - Separate from legacy Payment models
 * Do not modify existing Payment.ts
 */

// ============================================
// Request Models
// ============================================

export interface PayOSCheckoutRequest {
  orderId: number;
  orderCode: string;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  buyerName: string;
  buyerEmail?: string;
  buyerPhone: string;
  buyerAddress: string;
  items?: PayOSCheckoutItem[];
}

export interface PayOSCheckoutItem {
  name: string;
  quantity: number;
  price: number;
}

export interface PayOSCreatePaymentRequest {
  orderCode: number;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerAddress?: string;
}

// ============================================
// Response Models
// ============================================

export interface PayOSCreatePaymentResponse {
  code: string;
  message: string;
  data?: {
    bin: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    description: string;
    orderCode: number;
    qrCode: string;
    paymentLinkId: string;
    checkoutUrl: string;
    expiredAt: number;
  };
  signature?: string;
}

export interface PayOSPaymentStatus {
  code: string;
  message: string;
  data?: {
    id: string;
    orderCode: number;
    amount: number;
    amountPaid: number;
    amountRemaining: number;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
    createdAt: string;
    expiredAt: string;
    transactionDateTime?: string;
  };
  signature?: string;
}

export interface PayOSWebhookData {
  webhook: {
    id: string;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
    updatedAt: string;
    url: string;
  };
  data: {
    code: string;
    message: string;
    data?: {
      orderCode: number;
      amount: number;
      amountPaid: number;
      amountRemaining: number;
      status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
      createdAt: string;
      expiredAt: string;
      transactionDateTime?: string;
    };
  };
}

export interface PayOSWebhookResponse {
  code: string;
  message: string;
  data: any;
}

// ============================================
// Internal Payment State Models
// ============================================

export interface PayOSPaymentState {
  orderId: number;
  orderCode: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  paymentLinkId?: string;
  checkoutUrl?: string;
  qrCode?: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
  transactionId?: string;
  errorMessage?: string;
}

export interface PayOSCheckoutState {
  loading: boolean;
  error?: string;
  paymentState?: PayOSPaymentState;
  checkoutUrl?: string;
  isProcessing: boolean;
}

// ============================================
// Integration Models (for backend sync)
// ============================================

export interface PayOSPaymentVerification {
  orderId: number;
  paymentLinkId: string;
  transactionId?: string;
  amount: number;
  status: string;
  verifiedAt: string;
}

export interface PayOSPaymentCallback {
  orderCode: number;
  amount: number;
  amountPaid: number;
  amountRemaining: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
  expiredAt: string;
  transactionDateTime?: string;
}
